import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import AddAllergy from './AddAllergy';
import EditAllergy from './EditAllergy';
import ViewAllergyInstructions from './ViewAllergyInstructions';
import { apiFetch } from '../../utils/api';
import './allergy.css';

const API_URL = `${process.env.REACT_APP_CLIENT_BASE_URL}/api/allergies`;

const Allergy = ({ patientId, onAllergyUpdate }) => {
  const [allergens, setAllergens] = useState([]);
  const [filteredAllergens, setFilteredAllergens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddAllergyModal, setShowAddAllergyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAllergy, setSelectedAllergy] = useState(null);
  const [expandedAllergyId, setExpandedAllergyId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingAllergy, setViewingAllergy] = useState(null);
  const [editingAllergy, setEditingAllergy] = useState(null);

  const categories = [
    'all', 'pollens', 'fungi', 'mites', 'dusts', 'insects', 'dander/epithelia', 'foods', 'miscellaneous'
  ];

  const fetchAllergens = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(API_URL);
      const data = await res.json();
      const allergensList = data.data || [];
      setAllergens(allergensList);
      setFilteredAllergens(allergensList);
    } catch (err) {
      setError('Failed to fetch allergens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllergens();
  }, []);

  useEffect(() => {
    let currentFiltered = allergens.filter(allergen => {
      const matchesSearch = searchTerm === '' || 
        getNameInLanguage(allergen, 'english').toLowerCase().includes(searchTerm.toLowerCase()) ||
        getNameInLanguage(allergen, 'hindi').toLowerCase().includes(searchTerm.toLowerCase()) ||
        getNameInLanguage(allergen, 'gujarati').toLowerCase().includes(searchTerm.toLowerCase()) ||
        getNameInLanguage(allergen, 'marathi').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || allergen.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
    setFilteredAllergens(currentFiltered);
    window.scrollTo(0, 0);
  }, [searchTerm, selectedCategory, allergens]);

  const handleSuccess = (message) => {
    setSuccess(message);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
    // Don't refetch immediately, let the modal handle the state update
  };

  const handleError = (message) => {
    setError(message);
    setSuccess('');
    setTimeout(() => setError(''), 3000);
  };

  const handleDelete = async (allergyId) => {
    if (window.confirm('Are you sure you want to delete this allergy?')) {
      try {
        const response = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/allergies/${allergyId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setAllergens(prev => prev.filter(a => a._id !== allergyId));
          if (onAllergyUpdate) onAllergyUpdate();
        } else {
          alert('Failed to delete allergy');
        }
      } catch (error) {
        console.error('Error deleting allergy:', error);
        alert('Error deleting allergy');
      }
    }
  };

  const handleViewAllergy = (allergy) => {
    setViewingAllergy(allergy);
    setShowViewModal(true);
  };

  const handleEditFromView = (allergy) => {
    setViewingAllergy(null);
    setShowViewModal(false);
    setEditingAllergy(allergy);
    setShowEditModal(true);
  };

  const handleDeleteFromView = async (allergyId) => {
    if (window.confirm('Are you sure you want to delete this allergy?')) {
      try {
          const response = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/allergies/${allergyId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setAllergens(prev => prev.filter(a => a._id !== allergyId));
          setViewingAllergy(null);
          setShowViewModal(false);
          if (onAllergyUpdate) onAllergyUpdate();
        } else {
          alert('Failed to delete allergy');
        }
      } catch (error) {
        console.error('Error deleting allergy:', error);
        alert('Error deleting allergy');
      }
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'foods': '#28a745',
      'medications': '#dc3545',
      'environmental': '#17a2b8',
      'insects': '#ffc107',
      'miscellaneous': '#6c757d'
    };
    return colors[category] || '#6c757d';
  };

  const openEditModal = (allergy) => {
    setEditingAllergy(allergy);
    setShowEditModal(true);
  };

  // Helper function to get display name
  const getDisplayName = (allergen) => {
    const name = allergen.name;
    if (typeof name === 'string') {
      return name; // Old schema
    } else if (name && typeof name === 'object' && name.english) {
      return name.english; // New schema
    }
    return 'N/A';
  };

  // Helper function to get display instructions
  const getDisplayInstructions = (allergen) => {
    const instructions = allergen.instructions;
    if (Array.isArray(instructions) && instructions.length > 0) {
      if (typeof instructions[0] === 'string') {
        // Old schema: instructions is array of strings
        return instructions.filter(Boolean).join(', ');
      } else if (typeof instructions[0] === 'object') {
        // New schema: instructions is array of objects
        const validInstructions = instructions.filter(inst => 
          inst.english && inst.english.trim()
        );
        if (validInstructions.length > 0) {
          return validInstructions.map(inst => inst.english).join(', ');
        }
        // If no English instructions, show any instruction with other languages
        const anyInstructions = instructions.filter(inst => 
          inst.hindi?.trim() || inst.gujarati?.trim() || inst.marathi?.trim()
        );
        if (anyInstructions.length > 0) {
          return `${anyInstructions.length} instruction(s) (no English text)`;
        }
      }
    }
    return 'N/A';
  };

  // Helper function to get name in specific language
  const getNameInLanguage = (allergen, lang) => {
    const name = allergen.name;
    if (typeof name === 'string') {
      // Old schema: check separate fields
      if (lang === 'english') return name;
      return allergen[`name_${lang}`] || '';
    } else if (name && typeof name === 'object') {
      // New schema: check name object
      return name[lang] || '';
    }
    return '';
  };

  // Helper function to get instructions in specific language
  const getInstructionsInLanguage = (allergen, lang) => {
    const instructions = allergen.instructions;
    if (Array.isArray(instructions) && instructions.length > 0) {
      if (typeof instructions[0] === 'string') {
        // Old schema: check separate arrays
        const langInstructions = allergen[`instructions_${lang}`];
        return Array.isArray(langInstructions) ? langInstructions.filter(Boolean).join(', ') : '';
      } else if (typeof instructions[0] === 'object') {
        // New schema: check instructions objects
        return instructions.map(inst => inst[lang]).filter(Boolean).join(', ');
      }
    }
    return '';
  };

  const handleAddSuccess = (message) => {
    handleSuccess(message);
    setShowAddAllergyModal(false);
    // Refetch to get the new data
    fetchAllergens();
  };

  const handleEditSuccess = (message) => {
    handleSuccess(message);
    setShowEditModal(false);
    setSelectedAllergy(null);
    // Refetch to get the updated data
    fetchAllergens();
  };

  const toggleExpand = (id) => {
    setExpandedAllergyId(expandedAllergyId === id ? null : id);
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

      {/* Header and Add Allergy Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Allergy List</h4>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => setShowAddAllergyModal(true)}
          style={{
            borderRadius: '8px',
            backgroundColor: '#2563eb',
            border: 'none',
            fontWeight: '500',
            transition: 'all 0.2s ease-in-out',
            fontSize: '14px',
            padding: '10px 20px'
          }}
        >
          <Plus size={20} /> Add New Allergy
        </button>
      </div>

      {/* Search and Category Filters */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0" style={{ borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>
              <Search size={18} />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by allergy name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
                padding: '12px',
                fontSize: 16
              }}
            />
          </div>
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '12px', borderRadius: 8, fontSize: 16 }}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Allergens Table */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle" style={{ fontSize: '13px', minWidth: 700 }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '12px 8px', minWidth: 150 }}>Name</th>
                <th style={{ padding: '12px 8px', minWidth: 120 }}>Category</th>
                <th style={{ padding: '12px 8px', minWidth: 220, maxWidth: 300 }}>Instructions</th>
                <th style={{ width: '120px', padding: '12px 8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAllergens.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-muted py-4">
                    {searchTerm || selectedCategory !== 'all'
                      ? 'No allergies found matching your criteria.'
                      : 'No allergies added yet.'
                    }
                  </td>
                </tr>
              ) : (
                filteredAllergens.map((allergen) => (
                  <React.Fragment key={allergen._id}>
                    <tr className="allergy-row" style={{ borderBottom: expandedAllergyId === allergen._id ? 'none' : '1px solid #dee2e6', cursor: 'pointer' }}>
                      <td style={{ padding: '12px 8px', verticalAlign: 'middle', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={getNameInLanguage(allergen, 'english') || 'N/A'}>
                        <div style={{ fontWeight: '500' }}>
                          {getNameInLanguage(allergen, 'english') || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', verticalAlign: 'middle' }}>
                        <span className="badge" style={{ 
                          backgroundColor: getCategoryColor(allergen.category),
                          color: 'white',
                          fontSize: '11px',
                          padding: '4px 8px'
                        }}>
                          {allergen.category}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', verticalAlign: 'middle', maxWidth: 350, wordBreak: 'break-word' }} title={getDisplayInstructions(allergen)}>
                        <span>{getDisplayInstructions(allergen)}</span>
                      </td>
                      <td style={{ padding: '12px 8px', verticalAlign: 'middle' }}>
                        <div className="d-flex gap-1 justify-content-center">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewAllergy(allergen)}
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => openEditModal(allergen)}
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(allergen._id)}
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Allergy Modal */}
      {showAddAllergyModal && (
        <AddAllergy
          onClose={() => setShowAddAllergyModal(false)}
          onSuccess={handleAddSuccess}
          onError={handleError}
        />
      )}

      {/* Edit Allergy Modal */}
      {showEditModal && editingAllergy && (
        <EditAllergy
          allergyToEdit={editingAllergy}
          onClose={() => {
            setShowEditModal(false);
            setEditingAllergy(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* View Allergy Modal */}
      {showViewModal && viewingAllergy && (
        <ViewAllergyInstructions
          isOpen={showViewModal}
          allergy={viewingAllergy}
          onClose={() => {
            setShowViewModal(false);
            setViewingAllergy(null);
          }}
          onEdit={handleEditFromView}
          onDelete={handleDeleteFromView}
        />
      )}
    </div>
  );
};

export default Allergy;