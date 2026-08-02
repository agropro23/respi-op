import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PDFViewer } from '@react-pdf/renderer';
import InstructionReport from '../../utils/instructionreport'; // Import the new report component
import { apiFetch } from '../../utils/api'; 

const LANGUAGE_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'marathi', label: 'Marathi' },
];

async function fetchPatientImageBase64(patientId) {
  const response = await fetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/patients/fori/${patientId}`);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // This will be a base64 data URL
    reader.readAsDataURL(blob);
  });
}


const ViewInstructionReport = () => {
  const { patientId } = useParams(); // Get patient ID from URL
  const [instructionData, setInstructionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstructionData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch instruction data for the patient ID
        const res = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/save-instruction/by-patient/${patientId}`);
        const data = await res.json();
        
        if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
          throw new Error('Failed to fetch instruction data or no data found');
        }
        
        // Fetch patient image as base64
        let photoUrl = null;
        try {
          photoUrl = await fetchPatientImageBase64(patientId);
        } catch (imgErr) {
          // If image fetch fails, leave photoUrl as null
          photoUrl = null;
        }
        // Merge photoUrl into patient object
        const doc = { ...data.data[0] };
        let allergyImages = [];
        let patientBasicInfo = doc.patient?.basicInfo || {};
        if (Array.isArray(doc.allergiesImage)) {
          // Fetch full allergy objects for each ID
          const allergyPromises = doc.allergiesImage.map(async (allergyId) => {
            try {
              const allergyRes = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/allergies/${allergyId}`);
              const allergyData = await allergyRes.json();
              if (allergyData.success && allergyData.data) {
                const allergy = allergyData.data;
                let imageUrl = null;
                if (allergy.image && allergy.image.data) {
                  const contentType = allergy.image.contentType || 'image/jpeg';
                  imageUrl = `data:${contentType};base64,${allergy.image.data}`;
                  console.log('Image loaded for:', allergy.name.english, 'ContentType:', contentType);
                }
                return {
                  id: allergy._id,
                  name: allergy.name, // object with all languages
                  imageUrl
                };
              }
              return null;
            } catch (err) {
              console.error('Error fetching allergy:', allergyId, err);
              return null;
            }
          });
          const fetchedAllergies = await Promise.all(allergyPromises);
          allergyImages = fetchedAllergies.filter(a => a !== null);
        }
        // Build patient object for PDF
        const patient = {
          basicInfo: { name: patientBasicInfo?.name || doc.patientName || '' },
          photoUrl
        };
        setInstructionData({ ...doc, allergyImages, patient });
        
      } catch (err) {
        console.error('Error fetching instruction data:', err);
        setError('Failed to load instruction data');
      } finally {
        setLoading(false);
      }
    };

    fetchInstructionData();
  }, [patientId]); // Refetch if patient ID changes

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!instructionData) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-muted">No instruction data available for this patient.</div>
        </div>
      );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0 0 24px' }}>
        <span
          className="fa fa-arrow-left me-3"
          style={{ fontSize: 20, color: '#0f4c75', cursor: 'pointer', marginRight: 16 }}
          onClick={() => navigate('/patients')}
        ></span>
        <span style={{ fontWeight: 600, fontSize: 18, color: '#0f4c75' }}>Instruction Report</span>
      </div>
      {/* Language selection dropdown */}
      <div style={{ padding: '12px 24px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, marginRight: 16 }}>Instruction Language for PDF:</span>
        <select
          className="form-select"
          style={{ maxWidth: 220 }}
          value={selectedLanguage}
          onChange={e => setSelectedLanguage(e.target.value)}
        >
          {LANGUAGE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {/* PDFViewer to display the InstructionReport */}
      <PDFViewer style={{ flexGrow: 1, width: '100%' }}>
        {/* Pass fetched instructionData to the report component */}
        <InstructionReport data={{ ...instructionData, selectedLanguage }} />
      </PDFViewer>
    </div>
  );
};

export default ViewInstructionReport; 