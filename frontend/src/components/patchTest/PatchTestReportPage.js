import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { apiFetch } from '../../utils/api';
import PatchReport from '../../utils/PatchReport';

const PatchTestReportPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [patientPatchTestData, setPatientPatchTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);

  // Get selectedDoctor from location.state
  const selectedDoctor = (location.state && location.state.selectedDoctor) || null;

  const handleDownloadPatchReport = async () => {
    if (!patientPatchTestData || !patient?.patientId) return;
    
    try {
      const blob = await pdf(<PatchReport data={patientPatchTestData} selectedDoctor={selectedDoctor} />).toBlob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `patch_test_report-${patient.patientId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading patch report:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    
    // Fetch both patient data and patch test data
    const fetchData = async () => {
      try {
        // Fetch patient data first
        const patientResponse = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/patients/${patientId}`);
        const patientData = await patientResponse.json();
        const patientInfo = patientData && patientData.patient ? patientData.patient : patientData;
        setPatient(patientInfo);

        // Fetch patient patch test data
        if (patientInfo?._id) {
          console.log('Fetching patient patch test data for patient ObjectId:', patientInfo._id);
          
          const patchResponse = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/patient-patch-test/by-patient/${patientInfo._id}`);
          console.log('Patient patch test response status:', patchResponse.status);
          
          if (!patchResponse.ok) {
            throw new Error('Failed to fetch patch test data');
          }
          
          const patchData = await patchResponse.json();
          console.log('Patient patch test data received:', patchData);
          
          if (Array.isArray(patchData) && patchData.length > 0) {
            // Use the latest report (or adjust as needed)
            const report = patchData[0];
            console.log('Using patient patch test report:', report);
            
            const finalData = {
              ...report,
              // Always use the latest patient info
              basicInfo: patientInfo?.basicInfo || {},
              examination: patientInfo?.examination || {},
              patientID: patientInfo?.patientId || patientId,
            };
            
            console.log('Final data for PDF:', finalData);
            setPatientPatchTestData(finalData);
          } else {
            console.log('No patient patch test data found');
            setPatientPatchTestData(null);
          }
        } else {
          console.log('No patient ID available');
          setPatientPatchTestData(null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setPatientPatchTestData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  if (loading) return <div className="text-center py-5">Loading report...</div>;
  if (error) return <div className="text-center py-5 text-danger">Error loading report: {error}</div>;
  if (!patientPatchTestData) return <div className="text-center py-5 text-muted">No Patch Test Report found for this patient.</div>;

  console.log('PatchTestReportPage - patientPatchTestData:', patientPatchTestData);

  return (
    <div className="container py-4">
      <div className="card shadow-sm mt-4">
        <div className="card-header bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0 fw-semibold">Patch Test Report</h5>
            <div className="d-flex gap-2">
              {patientPatchTestData && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    handleDownloadPatchReport();
                  }}
                >
                  Download
                </Button>
              )}
              <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Back</button>
            </div>
          </div>
        </div>
        <div className="card-body p-0" style={{ height: '80vh', minHeight: '600px' }}>
          <div style={{ width: '100%', height: '100%', border: '1px solid #dee2e6' }}>
            {patientPatchTestData ? (
              <PDFViewer 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  border: 'none'
                }}
                showToolbar={true}
                onError={(error) => {
                  console.error('PDF Viewer Error:', error);
                }}
                onLoad={() => {
                  console.log('PDF Viewer loaded successfully');
                }}
              >
                <PatchReport data={patientPatchTestData} selectedDoctor={selectedDoctor} />
              </PDFViewer>
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100">
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading PDF...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatchTestReportPage; 