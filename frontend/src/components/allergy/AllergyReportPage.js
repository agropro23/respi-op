import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PDFViewer } from '@react-pdf/renderer';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AllergyReport from '../../utils/AllergyReport';
import useReportDownload from '../../utils/useReportDownload';
import { translateAllergens } from '../../utils/translationUtils';
import { apiFetch } from '../../utils/api'; 

const AllergyReportPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [patchTestData, setPatchTestData] = useState(null);
  const [allAllergies, setAllAllergies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [patient, setPatient] = useState(null);
  const selectedDoctor = (location.state && location.state.selectedDoctor) || null;

  const { downloadReport } = useReportDownload();

  const handleDownloadReport = async () => {
    if (!patchTestData) return;
    setIsReportLoading(true);
    try {
      const safeAllAllergies = Array.isArray(allAllergies) ? allAllergies : [];
      await downloadReport(patchTestData, patient?.patientId || patientId, safeAllAllergies, selectedDoctor);
    } catch (error) {
      console.error('Error downloading report:', error);
    } finally {
      setIsReportLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    
    // Fetch patient data, patch test data, and all allergies
    const fetchData = async () => {
      try {
        // Fetch all allergies first so they are available when rendering the PDF
        try {
          const allergiesRes = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/allergies/all`);
          const allergiesData = await allergiesRes.json();
          if (allergiesData && allergiesData.data) {
            setAllAllergies(allergiesData.data);
          } else {
            setAllAllergies([]);
          }
        } catch (err) {
          console.error('Error fetching all allergies:', err);
          setAllAllergies([]);
        }

        // Fetch patient data
        const patientResponse = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/patients/${patientId}`);
        const patientData = await patientResponse.json();
        const patientInfo = patientData && patientData.patient ? patientData.patient : patientData;
        setPatient(patientInfo);

        // Fetch patch test data
        const patchResponse = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/patch-testing/patient/${patientId}`);
        const patchData = await patchResponse.json();
        
        console.log('Patch test data received:', patchData);
        
        if (Array.isArray(patchData) && patchData.length > 0) {
          const report = patchData[0];
          console.log('Using report:', report);
          
          // Translate allergens if needed
          const translatedAllergens = await translateAllergens(report.allergens);
          
          const finalData = {
            ...report,
            allergens: translatedAllergens,
            specialAdvices: report.specialAdvices || {},
            // Always use the latest patient info
            basicInfo: patientInfo?.basicInfo || {},
            examination: patientInfo?.examination || {},
            patientID: patientInfo?.patientId || patientId,
          };
          
          console.log('Final data for PDF:', finalData);
          setPatchTestData(finalData);
        } else {
          console.log('No patch test data found');
          setPatchTestData(null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setPatchTestData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  if (loading) return <div className="text-center py-5">Loading report...</div>;
  if (error) return <div className="text-center py-5 text-danger">Error loading report: {error}</div>;
  if (!patchTestData) return <div className="text-center py-5 text-muted">No Allergy Report found for this patient.</div>;

  console.log('AllergyReportPage - patchTestData:', patchTestData);
  console.log('AllergyReportPage - allAllergies:', allAllergies);

  // Check if required data is present
  if (!patchTestData.basicInfo || !patchTestData.allergens) {
    return (
      <div className="text-center py-5 text-danger">
        <p>Invalid data structure for PDF generation.</p>
        <p>Basic Info: {patchTestData.basicInfo ? 'Present' : 'Missing'}</p>
        <p>Allergens: {patchTestData.allergens ? 'Present' : 'Missing'}</p>
        <pre>{JSON.stringify(patchTestData, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card shadow-sm mt-4">
        <div className="card-header bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0 fw-semibold">Allergy Test Report</h5>
            <div className="d-flex gap-2">
              {patchTestData && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={isReportLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <DownloadIcon />}
                  onClick={() => {
                    if (isReportLoading) return;
                    handleDownloadReport();
                  }}
                  disabled={isReportLoading}
                >
                  {isReportLoading ? 'Generating...' : 'Download'}
                </Button>
              )}
              <button className="btn btn-outline-secondary" onClick={() => navigate(`/patients/${patientId}/test`)}>Back</button>
            </div>
          </div>
        </div>
        <div className="card-body p-0" style={{ height: '80vh', minHeight: '600px' }}>
          <div style={{ width: '100%', height: '100%', border: '1px solid #dee2e6' }}>
            {patchTestData ? (
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
                <AllergyReport data={patchTestData} allAllergies={Array.isArray(allAllergies) ? allAllergies : []} selectedDoctor={selectedDoctor} />
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

export default AllergyReportPage; 
