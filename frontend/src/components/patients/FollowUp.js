import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api'; 

const FollowUp = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [followUpText, setFollowUpText] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  // Fetch patient data to get patientId
  const [patient, setPatient] = useState(null);
  useEffect(() => {
    apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/patients/${patientId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.patient) setPatient(data.patient);
        else if (data) setPatient(data);
        else setPatient(null);
      })
      .catch(() => setPatient(null));
  }, [patientId]);

  const [followUps, setFollowUps] = useState([]);
  const [loadingFollowUps, setLoadingFollowUps] = useState(true);
  const [errorFollowUps, setErrorFollowUps] = useState(null);

  // Fetch follow-ups for this patient
  useEffect(() => {
    setLoadingFollowUps(true);
    apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/followup/patient/${patientId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.data) {
          // Transform the single followUp document with arrays into an array of objects for display
          const doc = data.data;
          const arr = (doc.followUpInstructions || []).map((instruction, idx) => ({
            followUpInstructions: instruction,
            visitDate: doc.visitDate[idx],
            visitCount: doc.visitCount - (doc.followUpInstructions.length - 1 - idx), // Calculate correct visit number
            _id: doc._id + '-' + idx // unique key for React
          }));
          setFollowUps(arr);
        } else {
          setFollowUps([]);
        }
        setLoadingFollowUps(false);
      })
      .catch(err => {
        setErrorFollowUps('Could not fetch follow up details.');
        setLoadingFollowUps(false);
      });
  }, [patientId, showAddModal]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState("");

  const handleAddClick = () => setShowAddModal(true);
  const handleCancel = () => {
    setShowAddModal(false);
    setFollowUpText('');
    setDate(new Date().toISOString().split('T')[0]);
  };
  const handleSave = async () => {
    if (!patient || !patient._id) {
      setShowError('Patient data is still loading. Please try again in a moment.');
      return;
    }
    if (!followUpText.trim() || !date) {
      setShowError('Please enter follow up details and select a date.');
      return;
    }
    // Prevent duplicate date
    if (followUps.some(fu => fu.visitDate === date)) {
      setShowError('A follow up for this date already exists. Please select a different date.');
      return;
    }
    try {
      const res = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/followup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patient._id,
          followUpInstructions: followUpText,
          visitDate: date
        })
      });
      if (!res.ok) throw new Error('Failed to save follow up');
      setShowAddModal(false);
      setFollowUpText('');
      setDate(new Date().toISOString().split('T')[0]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      setShowError('Error saving follow up: ' + err.message);
    }
  };

  // --- Add helpers from viewPatient.js for formatting and rendering ---
  const formatLabel = (label) =>
    label
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
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
  const renderValue = (value, key = '') => {
    if (typeof value === 'boolean') {
      return value ? <span className="badge bg-success ms-1">Yes</span> : <span className="badge bg-secondary ms-1">No</span>;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }
    if (typeof value === 'object' && value !== null) {
      if (key.toLowerCase().includes('addictions') && value.smoker !== undefined && value.alcoholic !== undefined) {
        const checkedAddictions = [];
        if (value.smoker) checkedAddictions.push('Smoker');
        if (value.alcoholic) checkedAddictions.push('Alcoholic');
        let addictionText = checkedAddictions.join(', ');
        if (value.details && value.details.trim() !== '') {
          addictionText += (addictionText ? ' ' : '') + `(Details: ${value.details})`;
        }
        return addictionText || null;
      }
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
      return null;
    }
    return null;
  };

  return (
    <div className="container py-4">
      {/* Success Popup */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: 30,
          right: 30,
          zIndex: 2000,
          background: '#10B981',
          color: 'white',
          padding: '16px 28px',
          borderRadius: 10,
          boxShadow: '0 4px 16px rgba(16,185,129,0.15)',
          fontWeight: 600,
          fontSize: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle me-2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          Follow up saved successfully!
        </div>
      )}
      {/* Error Popup */}
      {showError && (
        <div style={{
          position: 'fixed',
          top: 30,
          right: 30,
          zIndex: 2000,
          background: '#EF4444',
          color: 'white',
          padding: '16px 28px',
          borderRadius: 10,
          boxShadow: '0 4px 16px rgba(239,68,68,0.15)',
          fontWeight: 600,
          fontSize: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-circle me-2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6m0-6l6 6"/></svg>
          {showError}
          <button onClick={() => setShowError("")} style={{ background: 'none', border: 'none', color: 'white', marginLeft: 16, fontSize: 18, cursor: 'pointer' }}>&times;</button>
        </div>
      )}
      <div className="card shadow-sm" style={{ borderRadius: 14 }}>
        <div className="card-header bg-white" style={{ borderRadius: '14px 14px 0 0', borderBottom: 'none', padding: '20px 24px 12px 24px' }}>
          <span
            className="fa fa-arrow-left me-3"
            style={{ fontSize: 20, color: '#111', cursor: 'pointer' }}
            onClick={() => navigate(`/patients/${patientId}`)}
          ></span>
          <span>
            <h4 className="mb-0 fw-bold d-inline-block" style={{ fontSize: 22, color: '#222' }}>Follow Up</h4>
            <div className="text-primary fw-semibold mt-1" style={{ fontSize: 15 }}>
              Patient ID: {patient && patient.patientId ? patient.patientId : patientId}
            </div>
          </span>
        </div>
        <div style={{ borderTop: '1.5px solid #e5e7eb', width: '100%' }} />
        <div className="card-body" style={{ background: '#fff', borderRadius: '0 0 14px 14px' }}>
          <div
            style={{
              minHeight: 200,
              border: '2px dashed rgb(209, 213, 219)',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: 'rgb(250, 250, 250)',
              transition: '0.3s ease-in-out',
              margin: '0 auto',
              maxWidth: 700
            }}
            onClick={handleAddClick}
          >
            <div style={{ width: 64, height: 64, backgroundColor: 'rgb(229, 231, 235)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus" aria-hidden="true" style={{ color: 'rgb(107, 114, 128)' }}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
            </div>
            <h6 className="fw-semibold text-dark mb-2">Add</h6>
            <p className="text-muted mb-0 text-center" style={{ maxWidth: 300 }}>Click here to add follow up details for this patient</p>
          </div>
        </div>
      </div>
      {/* Modal for Add Follow Up */}
      {showAddModal && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.25)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 540 }}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 18, overflow: 'hidden' }}>
              <div className="modal-header" style={{ background: '#f7f8fa', borderBottom: '1.5px solid #e5e7eb', padding: '20px 28px 12px 28px' }}>
                <h4 className="modal-title fw-bold mb-0" style={{ fontSize: 22 }}>Add Follow Up</h4>
                <button type="button" className="btn-close" onClick={handleCancel}></button>
              </div>
              <div className="modal-body" style={{ padding: '28px 28px 12px 28px' }}>
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 16 }}>Follow Up <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control border-0 shadow-sm"
                    rows={8}
                    style={{ minHeight: 180, fontSize: 16, background: '#f9fafb', borderRadius: 10, resize: 'vertical', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                    value={followUpText}
                    onChange={e => setFollowUpText(e.target.value)}
                    placeholder="Enter follow up details"
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 16 }}>Date <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    className="form-control border-0 shadow-sm"
                    style={{ background: '#f9fafb', borderRadius: 10, fontSize: 16, maxWidth: 220 }}
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer bg-light" style={{ borderTop: '1.5px solid #e5e7eb', padding: '16px 28px' }}>
                <button className="btn btn-outline-secondary px-4" style={{ borderRadius: 8 }} onClick={handleCancel}>Cancel</button>
                <button className="btn btn-primary px-4" style={{ borderRadius: 8, fontWeight: 600 }} onClick={handleSave} disabled={!patient || !patient._id}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Follow Up List Section */}
      <div className="mt-4" style={{ background: '#f7f8fa', borderRadius: 16, padding: '32px 18px 24px 18px' }}>
        <h5 className="fw-bold mb-3" style={{ fontSize: 18 }}>Follow Up History</h5>
        {loadingFollowUps ? (
          <div className="text-muted py-3">Loading follow up details...</div>
        ) : errorFollowUps ? (
          <div className="alert alert-danger py-2">{errorFollowUps}</div>
        ) : followUps.length === 0 ? (
          <div className="text-muted py-3">No follow up records found for this patient.</div>
        ) : (
          <>
            <div className="row g-4">
              {followUps
                .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate))
                .map((fu, idx) => (
                <div className="col-12 col-md-6 col-lg-4" key={fu._id}>
                  <div className="card border-0 shadow-sm h-100 followup-card" style={{ borderRadius: 14, background: '#fff', transition: 'box-shadow 0.2s', minHeight: 140 }}>
                    <div className="card-body d-flex flex-column justify-content-between" style={{ minHeight: 120 }}>
                      <div className="d-flex align-items-center mb-2 gap-2">
                        <span className="badge bg-primary" style={{ fontSize: 14, fontWeight: 600, borderRadius: 8, padding: '7px 16px' }}>{new Date(fu.visitDate).toLocaleDateString()}</span>
                        <span className="badge bg-info text-dark" style={{ fontSize: 13, fontWeight: 500, borderRadius: 8, padding: '7px 14px' }}>Visit #{fu.visitCount || 1}</span>
                      </div>
                      <div className="fw-semibold text-dark" style={{ fontSize: 15, whiteSpace: 'pre-line', marginTop: 6 }}>{fu.followUpInstructions}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <style>{`
            .followup-card:hover {
              box-shadow: 0 8px 32px rgba(37,99,235,0.13), 0 1.5px 6px rgba(0,0,0,0.04);
              transform: translateY(-2px) scale(1.02);
            }
            `}</style>
          </>
        )}
      </div>

      {/* Patient History Section */}
      {patient && (
        <div className="mt-4" style={{ background: '#f7f8fa', borderRadius: 16, padding: '32px 18px 24px 18px' }}>
          <h5 className="fw-bold mb-3" style={{ fontSize: 18 }}>Patient History</h5>
          
          {/* Tabs Navigation */}
          <ul className="nav nav-pills mb-4" id="patientHistoryTabs" role="tablist" style={{ gap: '8px' }}>
            {Object.entries(patient.basicInfo || {}).some(([_, value]) => value && typeof value !== 'object') && (
              <li className="nav-item" role="presentation">
                <button className="nav-link active" id="basic-tab" data-bs-toggle="tab" data-bs-target="#basic" type="button" role="tab">
                  <i className="fas fa-user me-2"></i>Basic Info
                </button>
              </li>
            )}
            {patient.patientHistory?.personal && Object.values(patient.patientHistory.personal).some(value => value && typeof value !== 'object') && (
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="personal-tab" data-bs-toggle="tab" data-bs-target="#personal" type="button" role="tab">
                  <i className="fas fa-user-circle me-2"></i>Personal
                </button>
              </li>
            )}
            {patient.patientHistory?.mental && Object.values(patient.patientHistory.mental).some(value => value === true) && (
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="mental-tab" data-bs-toggle="tab" data-bs-target="#mental" type="button" role="tab">
                  <i className="fas fa-brain me-2"></i>Mental
                </button>
              </li>
            )}
            {patient.patientHistory?.past && Object.values(patient.patientHistory.past).some(value => value) && (
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="past-tab" data-bs-toggle="tab" data-bs-target="#past" type="button" role="tab">
                  <i className="fas fa-history me-2"></i>Past
                </button>
              </li>
            )}
            {patient.patientHistory?.family?.illnesses && Object.values(patient.patientHistory.family.illnesses).some(members => Object.values(members).some(value => value === true)) && (
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="family-tab" data-bs-toggle="tab" data-bs-target="#family" type="button" role="tab">
                  <i className="fas fa-users me-2"></i>Family
                </button>
              </li>
            )}
            {patient.patientHistory?.environmental && Object.values(patient.patientHistory.environmental).some(value => value) && (
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="environmental-tab" data-bs-toggle="tab" data-bs-target="#environmental" type="button" role="tab">
                  <i className="fas fa-home me-2"></i>Environmental
                </button>
              </li>
            )}
            {patient.patientHistory?.allergy && Object.values(patient.patientHistory.allergy).some(value => value) && (
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="allergy-tab" data-bs-toggle="tab" data-bs-target="#allergy" type="button" role="tab">
                  <i className="fas fa-allergies me-2"></i>Allergy
                </button>
              </li>
            )}
            {patient.patientHistory?.patientHistory2 && Object.values(patient.patientHistory.patientHistory2).some(data => Object.values(data).some(value => value === true || (typeof value === 'string' && value))) && (
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="conditions-tab" data-bs-toggle="tab" data-bs-target="#conditions" type="button" role="tab">
                  <i className="fas fa-notes-medical me-2"></i>Conditions
                </button>
              </li>
            )}
            {patient.examination && Object.values(patient.examination).some(value => value === true || (typeof value === 'string' && value)) && (
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="examination-tab" data-bs-toggle="tab" data-bs-target="#examination" type="button" role="tab">
                  <i className="fas fa-clipboard-check me-2"></i>Examination
                </button>
              </li>
            )}
            {patient.diagnosis && Object.values(patient.diagnosis).some(value => value === true || (typeof value === 'string' && value)) && (
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="diagnosis-tab" data-bs-toggle="tab" data-bs-target="#diagnosis" type="button" role="tab">
                  <i className="fas fa-stethoscope me-2"></i>Diagnosis
                </button>
              </li>
            )}
            
          </ul>

          {/* Tab Content */}
          <div className="tab-content" id="patientHistoryTabContent">
            {/* Basic Info Tab */}
            {Object.entries(patient.basicInfo || {}).some(([_, value]) => value && typeof value !== 'object') && (
              <div className="tab-pane fade show active" id="basic" role="tabpanel">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="row g-3">
                      {Object.entries(patient.basicInfo || {}).map(([key, value]) => {
                        if (value && typeof value !== 'object') {
                          return (
                            <div className="col-md-4" key={key}>
                              <div className="p-3 bg-light rounded-3 h-100">
                                <h6 className="text-muted mb-2 text-capitalize">{formatLabel(key)}</h6>
                                <p className="mb-0 fw-semibold">{value}</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Personal History Tab */}
            {patient.patientHistory?.personal && Object.values(patient.patientHistory.personal).some(value => value && typeof value !== 'object') && (
              <div className="tab-pane fade" id="personal" role="tabpanel">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="row g-3">
                      {Object.entries(patient.patientHistory.personal).map(([key, value]) => {
                        if (key === 'addictions' && typeof value === 'object') {
                          const { smoker, alcoholic, details } = value;
                          return (
                            <div className="col-md-6" key={key}>
                              <div className="p-3 bg-light rounded-3 h-100">
                                <h6 className="text-muted mb-2 text-capitalize">Addictions</h6>
                                <div className="d-flex gap-2 mb-2">
                                  {smoker && <span className="badge bg-warning text-dark">Smoker</span>}
                                  {alcoholic && <span className="badge bg-danger">Alcoholic</span>}
                                  {!smoker && !alcoholic && <span className="text-muted">None</span>}
                                </div>
                                {details && details.trim() !== '' && (
                                  <div className="text-muted small">Details: <span className="fw-semibold text-dark">{details}</span></div>
                                )}
                              </div>
                            </div>
                          );
                        }
                        if (value && typeof value !== 'object') {
                          return (
                            <div className="col-md-6" key={key}>
                              <div className="p-3 bg-light rounded-3 h-100">
                                <h6 className="text-muted mb-2 text-capitalize">{formatLabel(key)}</h6>
                                <p className="mb-0 fw-semibold">{value}</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mental History Tab */}
            {patient.patientHistory?.mental && Object.values(patient.patientHistory.mental).some(value => value === true) && (
              <div className="tab-pane fade" id="mental" role="tabpanel">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="row g-3">
                      {Object.entries(patient.patientHistory.mental).map(([key, value]) => {
                        if (value === true) {
                          return (
                            <div className="col-md-4" key={key}>
                              <div className="p-3 bg-light rounded-3 h-100">
                                <h6 className="text-muted mb-2 text-capitalize">{formatLabel(key)}</h6>
                                <span className="badge bg-success">Yes</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Past History Tab */}
            {patient.patientHistory?.past && Object.values(patient.patientHistory.past).some(value => value) && (
              <div className="tab-pane fade" id="past" role="tabpanel">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="row g-3">
                      {Object.entries(patient.patientHistory.past).map(([key, value]) => {
                        if (value) {
                          return (
                            <div className="col-md-6" key={key}>
                              <div className="p-3 bg-light rounded-3 h-100">
                                <h6 className="text-muted mb-2 text-capitalize">{formatLabel(key)}</h6>
                                <p className="mb-0 fw-semibold">{value}</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Family History Tab */}
            {patient.patientHistory?.family?.illnesses && Object.values(patient.patientHistory.family.illnesses).some(members => Object.values(members).some(value => value === true)) && (
              <div className="tab-pane fade" id="family" role="tabpanel">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="row g-3">
                      {Object.entries(patient.patientHistory.family.illnesses).map(([illness, members]) => {
                        const hasMembers = Object.values(members).some(value => value === true);
                        if (hasMembers) {
                          return (
                            <div className="col-md-6" key={illness}>
                              <div className="p-3 bg-light rounded-3 h-100">
                                <h6 className="text-muted mb-2">{formatLabel(illness)}</h6>
                                <div className="d-flex flex-wrap gap-2">
                                  {Object.entries(members).map(([member, value]) => {
                                    if (value === true) {
                                      return (
                                        <span key={member} className="badge bg-primary">
                                          {formatLabel(member)}
                                        </span>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Environmental History Tab */}
            {patient.patientHistory?.environmental && Object.values(patient.patientHistory.environmental).some(value => value) && (
              <div className="tab-pane fade" id="environmental" role="tabpanel">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="row g-3">
                      {Object.entries(patient.patientHistory.environmental).map(([key, value]) => {
                        if (value) {
                          return (
                            <div className="col-md-6" key={key}>
                              <div className="p-3 bg-light rounded-3 h-100">
                                <h6 className="text-muted mb-2 text-capitalize">{formatLabel(key)}</h6>
                                <p className="mb-0 fw-semibold">{value}</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Allergy History Tab */}
            {patient.patientHistory?.allergy && Object.values(patient.patientHistory.allergy).some(value => value) && (
              <div className="tab-pane fade" id="allergy" role="tabpanel">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="row g-3">
                      {Object.entries(patient.patientHistory.allergy).map(([key, value]) => {
                        if (value) {
                          return (
                            <div className="col-md-6" key={key}>
                              <div className="p-3 bg-light rounded-3 h-100">
                                <h6 className="text-muted mb-2 text-capitalize">{formatLabel(key)}</h6>
                                <p className="mb-0 fw-semibold">{value}</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conditions Tab */}
            {patient.patientHistory?.patientHistory2 && Object.values(patient.patientHistory.patientHistory2).some(data => Object.values(data).some(value => value === true || (typeof value === 'string' && value))) && (
              <div className="tab-pane fade" id="conditions" role="tabpanel">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    {Object.entries(patient.patientHistory.patientHistory2).map(([condition, data]) => {
                      const hasValues = Object.values(data).some(value => value === true || (typeof value === 'string' && value));
                      if (hasValues) {
                        return (
                          <div key={condition} className="mb-4">
                            <h5 className="text-primary mb-3">{formatLabel(condition)}</h5>
                            <div className="row g-3">
                              {Object.entries(data).map(([key, value]) => {
                                if (value === true || (typeof value === 'string' && value)) {
                                  return (
                                    <div className="col-md-6" key={key}>
                                      <div className="p-3 bg-light rounded-3 h-100">
                                        <h6 className="text-muted mb-2 text-capitalize">{formatLabel(key)}</h6>
                                        <p className="mb-0 fw-semibold">{value === true ? 'Yes' : value}</p>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Diagnosis Tab */}
            {patient.diagnosis && Object.values(patient.diagnosis).some(value => value === true || (typeof value === 'string' && value)) && (
              <div className="tab-pane fade" id="diagnosis" role="tabpanel">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="row g-3">
                      {Object.entries(patient.diagnosis).map(([key, value]) => {
                        if (value === true || (typeof value === 'string' && value)) {
                          return (
                            <div className="col-md-4" key={key}>
                              <div className="p-3 bg-light rounded-3 h-100">
                                <h6 className="text-muted mb-2 text-capitalize">{formatLabel(key)}</h6>
                                <p className="mb-0 fw-semibold">{value === true ? 'Yes' : value}</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Examination Tab */}
            {patient.examination && Object.values(patient.examination).some(value => value === true || (typeof value === 'string' && value)) && (
              <div className="tab-pane fade" id="examination" role="tabpanel">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="row g-3">
                      {Object.entries(patient.examination).map(([key, value]) => {
                        if (value === true || (typeof value === 'string' && value)) {
                          return (
                            <div className="col-md-4" key={key}>
                              <div className="p-3 bg-light rounded-3 h-100">
                                <h6 className="text-muted mb-2 text-capitalize">{formatLabel(key)}</h6>
                                <p className="mb-0 fw-semibold">{value === true ? 'Yes' : value}</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUp;