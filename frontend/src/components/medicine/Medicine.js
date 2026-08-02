import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import ModalHeader from '../ModalHeader';

const API_URL = `${process.env.REACT_APP_CLIENT_BASE_URL}/api/medicine`;

const Medicine = () => {
    const [name, setName] = useState(''); // For Add Medicine form
    const [medicines, setMedicines] = useState([]);
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
    const [showEditMedicineModal, setShowEditMedicineModal] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null); // For Edit Medicine form
    const [editMedicineName, setEditMedicineName] = useState(''); // For Edit Medicine form input

    // Fetch all medicines
    const fetchMedicines = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await apiFetch(API_URL);
            const data = await res.json();
            const medicinesList = data.data || [];
            setMedicines(medicinesList);
            setFilteredMedicines(medicinesList);
        } catch {
            setError('Failed to fetch medicines');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMedicines();
    }, []);

    // Search functionality
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredMedicines(medicines);
        } else {
            const filtered = medicines.filter(med => 
                med.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredMedicines(filtered);
        }
    }, [searchQuery, medicines]);

    // Handle Add Medicine
    const handleAddMedicine = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!name.trim()) {
            setError('Medicine name is required');
            return;
        }
        try {
            const res = await apiFetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to add medicine');
            } else {
                setSuccess('Medicine added successfully');
                setName('');
                setShowAddMedicineModal(false);
                fetchMedicines();
            }
        } catch {
            setError('Failed to add medicine');
        }
    };

    // Handle Edit Medicine (modal submission)
    const handleEditMedicine = async () => {
        setError('');
        setSuccess('');
        if (!editMedicineName.trim()) {
            setError('Medicine name is required');
            return;
        }
        try {
            const res = await apiFetch(`${API_URL}/${selectedMedicine._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editMedicineName.trim() })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to update medicine');
            } else {
                setSuccess('Medicine updated successfully');
                setShowEditMedicineModal(false);
                setSelectedMedicine(null);
                setEditMedicineName('');
                fetchMedicines();
            }
        } catch {
            setError('Failed to update medicine');
        }
    };

    // Handle Delete Medicine
    const handleDeleteMedicine = async (id) => {
        if (!window.confirm('Are you sure you want to delete this medicine?')) return;
        setError('');
        setSuccess('');
        try {
            const res = await apiFetch(`${API_URL}/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) setError(data.error || 'Failed to delete medicine');
            else {
                setSuccess('Medicine deleted successfully');
                fetchMedicines();
            }
        } catch {
            setError('Failed to delete medicine');
        }
    };

    // Open Edit Modal
    const openEditModal = (medicine) => {
        setSelectedMedicine(medicine);
        setEditMedicineName(medicine.name);
        setShowEditMedicineModal(true);
    };

    return (
        <div className="container py-4">
            {/* Success/Error Messages */}
            {success && (
                <div className="alert alert-success py-2 mb-3" role="alert">
                    {success}
                </div>
            )}
            {error && (
                <div className="alert alert-danger py-2 mb-3" role="alert">
                    {error}
                </div>
            )}

            {/* Header and Add Medicine Button */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Medicine List</h4>
                <button 
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={() => setShowAddMedicineModal(true)}
                >
                    <Plus size={20} /> Add New Medicine
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4 position-relative">
                <div className="input-group">
                    <span className="input-group-text bg-light border-end-0" style={{ borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>
                        <Search size={18} />
                    </span>
                    <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search medicines..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ 
                            borderTopRightRadius: 8, 
                            borderBottomRightRadius: 8,
                            padding: '12px',
                            fontSize: 16
                        }}
                    />
                </div>
            </div>

            {/* Medicine Table */}
            {loading ? (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : ( 
                <div className="table-responsive">
                    <table className="table table-hover" style={{ fontSize: 16 }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '16px', fontWeight: 600 }}>Medicine Name</th>
                                <th style={{ width: 160, padding: '16px', fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMedicines.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="text-center text-muted py-4">
                                        {searchQuery ? 'No medicines found matching your search' : 'No medicines found'}
                                    </td>
                                </tr>
                            ) : filteredMedicines.map(med => (
                                <tr key={med._id} style={{ verticalAlign: 'middle' }}>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ fontSize: 16 }}>{med.name}</span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div className="d-flex gap-2">
                                            <button 
                                                className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" 
                                                onClick={() => openEditModal(med)}
                                                style={{ borderRadius: 6, padding: '6px 12px' }}
                                            >
                                                <Edit2 size={16} />
                                                Edit
                                            </button>
                                            <button 
                                                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" 
                                                onClick={() => handleDeleteMedicine(med._id)}
                                                style={{ borderRadius: 6, padding: '6px 12px' }}
                                            >
                                                <Trash2 size={16} />
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

            {/* Add Medicine Modal */}
            {showAddMedicineModal && (
                <div className="modal-backdrop show"></div>
            )}
            {showAddMedicineModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content" style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                            <ModalHeader title="Add Medicine" onClose={() => setShowAddMedicineModal(false)} />
                            <form onSubmit={handleAddMedicine}>
                                <div className="modal-body" style={{ padding: '0 24px' }}>
                                    {error && (
                                        <div className="alert alert-danger py-2 mb-3" role="alert">
                                            {error}
                                        </div>
                                    )}
                                    {success && (
                                        <div className="alert alert-success py-2 mb-3" role="alert">
                                            {success}
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Medicine Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="Enter medicine name"
                                            style={{ padding: '12px', borderRadius: 8 }}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ borderTop: 'none', padding: '20px 24px' }}>
                                    <button type="button" className="btn btn-light px-4" onClick={() => setShowAddMedicineModal(false)} style={{ borderRadius: 8 }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-4" style={{ borderRadius: 8 }}>Add Medicine</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Medicine Modal */}
            {showEditMedicineModal && selectedMedicine && (
                <div className="modal-backdrop show"></div>
            )}
            {showEditMedicineModal && selectedMedicine && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content" style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                            <ModalHeader title="Edit Medicine" onClose={() => setShowEditMedicineModal(false)} />
                            <form onSubmit={(e) => { e.preventDefault(); handleEditMedicine(); }}>
                                <div className="modal-body" style={{ padding: '0 24px' }}>
                                    {error && (
                                        <div className="alert alert-danger py-2 mb-3" role="alert">
                                            {error}
                                        </div>
                                    )}
                                    {success && (
                                        <div className="alert alert-success py-2 mb-3" role="alert">
                                            {success}
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Medicine Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editMedicineName}
                                            onChange={e => setEditMedicineName(e.target.value)}
                                            placeholder="Enter medicine name"
                                            style={{ padding: '12px', borderRadius: 8 }}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ borderTop: 'none', padding: '20px 24px' }}>
                                    <button type="button" className="btn btn-light px-4" onClick={() => setShowEditMedicineModal(false)} style={{ borderRadius: 8 }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-4" style={{ borderRadius: 8 }}>Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Medicine;