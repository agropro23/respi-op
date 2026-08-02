import React, { useState, useEffect } from 'react';
import Prescription from './Prescription';
import Medicine from '../medicine/Medicine';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { apiFetch } from '../../utils/api'; 


const API_URL = `${process.env.REACT_APP_CLIENT_BASE_URL}/api/patients`;

function ViewPatient() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPrescription, setShowPrescription] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [search, setSearch] = useState('');
    // For medicine modal/views
    const [showAddMedicine, setShowAddMedicine] = useState(false);
    const [showViewMedicine, setShowViewMedicine] = useState(false);

    useEffect(() => {
        apiFetch(API_URL)
            .then(res => res.json())
            .then(data => {
                setPatients(Array.isArray(data) ? data : data.patients || []);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to fetch patients');
                setLoading(false);
            });
    }, []);

    const handleAddPrescription = (patient) => {
        if (!patient._id) {
            setError('Invalid patient data');
            return;
        }
        setSelectedPatient(patient);
        setShowPrescription(true);
    };

    const handleClosePrescription = async () => {
        setShowPrescription(false);
        setSelectedPatient(null);
        // Optionally refresh the prescriptions list
        try {
            const response = await apiFetch(API_URL);
            const data = await response.json();
            setPatients(Array.isArray(data) ? data : data.patients || []);
        } catch (error) {
            console.error('Error refreshing patients:', error);
        }
    };


    // Filter patients by search
    const filteredPatients = patients.filter(p =>
        p.basicInfo?.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container py-4">
            {/* Top right buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24, gap: 12 }}>
                <button
                    className="btn btn-outline-primary"
                    style={{ borderRadius: 8, fontWeight: 500, fontSize: 15, padding: '8px 24px' }}
                    onClick={() => setShowAddMedicine(true)}
                >
                    Add Medicine
                </button>
                <button
                    className="btn btn-outline-primary"
                    style={{ borderRadius: 8, fontWeight: 500, fontSize: 15, padding: '8px 24px' }}
                    onClick={() => setShowViewMedicine(true)}
                >
                    View Medicine
                </button>
            </div>

            <div className="card shadow-sm" style={{ borderRadius: 16 }}>
                <div className="card-header bg-white d-flex justify-content-between align-items-center" style={{ borderRadius: '16px 16px 0 0' }}>
                    <h5 className="fw-bold text-dark mb-1">Patients</h5>
                    <div className="col-md-3" style={{ minWidth: 160 }}>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search patient by name..."
                                style={{ borderRadius: '8px 0 0 8px', fontSize: 15 }}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                style={{ borderRadius: '0 8px 8px 0', borderLeft: 0, padding: '2px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                tabIndex={-1}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="#6b7280" strokeWidth="2"/><path stroke="#6b7280" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <div className="text-muted mb-3" style={{ fontSize: 15 }}>
                        Select a patient to add a prescription
                    </div>
                    <div className="table-responsive">
                        <table className="table align-middle" style={{ minWidth: 600, fontSize: 15, width: '100%' }}>
                            <thead style={{ background: '#e0f2fe' }}>
                                <tr>
                                    <th style={{ padding: '14px 16px', width: '28%' }}>Name</th>
                                    <th style={{ padding: '14px 16px', width: '14%' }}>Age</th>
                                    <th style={{ padding: '14px 16px', width: '14%' }}>Sex</th>
                                    <th style={{ padding: '14px 16px', width: '24%' }}>Contact</th>
                                    <th style={{ padding: '14px 16px', width: '20%', minWidth: 120, textAlign: 'left' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="text-center">Loading...</td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={5} className="text-danger text-center">{error}</td>
                                    </tr>
                                ) : filteredPatients.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center text-muted">No patients found</td>
                                    </tr>
                                ) : filteredPatients.map((p, idx) => (
                                    <tr key={p._id || idx}>
                                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{p.basicInfo?.name}</td>
                                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{p.basicInfo?.age}</td>
                                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                                            <span className="badge rounded-pill" style={{ background: '#e0e7ff', color: '#3730a3', fontWeight: 500, fontSize: 14 }}>
                                                {p.basicInfo?.sex}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{p.basicInfo?.tel1 || p.basicInfo?.tel2 || p.basicInfo?.tel3 || 'N/A'}</td>
                                        <td style={{ padding: '10px 8px', verticalAlign: 'middle', textAlign: 'left', minWidth: 160 }}>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-primary btn-sm patient-action-btn"
                                                    style={{ borderRadius: 8, minWidth: 130, fontWeight: 600, letterSpacing: 0.5, boxShadow: '0 1px 2px rgba(37,99,235,0.08)', transition: 'background 0.2s, color 0.2s' }}
                                                    onClick={() => handleAddPrescription(p)}
                                                >
                                                    Add Prescription
                                                </button>
                                                <button
                                                    className="btn btn-outline-primary btn-sm patient-action-btn"
                                                    style={{ borderRadius: 8, minWidth: 130, fontWeight: 600, letterSpacing: 0.5, transition: 'background 0.2s, color 0.2s' }}
                                                    onClick={() => navigate(`/patients/${p.patientId}/prescriptions`)}
                                                >
                                                    <FileText size={16} className="me-2" />
                                                    View Prescriptions
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Show Prescription Modal */}
            {showPrescription && (
                <Prescription
                    initialPatient={selectedPatient}
                    onClose={handleClosePrescription}
                />
            )}

            {/* Add Medicine Modal */}
            {showAddMedicine && (
                <Medicine mode="add" onClose={() => setShowAddMedicine(false)} />
            )}

            {/* View Medicine Modal */}
            {showViewMedicine && (
                <Medicine mode="view" onClose={() => setShowViewMedicine(false)} />
            )}

            {/* Add global style for hover effect and remove vertical lines from table, keep horizontal lines */}
            <style>{`
                .patient-action-btn:hover {
                    filter: brightness(0.95);
                    transform: translateY(-2px) scale(1.03);
                    box-shadow: 0 4px 12px rgba(37,99,235,0.10);
                }
                .table.align-middle th,
                .table.align-middle td {
                    border-right: none !important;
                    border-left: none !important;
                    border-bottom: 1px solid #e5e7eb !important;
                }
                .table.align-middle tr:last-child td {
                    border-bottom: none !important;
                }
            `}</style>
        </div>
    );
}

export default ViewPatient;