import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, User, X, History, Activity, Hand, Trash2 } from 'lucide-react';
import AddPatient from './AddPatient';
import { apiFetch } from '../../utils/api';
import EditPatient from './EditPatient';
import ModalHeader from '../ModalHeader';

const Patients = () => {
  const navigate = useNavigate();
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [errorPatients, setErrorPatients] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const fetchPatients = async () => {
    setLoadingPatients(true);
    setErrorPatients(null);
    try {
      const response = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/patients`);
      if (!response.ok) throw new Error('Failed to fetch patients');
      const data = await response.json();
      setPatients(Array.isArray(data) ? data : data.patients || []);
    } catch (err) {
      setErrorPatients(err.message);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Initial fetch only
  useEffect(() => {
    fetchPatients();
  }, []);

  const handleAddPatientClick = () => {
    setShowPatientForm(true);
  };

  const handleEditPatientClick = (patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  const handlePatientSuccess = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    fetchPatients(); // Refresh patients list after successful operation
  };

  const handlePatientError = () => {
    setShowErrorMessage(true);
    setTimeout(() => setShowErrorMessage(false), 3000);
  };

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient and all related data? This action cannot be undone.')) return;
    try {
      const res = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/patients/${patientId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete patient');
      setShowDeleteSuccess(true);
      setTimeout(() => setShowDeleteSuccess(false), 3000);
      fetchPatients();
    } catch (err) {
      setShowDeleteError(true);
      setTimeout(() => setShowDeleteError(false), 3000);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.basicInfo?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patientId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Success Message */}
      {showSuccessMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#10B981',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>Patient data successfully saved!</span>
        </div>
      )}

      {/* Delete Success Message */}
      {showDeleteSuccess && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#10B981',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>Patient data successfully deleted!</span>
        </div>
      )}

      {/* Error Message */}
      {showErrorMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#EF4444',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>Error saving patient data. Please try again.</span>
        </div>
      )}

      {/* Delete Error Message */}
      {showDeleteError && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#EF4444',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>Error deleting patient data. Please try again.</span>
        </div>
      )}

      {/* Patients Table */}
      <div className="d-flex gap-4 flex-wrap">
        {/* Add Patient Card */}
        <div className="card shadow-sm" style={{ flex: 1, minWidth: 320 }}>
          <div className="card-header bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="card-title mb-1 fw-semibold">Add Patient</h5>
                <p className="text-muted mb-0 small">Start by adding your first patient</p>
              </div>
            </div>
          </div>

          <div className="card-body p-5">
            <div
              style={{
                minHeight: '200px',
                border: '2px dashed #d1d5db',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: '#fafafa',
                transition: 'all 0.3s ease-in-out'
              }}
              onClick={handleAddPatientClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.backgroundColor = '#fafafa';
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <Plus size={32} style={{ color: '#6b7280' }} />
              </div>
              <h6 className="fw-semibold text-dark mb-2">New Patient</h6>
              <p className="text-muted mb-0 text-center" style={{ maxWidth: '300px' }}>
                Click here to add patient details and start managing their information
              </p>
            </div>
          </div>
        </div>

        {/* Edit Patient Card */}
        <div className="card shadow-sm" style={{ flex: 1, minWidth: 320 }}>
          <div className="card-header bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="card-title mb-1 fw-semibold">Edit Patient</h5>
                <p className="text-muted mb-0 small">Search and edit existing patient details</p>
              </div>
            </div>
          </div>
          <div className="card-body p-5">
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or ID..."
                style={{ borderRadius: '8px 0 0 8px', fontSize: 15 }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <span className="input-group-text" style={{ borderRadius: '0 8px 8px 0', borderLeft: 0, background: '#f3f4f6' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="#6b7280" strokeWidth="2" /><path stroke="#6b7280" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" /></svg>
              </span>
            </div>
            {searchQuery && (
              <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 8 }}>
                {filteredPatients.length === 0 ? (
                  <div className="text-muted">No patients found.</div>
                ) : (
                  <ul className="list-group">
                    {filteredPatients.map((patient) => (
                      <li key={patient._id} className="list-group-item d-flex justify-content-between align-items-center" style={{ fontSize: 15 }}>
                        <div>
                          <span style={{ fontWeight: 600, color: '#2563eb' }}>{patient.patientId}</span>
                          <span style={{ marginLeft: 12 }}>{patient.basicInfo?.name}</span>
                        </div>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          style={{ borderRadius: 8, fontWeight: 500, fontSize: 14 }}
                          onClick={() => handleEditPatientClick(patient)}
                        >
                          Edit Details
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patients List */}
      <div className="card shadow-sm mt-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-6 fw-bold text-dark" style={{ fontSize: '16px' }}>Patients List</h5>
          <div className="input-group" style={{ minWidth: 160, maxWidth: 400 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or ID..."
              style={{ borderRadius: '8px 0 0 8px', fontSize: 15, minWidth: 0 }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <span className="input-group-text" style={{ borderRadius: '0 8px 8px 0', borderLeft: 0, background: '#f3f4f6' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="#6b7280" strokeWidth="2" /><path stroke="#6b7280" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" /></svg>
            </span>
          </div>
        </div>
        <div className="card-body">
          {loadingPatients && <div>Loading patients...</div>}
          {errorPatients && <div className="text-danger">{errorPatients}</div>}
          {!loadingPatients && !errorPatients && patients.length === 0 && (
            <div className="text-muted">No patients found.</div>
          )}
          {!loadingPatients && !errorPatients && patients.length > 0 && (
            <div className="table-responsive">
              <table className="table align-middle" style={{ minWidth: 700, fontSize: 15, width: '100%' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '14px 16px', width: '10%' }}>Patient ID</th>
                    <th style={{ padding: '14px 16px', width: '13%' }}>Name</th>
                    <th style={{ padding: '14px 16px', width: '5%' }}>Age</th>
                    <th style={{ padding: '14px 16px', width: '5%' }}>Sex</th>
                    <th style={{ padding: '14px 16px', width: '43%', minWidth: 300, textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient._id}>
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', fontWeight: 500, color: '#2563eb' }}>{patient.patientId}</td>
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{patient.basicInfo?.name}</td>
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{patient.basicInfo?.age}</td>
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                        <span className="badge rounded-pill" style={{ background: '#e0e7ff', color: '#3730a3', fontWeight: 500, fontSize: 14 }}>
                          {patient.basicInfo?.sex}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', verticalAlign: 'middle', textAlign: 'left', minWidth: 220 }}>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            className="btn btn-primary btn-sm patient-action-btn"
                            onClick={() => navigate(`/patients/${patient.patientId}`)}
                            style={{ minWidth: 90, fontWeight: 600, letterSpacing: 0.5, borderRadius: 8, boxShadow: '0 1px 2px rgba(37,99,235,0.08)', transition: 'background 0.2s, color 0.2s' }}
                          >
                            <User size={20} />
                            View
                          </button>
                          <button
                            className="btn btn-warning btn-sm patient-action-btn"
                            onClick={() => navigate(`/patients/${patient.patientId}/test`)}
                            style={{
                              minWidth: 120,
                              fontWeight: 600,
                              letterSpacing: 0.5,
                              borderRadius: 8,
                              boxShadow: '0 1px 2px rgba(251,191,36,0.08)',
                              color: '#fff',
                              background: '#f59e42',
                              border: 'none',
                              transition: 'background 0.2s, color 0.2s'
                            }}
                          >
                            <Activity size={20} className="me-1" />
                            Allergy Test
                          </button>
                          <button
                            className="btn btn-success btn-sm patient-action-btn"
                            onClick={() => navigate(`/patients/${patient.patientId}/patch-test`)}
                            style={{
                              minWidth: 120,
                              fontWeight: 600,
                              letterSpacing: 0.5,
                              borderRadius: 8,
                              boxShadow: '0 1px 2px rgba(34,197,94,0.08)',
                              color: '#fff',
                              background: '#10b981',
                              border: 'none',
                              transition: 'background 0.2s, color 0.2s'
                            }}
                          >
                            <Activity size={20} className="me-1" />
                            Patch Test
                          </button>
                          <button
                            className="btn btn-info btn-sm patient-action-btn"
                            onClick={() => {
                              navigate(`/patients/${patient.patientId}/add-instruction`);
                              window.scrollTo(0, 0);
                            }}
                            style={{
                              minWidth: 120,
                              fontWeight: 600,
                              letterSpacing: 0.5,
                              borderRadius: 8,
                              boxShadow: '0 1px 2px rgba(59,130,246,0.08)',
                              color: '#fff',
                              background: '#3b82f6',
                              border: 'none',
                              transition: 'background 0.2s, color 0.2s'
                            }}
                          >
                            <span className="me-1" style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
                              <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="4" y="4" width="20" height="24" rx="2.5" stroke="currentColor" strokeWidth="2.2"/>
                                <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" />
                                <rect x="11" y="7" width="7" height="1.7" rx="0.85" fill="currentColor" />
                                <rect x="8" y="12" width="10" height="1.7" rx="0.85" fill="currentColor" />
                                <rect x="8" y="16" width="7" height="1.7" rx="0.85" fill="currentColor" />
                                <rect x="8" y="20" width="7" height="1.7" rx="0.85" fill="currentColor" />
                                <rect x="8" y="24" width="7" height="1.7" rx="0.85" fill="currentColor" />
                                <path d="M16 19v5.5c0 3.5 2.5 5.5 5 5.5s5-2 5-5.5V21a2 2 0 0 0-2-2c-1.1 0-2 .9-2 2v-4a2 2 0 0 0-2-2c-1.1 0-2 .9-2 2v2z" stroke="currentColor" strokeWidth="2.2" fill="none"/>
                              </svg>
                            </span>
                            Instruction
                          </button>
                          <button
                            className="btn btn-danger btn-sm patient-action-btn"
                            onClick={() => handleDeletePatient(patient.patientId)}
                            style={{
                              minWidth: 120,
                              fontWeight: 600,
                              letterSpacing: 0.5,
                              borderRadius: 8,
                              boxShadow: '0 1px 2px rgba(239,68,68,0.08)',
                              color: '#fff',
                              background: '#ef4444',
                              border: 'none',
                              transition: 'background 0.2s, color 0.2s'
                            }}
                          >
                            <Trash2 size={18} className="me-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add global style for hover effect */}
      <style>{`
        .patient-action-btn:hover {
          filter: brightness(0.95);
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 4px 12px rgba(37,99,235,0.10);
        }
      `}</style>

      {showPatientForm && (
        <AddPatient
          onClose={() => setShowPatientForm(false)}
          onSuccess={handlePatientSuccess}
          onError={handlePatientError}
        />
      )}

      {showEditModal && selectedPatient && (
        <EditPatient
          patient={selectedPatient}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPatient(null);
          }}
          onSuccess={handlePatientSuccess}
          onError={handlePatientError}
        />
      )}
    </>
  );
};

export default Patients;