import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, X, ArrowRight } from 'lucide-react';
import { Button, ButtonGroup, Box } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';
import { pdf } from '@react-pdf/renderer';
import PatientHistoryReport from '../../utils/PatientHistoryReport';
import { apiFetch } from '../../utils/api';
import { Plus } from 'lucide-react';


const ViewPatient = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [photoError, setPhotoError] = useState(null);
  const [isHistoryReportLoading, setIsHistoryReportLoading] = useState(false);

  const handleDownloadHistoryReport = async () => {
    if (!patient) return;
    
    setIsHistoryReportLoading(true);
    try {
      const blob = await pdf(<PatientHistoryReport patientData={patient} />).toBlob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `patient_history_${patient.patientId || patientId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading history report:', error);
    } finally {
      setIsHistoryReportLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/patients/${patientId}`)
      .then(res => res.json())
      
      .then(data => {
        if (data && data.patient) setPatient(data.patient);
        else if (data) setPatient(data);
        else setPatient(null);
      })
      .catch(() => setPatient(null))
      .finally(() => setLoading(false));
  }, [patientId]);

  useEffect(() => {
    setLoadingPhotos(true);
    apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/patients/fori/${patientId}`)
      .then(res => res.json())
      .then(data => {
        if (data.images && data.images.length > 0) {
          setPhotos(data.images);
        } else {
          setPhotos([]);
        }
      })
      .catch(() => setPhotos([]))
      .finally(() => setLoadingPhotos(false));
  }, [patientId]);

  // Helper function to check if a value is not empty/null/false
  const isNotEmpty = (val) => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'string') return val.trim() !== '';
    if (typeof val === 'object') return Object.keys(val).length > 0 && Object.values(val).some(isNotEmpty);
    if (typeof val === 'boolean') return val;
    return true;
  };

  // Helper function to wrap text with newlines
  const wrapText = (text, maxLength) => {
    if (!text) return '';
    let result = '';
    for (let i = 0; i < text.length; i += maxLength) {
      result += text.substring(i, i + maxLength);
      if (i + maxLength < text.length) {
        result += '\n';
      }
    }
    return result;
  };

  // Helper: Format label
  const formatLabel = (label) =>
    label
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace('Bmi', 'BMI')
      .replace('Other Addictions', 'Other Addictions')
      .replace('Occupational Hazards', 'Occupational Hazards')
      .replace('Post Nasal Discharge', 'Post-Nasal Discharge')
      .replace('Frequent Sore Throat', 'Frequent Sore Throat')
      .replace('Tightening From Eyes', 'Tightening from Eyes')
      .replace('Ear Infections', 'Ear Infections')
      .replace('Dizzy Spells', 'Dizzy Spells')
      .replace('Itching In Eyes', 'Itching in Eyes')
      .replace('Short Temperedness', 'Short-Temperedness')
      .replace('Crying Spells', 'Crying Spells')
      .replace('Mood Changes', 'Mood Changes')
      .replace('Maniacal Disorders', 'Maniacal Disorders')
      .replace('Excessive Sweating', 'Excessive Sweating')
      .replace('Abd Pain', 'Abdominal Pain')
      .replace('Bed Wetting', 'Bed Wetting')
      .replace('Weight Loss', 'Weight Loss')
      .replace('Unexplained Fever', 'Unexplained Fever')
      .replace('Vague Aches', 'Vague Aches')
      .replace('Excessive School Absences', 'Excessive School Absences')
      .replace('Dark Ocular Circles', 'Dark Ocular Circles')
      .replace('Periorbital Oedema', 'Periorbital Oedema')
      .replace('Cervical Adenopathy', 'Cervical Adenopathy')
      .replace('Duration Of Episodes', 'Duration of Episodes')
      .replace('Aggravating Factors', 'Aggravating Factors')
      .replace('Urinary Tract Infection', 'Urinary Tract Infection')
      .replace('Joint Pain', 'Joint Pain')
      .replace('Abdominal Pain', 'Abdominal Pain')
      .replace('Scratch Test', 'Scratch Test')
      .replace('Pressure Test', 'Pressure Test')
      .replace('Cold Test', 'Cold Test');

  // Helper: Get formatted data for specific sections with mixed fields (booleans + others)
  const getFormattedSectionData = (sectionData, sectionName) => {
    const formattedEntries = [];

    // Define forms that have direct boolean fields that need grouping
    const directBooleanFormMap = {
      'rhinitis': 'Rhinitis Symptoms',
      'headaches': 'Headache Characteristics',
      'asthma': 'Asthma Symptoms',
      'tensionFatigueSyndrome': 'Tension/Fatigue Syndrome Symptoms',
      'urticariaAngioedema': 'Urticaria/Angioedema Symptoms',
      'dermatitisOrEczema': 'Dermatitis/Eczema Symptoms',
      'insectAllergy': 'Insect Allergy Reactions',
      'otherComplaints': 'Other Complaints'
    };

    const booleanFields = [];
    const otherFields = [];

    for (const [key, value] of Object.entries(sectionData)) {
      if (isNotEmpty(value)) {
        if (typeof value === 'boolean') {
          if (value === true) {
            booleanFields.push(formatLabel(key));
          }
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          // Handle nested objects like 'associatedSymptoms' in Headaches or 'reactions' in Insect Allergy
          const nestedBooleanFields = Object.entries(value).filter(([_, v]) => typeof v === 'boolean' && v === true);
          if (nestedBooleanFields.length > 0) {
            formattedEntries.push({
              label: formatLabel(key),
              value: nestedBooleanFields.map(([k, _]) => formatLabel(k)).join(', ')
            });
          }
          const nestedNonBooleanFields = Object.entries(value).filter(([_, v]) => typeof v !== 'boolean' && isNotEmpty(v));
          nestedNonBooleanFields.forEach(([k, v]) => {
            otherFields.push({
              label: formatLabel(`${key} ${k}`),
              value: v
            });
          });
        } else {
          // Collect other non-boolean fields
          otherFields.push({ label: formatLabel(key), value: value });
        }
      }
    }

    // Add grouped boolean fields if any for the main form section
    if (booleanFields.length > 0 && directBooleanFormMap[sectionName]) {
      formattedEntries.push({
        label: directBooleanFormMap[sectionName],
        value: booleanFields.join(', ')
      });
    } else if (booleanFields.length > 0) {
      // Fallback for general boolean fields if no specific map entry
      formattedEntries.push({
        label: 'Selected Options',
        value: booleanFields.join(', ')
      });
    }

    // Add other fields (non-booleans, or nested non-booleans)
    formattedEntries.push(...otherFields);

    return formattedEntries;
  };

  // Helper: Render value
  const renderValue = (value, key = '') => {
    if (typeof value === 'boolean') {
      return value ? <span className="badge bg-success ms-1">Yes</span> : <span className="badge bg-secondary ms-1">No</span>;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }
    if (typeof value === 'object' && value !== null) {
      // Addictions: custom format (handled directly in render for Personal History)
      if (key.toLowerCase().includes('addictions') && value.smoker !== undefined && value.alcoholic !== undefined) {
        const checkedAddictions = [];
        if (value.smoker) checkedAddictions.push('Smoker');
        if (value.alcoholic) checkedAddictions.push('Alcoholic');

        if (checkedAddictions.length === 0 && (!value.details || value.details.trim() === '')) return null; // No addictions selected and no details

        let addictionText = checkedAddictions.join(', ');
        if (value.details && value.details.trim() !== '') {
          addictionText += (addictionText ? ' ' : '') + `(Details: ${value.details})`;
        }

        return addictionText || null; // Return null if no addictions or details
      }

      // Illnesses: table format for family history
      if (key.toLowerCase().includes('illness')) {
        const familyIllnessSummary = {};
        let hasIllnesses = false;
        for (const illnessName of Object.keys(value)) {
          for (const memberName of Object.keys(value[illnessName])) {
            if (value[illnessName][memberName]) {
              hasIllnesses = true;
              if (!familyIllnessSummary[memberName]) {
                familyIllnessSummary[memberName] = [];
              }
              familyIllnessSummary[memberName].push(formatLabel(illnessName));
            }
          }
        }
        if (!hasIllnesses) return null;

        return (
          <table className="table table-sm table-bordered mb-0" style={{ maxWidth: 500 }}>
            <thead className="table-light">
              <tr>
                <th>Family Member</th>
                <th>Illness(es)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(familyIllnessSummary).map(([member, illnesses]) => (
                <tr key={member}>
                  <td className="text-capitalize">{formatLabel(member)}</td>
                  <td>{illnesses.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      // For other objects (especially within patientHistory2), rely on getFormattedSectionData
      // This means the general object rendering in renderValue is no longer needed for these cases
      return null; // Return null here as getFormattedSectionData will handle the display
    }
    return null;
  };

  if (loading) return <div>Loading patient data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!patient) return <div>Patient not found</div>;

  return (
    <div className="container py-4">
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <User size={24} />
              </div>
              <div>
                <h5 className="card-title mb-1 fw-semibold">Patient Information</h5>
                <div className="text-primary fw-semibold mt-1" style={{ fontSize: 15 }}>
                  Patient ID: {patient && patient.patientId ? patient.patientId : patientId}
                </div>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outlined"
                color="primary"
                startIcon={isHistoryReportLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <HistoryIcon />}
                onClick={() => {
                  if (isHistoryReportLoading) return;
                  handleDownloadHistoryReport();
                }}
                disabled={isHistoryReportLoading}
              >
                {isHistoryReportLoading ? 'Generating...' : 'Download History'}
              </Button>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/patients/${patientId}/followup`)}
              >
                Follow Up
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/patients/${patientId}/prescriptions`)}
              >
                Prescriptions
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate('/patients')}
              >
                <X size={16} className="me-2" />
                Close
              </button>
            </div>
          </div>
        </div>

        <div className="card-body p-4">
          <div className="row g-4">
            <div className="col-12">
              <h5 className="fw-semibold mb-3">Basic Information</h5>
              {/* Display first photo above name */}
              {loadingPhotos ? (
                <div className="text-center py-2">Loading photo...</div>
              ) : photos.length > 0 ? (
                <div className="mb-3 text-center">
                  <div className="position-relative d-inline-block">
                    <img
                      src={`data:${photos[0].contentType};base64,${photos[0].data}`}
                      alt="Patient photo"
                      style={{
                        width: '150px',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '2px solid #dee2e6',
                      }}
                    />
                    <button
                      onClick={() => navigate(`/patients/${patientId}/photos`)}
                      className="btn btn-sm btn-outline-primary position-absolute"
                      style={{
                        bottom: '5px',
                        right: '5px',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                        border: '2px solid #007bff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#007bff';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.color = '#007bff';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      title={`Manage Photos (${photos.length}/12)`}
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                  <div className="mt-3 d-flex align-items-center justify-content-center gap-2">
                    <span className="badge bg-light text-dark border">
                      {photos.length} photo{photos.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => navigate(`/patients/${patientId}/photos`)}
                      className="btn btn-link btn-sm text-primary p-0"
                      style={{ textDecoration: 'none' }}
                    >
                      Manage Photos
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-3 text-center">
                  <button
                    onClick={() => navigate(`/patients/${patientId}/photos`)}
                    className="btn p-0"
                    style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      border: '2px dashed #dee2e6',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      background: '#f8f9fa',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#e9ecef';
                      e.currentTarget.style.borderColor = '#adb5bd';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#f8f9fa';
                      e.currentTarget.style.borderColor = '#dee2e6';
                    }}
                  >
                    <Plus size={32} className="mb-2 text-primary" />
                    <span className="small text-muted">Add Photo</span>
                  </button>
                </div>
              )}

              <div className="row g-3">
                {Object.entries(patient.basicInfo).filter(([_, v]) => isNotEmpty(v)).map(([key, value]) => (
                  <div className="col-md-4" key={key}>
                    <label className="form-label text-capitalize fw-bold">{formatLabel(key)}</label>
                    <div>{renderValue(value, key)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Card */}
      {(isNotEmpty(patient.patientHistory?.personal) || isNotEmpty(patient.patientHistory?.mental) || isNotEmpty(patient.patientHistory?.past) || isNotEmpty(patient.patientHistory?.family) || isNotEmpty(patient.patientHistory?.environmental)) && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white">
            <h5 className="card-title mb-1 fw-semibold">History</h5>
          </div>
          <div className="card-body p-4">
            {/* Personal History */}
            {isNotEmpty(patient.patientHistory?.personal) && (
              <div className="mb-3">
                <h5 className="fw-semibold mb-2">Personal</h5>
                {Object.entries(patient.patientHistory.personal).filter(([_, v]) => isNotEmpty(v)).map(([key, value]) => {
                  if (key === 'addictions') {
                    const checkedAddictions = [];
                    if (value.smoker) checkedAddictions.push('Smoker');
                    if (value.alcoholic) checkedAddictions.push('Alcoholic');

                    return (
                      <React.Fragment key={key}>
                        {checkedAddictions.length > 0 && (
                          <div className="mb-2">
                            <span className="fw-bold">{formatLabel(key)}:</span> {checkedAddictions.join(', ')}
                          </div>
                        )}
                        {value.details && value.details.trim() !== '' && (
                          <div className="mb-2">
                            <span className="fw-bold">Addiction Details:</span>
                            <span className="ms-2" style={{ whiteSpace: 'pre-wrap' }}>
                              {wrapText(value.details, 80)}
                            </span>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  }
                  return (
                    <div className="mb-2" key={key}>
                      <span className="fw-bold">{formatLabel(key)}:</span> {renderValue(value, key)}
                    </div>
                  );
                })}
              </div>
            )}
            {/* Mental History */}
            {isNotEmpty(patient.patientHistory?.mental) && (
              <div className="mb-3">
                <h5 className="fw-semibold mb-2">Mental</h5>
                {(() => {
                  const allMentalConditions = [];
                  
                  // Process all mental history entries
                  Object.entries(patient.patientHistory.mental).forEach(([key, value]) => {
                    if (isNotEmpty(value)) {
                      if (typeof value === 'boolean' && value === true) {
                        // Direct boolean field that is true
                        allMentalConditions.push(formatLabel(key));
                      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        // Nested object - extract all true boolean values
                        const trueValues = Object.entries(value)
                          .filter(([_, v]) => typeof v === 'boolean' && v === true)
                          .map(([k, _]) => formatLabel(k));
                        allMentalConditions.push(...trueValues);
                      } else if (typeof value === 'string' || typeof value === 'number') {
                        // String or number values
                        allMentalConditions.push(`${formatLabel(key)}: ${value}`);
                      }
                    }
                  });
                  
                  // Return single entry with all conditions
                  if (allMentalConditions.length > 0) {
                    return (
                      <div className="mb-2">
                        <span className="fw-bold">Symptoms:</span> {allMentalConditions.join(', ')}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
            {/* Past History */}
            {isNotEmpty(patient.patientHistory?.past) && (
              <div className="mb-3">
                <h5 className="fw-semibold mb-2">Past</h5>
                {Object.entries(patient.patientHistory.past).filter(([_, v]) => isNotEmpty(v)).map(([key, value]) => (
                  <div className="mb-2" key={key}>
                    <span className="fw-bold">{formatLabel(key)}:</span> {renderValue(value, key)}
                  </div>
                ))}
              </div>
            )}
            {/* Family History */}
            {isNotEmpty(patient.patientHistory?.family) && (
              <div className="mb-3">
                <h5 className="fw-semibold mb-2">Family</h5>
                {Object.entries(patient.patientHistory.family).filter(([_, v]) => isNotEmpty(v)).map(([key, value]) => (
                  <div className="mb-2" key={key}>
                    <span className="fw-bold">{formatLabel(key)}:</span> {renderValue(value, key)}
                  </div>
                ))}
              </div>
            )}
            {/* Environmental History */}
            {isNotEmpty(patient.patientHistory?.environmental) && (
              <div className="mb-3">
                <h5 className="fw-semibold mb-2">Environmental</h5>
                {Object.entries(patient.patientHistory.environmental).filter(([_, v]) => isNotEmpty(v)).map(([key, value]) => (
                  <div className="mb-2" key={key}>
                    <span className="fw-bold">{formatLabel(key)}:</span> {renderValue(value, key)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Allergy Card */}
      {(isNotEmpty(patient.patientHistory?.allergy) || isNotEmpty(patient.patientHistory?.patientHistory2)) && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white">
            <h5 className="card-title mb-1 fw-semibold">Allergy</h5>
          </div>
          <div className="card-body p-4">
            {/* Allergy */}
            {isNotEmpty(patient.patientHistory?.allergy) && (
              <div className="mb-3">
                <h5 className="fw-semibold mb-2">Allergy</h5>
                {Object.entries(patient.patientHistory.allergy).filter(([_, v]) => isNotEmpty(v)).map(([key, value]) => (
                  <div className="mb-2" key={key}>
                    <span className="fw-bold">{formatLabel(key)}:</span> {renderValue(value, key)}
                  </div>
                ))}
              </div>
            )}
            {/* PatientHistory2 (all sub-objects) */}
            {isNotEmpty(patient.patientHistory?.patientHistory2) && (
              <div className="mb-3">
                <h5 className="fw-semibold mb-2">Other Allergy/Complaints</h5>
                {Object.entries(patient.patientHistory.patientHistory2).filter(([_, v]) => isNotEmpty(v)).map(([section, sectionData]) => (
                  <div className="mb-2" key={section}>
                    <span className="fw-bold">{formatLabel(section)}</span>
                    <ul className="mb-0">
                      {getFormattedSectionData(sectionData, section).map(({ label, value }, idx) => (
                        <li key={label + idx}>
                          <span className="text-capitalize">{label}:</span> {renderValue(value, label.toLowerCase())}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Doctor Examination Card */}
      {isNotEmpty(patient.examination) && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white">
            <h5 className="card-title mb-1 fw-semibold">Doctor Examination</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              {Object.entries(patient.examination).filter(([_, v]) => isNotEmpty(v)).map(([key, value]) => (
                <div className="col-md-4" key={key}>
                  <div>
                    <span className="fw-bold text-capitalize">{formatLabel(key)}:</span>
                    <span className="ms-2">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Diagnosis Card */}
      {isNotEmpty(patient.diagnosis) && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white">
            <h5 className="card-title mb-1 fw-semibold">Diagnosis</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              {Object.entries(patient.diagnosis).filter(([_, v]) => isNotEmpty(v)).map(([key, value]) => (
                <div className="col-md-4" key={key}>
                  <div className="d-flex align-items-center">
                    {typeof value === 'boolean' ? (
                      <>
                        <span className={`badge ${value ? 'bg-success' : 'bg-secondary'} me-2`}>
                          {value ? 'Yes' : 'No'}
                        </span>
                        <span className="text-capitalize">{formatLabel(key)}</span>
                      </>
                    ) : (
                      <>
                        <span className="fw-bold me-2">{formatLabel(key)}:</span>
                        <span>{value}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPatient;