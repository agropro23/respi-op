import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, Typography, CircularProgress, Container, Paper, Grid, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Checkbox, Radio, RadioGroup, FormControlLabel
} from '@mui/material';
import { Edit, Delete, Visibility, Add } from '@mui/icons-material';
import './actualPatchScroll.css';

const BASE_URL = process.env.REACT_APP_CLIENT_BASE_URL;

export default function ActualPatchTest() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allergens, setAllergens] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [errorDialog, setErrorDialog] = useState({ open: false, message: '' });
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [existingReportId, setExistingReportId] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newAllergenName, setNewAllergenName] = useState('');
  const [addError, setAddError] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editAllergenId, setEditAllergenId] = useState(null);
  const [editAllergenName, setEditAllergenName] = useState('');
  const [editError, setEditError] = useState('');
  const [allergenResults, setAllergenResults] = useState({});
  const [allergenChecks, setAllergenChecks] = useState({});
  const [savePatchTestStatus, setSavePatchTestStatus] = useState({ open: false, message: '', severity: 'success' });
  const [advice, setAdvice] = useState('');
  const [doctorSelectOpen, setDoctorSelectOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('vipul');
  const [pendingRedirect, setPendingRedirect] = useState(false);


  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await apiFetch(`${BASE_URL}/api/patients/${patientId}`);
        if (!response.ok) throw new Error('Failed to fetch patient');
        const data = await response.json();
        setPatient(data.patient || data);
      } catch (err) {
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [patientId]);

  const fetchAllergenList = async () => {
    try {
      const response = await apiFetch(`${BASE_URL}/api/actual-patch-testing`);
      if (!response.ok) throw new Error('Failed to fetch allergens');
      const data = await response.json();
      // Sort allergens alphabetically by allergen name
      const sortedData = data.sort((a, b) => a.allergen.localeCompare(b.allergen));
      setAllergens(sortedData);
    } catch (err) {
      setAddError('Could not load allergens');
    }
  };

  const handleCloseErrorDialog = () => {
    setErrorDialog({ open: false, message: '' });
  };

  const handleCloseConflictDialog = () => {
    setShowConflictDialog(false);
    setExistingReportId(null);
  };

  const handleDeleteAndCreate = async () => {
    handleCloseConflictDialog();
    try {
      const deleteResponse = await apiFetch(`${BASE_URL}/api/patient-patch-test/${existingReportId}`, {
        method: 'DELETE',
      });
      if (!deleteResponse.ok) {
        const deleteData = await deleteResponse.json();
        throw new Error(deleteData.message || 'Failed to delete existing report');
      }
      
      // Only include allergies that have results filled
      const allergiesToSave = allergens
        .map(row => ({ 
          allergy: row.allergen, 
          result: allergenResults[row._id] || '',
          check: !!allergenChecks[row._id]
        }))
        .filter(item => item.result.trim() !== '');
      
      const createResponse = await apiFetch(`${BASE_URL}/api/patient-patch-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient._id,
          date: selectedDate,
          allergies: allergiesToSave,
          advice: advice
        })
      });
      
      const createData = await createResponse.json();
      if (!createResponse.ok) {
        throw new Error(createData.message || 'Failed to save new report after deletion');
      }
      
      setSavePatchTestStatus({
        open: true,
        message: 'Existing report deleted and new report saved successfully!',
        severity: 'success'
      });
      setPendingRedirect(true);
      setDoctorSelectOpen(true);
    } catch (err) {
      setSavePatchTestStatus({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleDownloadExisting = async () => {
    handleCloseConflictDialog();
    if (!existingReportId || !patient?.patientId) {
      setSavePatchTestStatus({
        open: true,
        message: 'Cannot download existing report: Missing ID or patient ID.',
        severity: 'error'
      });
      return;
    }
    
    console.log('Downloading existing report with ID:', existingReportId);
    console.log('Patient ID:', patient?.patientId);
    
    try {
      const response = await apiFetch(`${BASE_URL}/api/patient-patch-test/${existingReportId}`);
      console.log('Download response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Download error data:', errorData);
        throw new Error(errorData.message || 'Failed to fetch existing report data for download');
      }
      
      const reportData = await response.json();
      console.log('Downloaded report data:', reportData);
      
      // Transform the data to match the report format
      const transformedData = {
        ...reportData,
        basicInfo: patient?.basicInfo || {},
        examination: patient?.examination || {},
        patientID: patient?.patientId || patientId,
      };
      
      console.log('Transformed data for PDF:', transformedData);
      
      // Use PatchReport component for download
      const { pdf } = await import('@react-pdf/renderer');
      const PatchReport = (await import('../utils/PatchReport')).default;
      
      const blob = await pdf(<PatchReport data={transformedData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patch_test_report-${patient.patientId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSavePatchTestStatus({
        open: true,
        message: 'Existing report downloaded successfully!',
        severity: 'success'
      });
      // No redirect after download - user stays on the same page
    } catch (err) {
      console.error('Error downloading existing report:', err);
      setSavePatchTestStatus({ open: true, message: err.message, severity: 'error' });
    }
  };

  useEffect(() => {
    fetchAllergenList();
  }, []);

  const handleAddAllergen = async () => {
    setAddError('');
    if (!newAllergenName.trim()) {
      setAddError('Allergen name is required');
      return;
    }
    try {
      const response = await apiFetch(`${BASE_URL}/api/actual-patch-testing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allergen: newAllergenName.trim() })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add allergen');
      }
      setNewAllergenName('');
      setAddDialogOpen(false);
      fetchAllergenList();
    } catch (err) {
      setAddError(err.message);
    }
  };

  const handleDeleteAllergen = async (id) => {
    try {
      const response = await apiFetch(`${BASE_URL}/api/actual-patch-testing/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete allergen');
      }
      fetchAllergenList();
    } catch (err) {
      setAddError(err.message);
    }
  };

  const handleEditAllergenOpen = (row) => {
    setEditAllergenId(row._id);
    setEditAllergenName(row.allergen);
    setEditError('');
    setEditDialogOpen(true);
  };

  const handleEditAllergenSave = async () => {
    setEditError('');
    if (!editAllergenName.trim()) {
      setEditError('Allergen name is required');
      return;
    }
    try {
      const response = await apiFetch(`${BASE_URL}/api/actual-patch-testing/${editAllergenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allergen: editAllergenName.trim() })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update allergen');
      }
      setEditDialogOpen(false);
      fetchAllergenList();
    } catch (err) {
      setEditError(err.message);
    }
  };

  const handleResultChange = (id, value) => {
    setAllergenResults(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckChange = (id) => {
    setAllergenChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSavePatchTest = async () => {
    if (!patient?._id) {
      setSavePatchTestStatus({ open: true, message: 'Patient not loaded', severity: 'error' });
      return;
    }
    
    // Validate that patient._id is a valid ObjectId
    if (typeof patient._id !== 'string' || patient._id.length !== 24) {
      setSavePatchTestStatus({ open: true, message: 'Invalid patient ID format', severity: 'error' });
      return;
    }
    
    // Only include allergies that have results filled
    const allergiesToSave = allergens
      .map(row => ({ 
        allergy: row.allergen, 
        result: allergenResults[row._id] || '',
        check: !!allergenChecks[row._id]
      }))
      .filter(item => item.result.trim() !== ''); // Only include items with non-empty results
    
    if (allergiesToSave.length === 0) {
      setSavePatchTestStatus({ open: true, message: 'Please enter result for at least one allergy', severity: 'error' });
      return;
    }
    
    console.log('Saving patch test with data:', {
      patientId: patient._id,
      date: selectedDate,
      allergies: allergiesToSave
    });
    
    try {
      const response = await apiFetch(`${BASE_URL}/api/patient-patch-test`, {     
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient._id, // Ensure this is the MongoDB ObjectId
          date: selectedDate,
          allergies: allergiesToSave,
          advice: advice
        })
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        if (response.status === 409 && data.existingReportId) {
          console.log('Conflict detected, showing dialog with existingReportId:', data.existingReportId);
          setExistingReportId(data.existingReportId);
          setShowConflictDialog(true);
          return;
        } else {
          throw new Error(data.message || 'Failed to save patch test');
        }
      }
      
      setSavePatchTestStatus({ open: true, message: 'Patch test saved successfully!', severity: 'success' });
      setPendingRedirect(true);
      setDoctorSelectOpen(true);
    } catch (err) {
      console.error('Error saving patch test:', err);
      setErrorDialog({ open: true, message: err.message });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      {/* Header with back button and title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            onClick={() => navigate('/patients')}
            sx={{ minWidth: 0, padding: 0, marginRight: 1, color: '#111', background: 'none', boxShadow: 'none', '&:hover': { background: 'none' } }}
            disableRipple
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Button>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700, fontSize: 28, color: '#111', ml: 1 }}>
            Patch Test
          </Typography>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Button
            variant="contained"
            style={{
              fontWeight: 600,
              fontSize: 16,
              borderRadius: 8,
              backgroundColor: '#2563eb',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
              textTransform: 'none',
              padding: '10px 32px',
              minWidth: 170
            }}
            onClick={() => setDoctorSelectOpen(true)}
          >
            View Report
          </Button>
        </div>
      </div>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(37,99,235,0.07)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField label="Patient's name" value={patient?.basicInfo?.name || ''} fullWidth InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField label="Age/Sex" value={`${patient?.basicInfo?.age || ''}/${patient?.basicInfo?.sex || ''}`} fullWidth InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField label="PEFR" value={patient?.examination?.pefr || ''} fullWidth InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField label="SpO2" value={patient?.examination?.spo2 || ''} fullWidth InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField label="Pt. Code" value={patient?.patientId || ''} fullWidth InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={6} sm={3} md={1}>
            <TextField
              label="Date"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Allergen Table Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(37,99,235,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#2563eb', mb: 0, letterSpacing: 0.5 }}>Allergies</Typography>
          <div style={{ display: 'flex', gap: 16 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              style={{
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 8,
                backgroundColor: '#2563eb',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                textTransform: 'none',
                padding: '10px 32px',
                minWidth: 170
              }}
              onClick={() => setAddDialogOpen(true)}
            >
              Add Allergy
            </Button>
            <Button
              variant="contained"
              style={{
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 8,
                backgroundColor: '#2563eb',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                textTransform: 'none',
                padding: '10px 32px',
                minWidth: 170
              }}
              onClick={() => setViewDialogOpen(true)}
            >
              View Allergy
            </Button>
          </div>
        </div>
        <div className="actualpatch-scroll-container">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sr No.</TableCell>
                  <TableCell>Allergy</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>Select</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allergens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ color: '#888' }}>
                      No allergies added yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  allergens.map((row, idx) => (
                    <TableRow key={row._id || idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{row.allergen}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={allergenResults[row._id] || ''}
                          onChange={e => handleResultChange(row._id, e.target.value)}
                          placeholder="Enter result"
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={!!allergenChecks[row._id]}
                          onChange={() => handleCheckChange(row._id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Paper>

      {/* Advice Box Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(37,99,235,0.07)' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#2563eb', mb: 2, letterSpacing: 0.5 }}>Advice</Typography>
        <TextField
          label="Advice"
          value={advice}
          onChange={e => setAdvice(e.target.value)}
          placeholder="Enter advice for the patient"
          fullWidth
          multiline
          minRows={2}
          maxRows={6}
        />
      </Paper>

      {/* Save Patch Test Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <Button
          variant="contained"
          style={{
            fontWeight: 600,
            fontSize: 16,
            borderRadius: 8,
            backgroundColor: '#2563eb',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
            textTransform: 'none',
            padding: '8px 28px',
            marginLeft: 8
          }}
          onClick={handleSavePatchTest}
        >
          Save Patch Test
        </Button>
      </div>

      {/* Save Patch Test Snackbar */}
      <Snackbar
        open={savePatchTestStatus.open}
        autoHideDuration={6000}
        onClose={() => setSavePatchTestStatus({ ...savePatchTestStatus, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSavePatchTestStatus({ ...savePatchTestStatus, open: false })}
          severity={savePatchTestStatus.severity}
          sx={{ width: '100%' }}
        >
          {savePatchTestStatus.message}
        </Alert>
      </Snackbar>

      {/* Conflict Dialog */}
      <Dialog
        open={showConflictDialog}
        onClose={handleCloseConflictDialog}
        aria-labelledby="conflict-dialog-title"
        aria-describedby="conflict-dialog-description"
      >
        <DialogTitle id="conflict-dialog-title">Report Already Exists</DialogTitle>
        <DialogContent>
          <DialogContentText id="conflict-dialog-description">
            A patch test report already exists for this patient. What would you like to do?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDownloadExisting} color="primary">Download Existing</Button>
          <Button onClick={handleDeleteAndCreate} color="secondary" autoFocus>Delete Existing and Create New</Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog
        open={errorDialog.open}
        onClose={handleCloseErrorDialog}
        aria-labelledby="error-dialog-title"
        aria-describedby="error-dialog-description"
      >
        <DialogTitle id="error-dialog-title">Error</DialogTitle>
        <DialogContent>
          <DialogContentText id="error-dialog-description">
            {errorDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseErrorDialog} color="primary">Close</Button>
          {errorDialog.message.includes('allergens') && (
            <Button 
              onClick={() => {
                handleCloseErrorDialog();
                fetchAllergenList();
              }} 
              color="secondary"
            >
              Retry
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Add Allergy Dialog */}
      <Dialog open={addDialogOpen} onClose={() => { setAddDialogOpen(false); setAddError(''); }} PaperProps={{ style: { borderRadius: 16, padding: 0, minWidth: 400 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#2563eb', fontSize: 22, pb: 0 }}>Add Allergy</DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Allergy Name"
            fullWidth
            value={newAllergenName}
            onChange={e => setNewAllergenName(e.target.value)}
            error={!!addError}
            helperText={addError}
            sx={{ fontSize: 18, mb: 2 }}
            InputProps={{ style: { fontSize: 18, borderRadius: 8, padding: 12 } }}
          />
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 3 }}>
          <Button
            onClick={() => { setAddDialogOpen(false); setAddError(''); }}
            style={{ fontWeight: 600, fontSize: 15, borderRadius: 8, color: '#64748b', backgroundColor: '#f1f5f9', textTransform: 'none', padding: '6px 18px', marginRight: 8 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            style={{ fontWeight: 600, fontSize: 15, borderRadius: 8, backgroundColor: '#2563eb', color: '#fff', textTransform: 'none', padding: '6px 18px' }}
            onClick={handleAddAllergen}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Allergy Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ style: { borderRadius: 16, padding: 0, minWidth: 500 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#2563eb', fontSize: 22, pb: 0 }}>Allergy List</DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 2 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow style={{ background: '#f1f5f9' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: 15, color: '#2563eb' }}>Sr No.</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 15, color: '#2563eb' }}>Allergy</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 15, color: '#2563eb' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allergens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ color: '#888' }}>
                      No allergies added yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  allergens.map((row, idx) => (
                    <TableRow key={row._id || idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <TableCell sx={{ fontSize: 15 }}>{idx + 1}</TableCell>
                      <TableCell sx={{ fontSize: 15 }}>{row.allergen}</TableCell>
                      <TableCell align="center">
                        <IconButton color="primary" size="small" onClick={() => handleEditAllergenOpen(row)}><Edit /></IconButton>
                        <IconButton color="error" size="small" onClick={() => handleDeleteAllergen(row._id)}><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 3 }}>
          <Button
            onClick={() => setViewDialogOpen(false)}
            style={{ fontWeight: 600, fontSize: 15, borderRadius: 8, color: '#64748b', backgroundColor: '#f1f5f9', textTransform: 'none', padding: '6px 18px', marginRight: 8 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Allergen Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Allergen</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Allergen Name"
            fullWidth
            value={editAllergenName}
            onChange={e => setEditAllergenName(e.target.value)}
            error={!!editError}
            helperText={editError}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            style={{
              fontWeight: 600,
              fontSize: 15,
              borderRadius: 8,
              backgroundColor: '#2563eb',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
              textTransform: 'none',
              padding: '6px 18px',
              marginLeft: 8
            }}
            onClick={handleEditAllergenSave}
          >
            Save
          </Button>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Doctor Selection Modal */}
      {doctorSelectOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
              width: 'calc(100% - 64px)',
              maxWidth: '420px',
              margin: '20px',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '0 0 24px 0'
            }}
          >
            <div
              style={{
                padding: '20px 28px 0 28px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
                borderRadius: '12px 12px 0 0'
              }}
            >
              <h5 className="mb-0" style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>Select Doctor for Report</h5>
              <button
                onClick={() => setDoctorSelectOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#64748b',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={e => {
                  e.target.style.backgroundColor = '#f1f5f9';
                  e.target.style.color = '#475569';
                }}
                onMouseLeave={e => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#64748b';
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div style={{ padding: '28px 28px 0 28px' }}>
              <div style={{ fontWeight: 600, fontSize: 16, color: '#1e293b', marginBottom: 18 }}>Doctor's name to be included</div>
              <div className="mb-4">
                <div className="form-check" style={{ marginBottom: '16px' }}>
                  <input
                    className="form-check-input"
                    type="radio"
                    id="doctor-vipul"
                    name="doctor"
                    value="vipul"
                    checked={selectedDoctor === 'vipul'}
                    onChange={() => setSelectedDoctor('vipul')}
                    style={{ width: '18px', height: '18px', marginRight: '12px', accentColor: '#2563eb' }}
                  />
                  <label className="form-check-label" htmlFor="doctor-vipul" style={{ fontSize: '15px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>
                    Dr. Vipul Shah
                  </label>
                </div>
                <div className="form-check" style={{ marginBottom: '16px' }}>
                  <input
                    className="form-check-input"
                    type="radio"
                    id="doctor-eshita"
                    name="doctor"
                    value="eshita"
                    checked={selectedDoctor === 'eshita'}
                    onChange={() => setSelectedDoctor('eshita')}
                    style={{ width: '18px', height: '18px', marginRight: '12px', accentColor: '#2563eb' }}
                  />
                  <label className="form-check-label" htmlFor="doctor-eshita" style={{ fontSize: '15px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>
                    Dr. Eshita Shah
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="doctor-both"
                    name="doctor"
                    value="both"
                    checked={selectedDoctor === 'both'}
                    onChange={() => setSelectedDoctor('both')}
                    style={{ width: '18px', height: '18px', marginRight: '12px', accentColor: '#2563eb' }}
                  />
                  <label className="form-check-label" htmlFor="doctor-both" style={{ fontSize: '15px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>
                    Both (Dr. Vipul Shah & Dr. Eshita Shah)
                  </label>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '28px', marginTop: '-25px', marginBottom: '-20px' }}>
              <button
                type="button"
                onClick={() => setDoctorSelectOpen(false)}
                className="btn btn-outline-secondary px-4 py-2"
                style={{
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  color: '#64748b',
                  fontWeight: '500',
                  transition: 'all 0.2s ease-in-out',
                  fontSize: '15px',
                  backgroundColor: '#ffffff',
                  padding: '8px 28px'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setDoctorSelectOpen(false);
                  if (pendingRedirect) {
                    setPendingRedirect(false);
                    navigate(`/patch-test-report/${patientId}`, { state: { selectedDoctor } });
                  } else {
                    navigate(`/patch-test-report/${patientId}`, { state: { selectedDoctor } });
                  }
                }}
                className="btn btn-primary px-4 py-2"
                style={{
                  borderRadius: '6px',
                  backgroundColor: '#2563eb',
                  border: 'none',
                  fontWeight: '500',
                  transition: 'all 0.2s ease-in-out',
                  fontSize: '15px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  color: '#fff',
                  padding: '8px 28px'
                }}
              >
                View Report
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
