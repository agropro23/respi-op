import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PDFViewer } from '@react-pdf/renderer';
import { apiFetch } from '../../utils/api'; 
import InstructionReport from '../../utils/instructionreport';
import axios from 'axios';

const LANGUAGE_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'marathi', label: 'Marathi' },
];

const DisplayInstruction = () => {
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [instructions, setInstructions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientImages, setPatientImages] = useState([]);
  const [patientImgLoading, setPatientImgLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    // Try to get language from location state or query param
    if (location.state && location.state.selectedLanguage) return location.state.selectedLanguage;
    const params = new URLSearchParams(window.location.search);
    return params.get('lang') || 'english';
  });
  const [allergyCache, setAllergyCache] = useState({});

  useEffect(() => {
    setPatientImgLoading(true);
    async function fetchPatientPhoto() {
      try {
        // Try to fetch as JSON first (for { images: [{ data, contentType }] })
        const res = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/patients/fori/${patientId}`);
        let photoUrl = null;
        try {
          const json = await res.clone().json();
          if (json.images && json.images.length > 0) {
            const img = json.images[0];
            photoUrl = `data:${img.contentType || 'image/png'};base64,${img.data}`;
          }
        } catch {
          // If not JSON, fallback to blob
          const blob = await res.blob();
          photoUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        }
        setPatientImages([photoUrl]);
      } catch {
        setPatientImages([]);
      } finally {
        setPatientImgLoading(false);
      }
    }
    fetchPatientPhoto();
  }, [patientId]);

  useEffect(() => {
    const fetchInstructions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/save-instruction/by-patient/${patientId}`);
        const data = await res.json();

        if (!data.success) throw new Error('Failed to fetch instructions');

        let allInstructions = [];
        let foodNames = [];
        let allergyImages = [];
        let patientName = '';
        let reportDate = '';
        let patientBasicInfo = {};

        if (Array.isArray(data.data) && data.data.length > 0) {
          const doc = data.data[0];
          allInstructions = doc.instructions || [];
          foodNames = doc.foods || [];
          patientName = doc.patient?.basicInfo?.name || doc.patientName || '';
          patientBasicInfo = doc.patient?.basicInfo || {};
          reportDate = doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('en-GB') : '';

          if (Array.isArray(doc.allergiesImage)) {
            // Use cache for allergy details/images if available
            const allergyPromises = doc.allergiesImage.map(async (allergyId) => {
              if (allergyCache[allergyId]) return allergyCache[allergyId];
              try {
                const allergyRes = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/allergies/${allergyId}`);
                const allergyData = await allergyRes.json();
                if (allergyData.success && allergyData.data) {
                  const allergy = allergyData.data;
                  let imageUrl = null;
                  if (allergy.image && allergy.image.data) {
                    imageUrl = `data:${allergy.image.contentType || 'image/png'};base64,${allergy.image.data}`;
                  }
                  const allergyObj = {
                    id: allergy._id,
                    name: allergy.name, // object with all languages
                    imageUrl
                  };
                  setAllergyCache(prev => ({ ...prev, [allergyId]: allergyObj }));
                  return allergyObj;
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
        }

        setInstructions({ allInstructions, foodNames, allergyImages, patientName, reportDate, patientBasicInfo });
        // Debug: log allergy image info
        if (allergyImages && allergyImages.length > 0) {
          allergyImages.forEach((img, idx) => {
            if (img.imageUrl) {
              console.log(`Allergy image [${idx}] contentType:`, img.imageUrl.split(';')[0]);
              console.log(`Allergy image [${idx}] data (first 100 chars):`, img.imageUrl.substring(0, 100));
            }
          });
        }
      } catch (err) {
        console.error('Error fetching instructions:', err);
        setError('Failed to fetch instructions');
      } finally {
        setLoading(false);
      }
    };
    fetchInstructions();
    // eslint-disable-next-line
  }, [patientId, selectedLanguage]);

  if (loading) return (
    <div style={{ height: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
  if (error) return <div className="text-danger">{error}</div>;
  if (!instructions || (instructions.allInstructions?.length === 0 && instructions.foodNames?.length === 0)) {
    return (
      <div className="alert alert-warning" style={{ margin: 32, fontSize: 18, borderRadius: 8, background: '#fffbe6', color: '#856404', border: '1px solid #ffeeba' }}>
        <span
          className="fa fa-arrow-left me-3"
          style={{ fontSize: 20, color: '#856404', cursor: 'pointer' }}
          onClick={() => navigate(`/patients/${patientId}/add-instruction`)}
        ></span>
        <strong>No instructions found.</strong> Please add instructions for this patient.
      </div>
    );
  }

  return (
    <div className="card shadow-sm" style={{ borderRadius: 14, marginTop: 12 }}>
      <div className="card-header bg-white" style={{ borderRadius: '14px 14px 0 0', borderBottom: 'none', display: 'flex', alignItems: 'center', padding: '16px 20px 8px 20px' }}>
        <span
          className="fa fa-arrow-left me-3"
          style={{ fontSize: 20, color: '#000000', cursor: 'pointer' }}
          onClick={() => navigate(`/patients/${patientId}/add-instruction`)}
        ></span>
        <div>
          <h4 className="mb-0 fw-bold" style={{ fontSize: 22, color: '#222' }}>Allergies Report</h4>
          <div className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>View Allergies Report</div>
        </div>
        <div style={{ marginLeft: 'auto', minWidth: 180 }}>
          <select
            className="form-select"
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
          >
            {LANGUAGE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ height: '90vh' }}>
        <PDFViewer style={{ width: '100%', height: '100%' }}>
          <InstructionReport 
            data={{
              ...instructions,
              patient: {
                basicInfo: { name: instructions.patientBasicInfo?.name || instructions.patientName || '' },
                photoUrl: patientImages.length > 0 ? patientImages[0] : null
              },
              selectedLanguage
            }} 
          />
        </PDFViewer>
      </div>
    </div>
  );
};

export default DisplayInstruction;