import React from 'react';
import { X, Edit, Trash2 } from 'lucide-react';

const ViewAllergyInstructions = ({ 
  isOpen, 
  onClose, 
  allergy, 
  onEdit, 
  onDelete
}) => {
  if (!isOpen || !allergy) return null;

  const getNameInLanguage = (allergen, language) => {
    if (allergen.name && typeof allergen.name === 'object') {
      return allergen.name[language] || '';
    }
    return '';
  };

  const getInstructionsInLanguage = (allergen, language) => {
    const instructions = allergen.instructions;
    if (Array.isArray(instructions) && instructions.length > 0) {
      if (typeof instructions[0] === 'string') {
        return instructions.join(', ');
      } else if (typeof instructions[0] === 'object') {
        return instructions
          .map(inst => inst[language])
          .filter(Boolean)
          .join(', ');
      }
    }
    return '';
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content" style={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          {/* Modal Header */}
          <div className="modal-header" style={{ 
            borderBottom: '1px solid #e9ecef', 
            padding: '20px 24px',
            backgroundColor: '#f8f9fa'
          }}>
            <div>
              <h5 className="modal-title mb-0" style={{ fontSize: '18px', fontWeight: '600', color: '#212529' }}>
                {getNameInLanguage(allergy, 'english') || 'Allergy Details'}
              </h5>
              <small className="text-muted" style={{ fontSize: '12px' }}>
                Category: {allergy.category}
              </small>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              style={{ fontSize: '14px' }}
            />
          </div>

          {/* Modal Body */}
          <div className="modal-body" style={{ padding: '24px' }}>
            {/* Names Section */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-3" style={{ fontSize: '14px', color: '#495057', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Names in Different Languages
              </h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                    <label className="form-label fw-medium mb-1" style={{ fontSize: '12px', color: '#6c757d' }}>English</label>
                    <p className="mb-0" style={{ fontSize: '14px', color: '#212529' }}>
                      {getNameInLanguage(allergy, 'english') || <span className="text-muted">Not provided</span>}
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                    <label className="form-label fw-medium mb-1" style={{ fontSize: '12px', color: '#6c757d' }}>Hindi</label>
                    <p className="mb-0" style={{ fontSize: '14px', color: '#212529' }}>
                      {getNameInLanguage(allergy, 'hindi') || <span className="text-muted">Not provided</span>}
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                    <label className="form-label fw-medium mb-1" style={{ fontSize: '12px', color: '#6c757d' }}>Gujarati</label>
                    <p className="mb-0" style={{ fontSize: '14px', color: '#212529' }}>
                      {getNameInLanguage(allergy, 'gujarati') || <span className="text-muted">Not provided</span>}
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                    <label className="form-label fw-medium mb-1" style={{ fontSize: '12px', color: '#6c757d' }}>Marathi</label>
                    <p className="mb-0" style={{ fontSize: '14px', color: '#212529' }}>
                      {getNameInLanguage(allergy, 'marathi') || <span className="text-muted">Not provided</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {['fungi', 'mites', 'dusts'].includes(allergy.category) && allergy.sourceof && (
              <div className="mb-4">
                <h6 className="fw-semibold mb-2" style={{ fontSize: '14px', color: '#495057', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Source of Origin
                </h6>
                <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <span style={{ fontSize: '14px', color: '#2563eb', fontWeight: 500 }}>{allergy.sourceof}</span>
                </div>
              </div>
            )}

            {/* Instructions Section */}
            <div>
              <h6 className="fw-semibold mb-3" style={{ fontSize: '14px', color: '#495057', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Instructions
              </h6>
              {(() => {
                const instructions = allergy.instructions;
                if (Array.isArray(instructions) && instructions.length > 0) {
                  if (typeof instructions[0] === 'object') {
                    return (
                      <div className="row g-3">
                        {instructions.map((instruction, index) => (
                          <div key={index} className="col-12">
                            <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0" style={{ fontSize: '14px', color: '#495057', fontWeight: '600' }}>
                                  Instruction {index + 1}
                                </h6>
                              </div>
                              
                              {/* English and Hindi Row */}
                              <div className="row g-2 mb-2">
                                <div className="col-md-6">
                                  <label className="form-label fw-medium mb-1" style={{ fontSize: '12px', color: '#6c757d' }}>
                                    English
                                  </label>
                                  <div className="border rounded p-2" style={{ backgroundColor: 'white', minHeight: '40px' }}>
                                    <p className="mb-0" style={{ fontSize: '14px', color: '#212529' }}>
                                      {instruction.english || <span className="text-muted">Not provided</span>}
                                    </p>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label fw-medium mb-1" style={{ fontSize: '12px', color: '#6c757d' }}>
                                    Hindi
                                  </label>
                                  <div className="border rounded p-2" style={{ backgroundColor: 'white', minHeight: '40px' }}>
                                    <p className="mb-0" style={{ fontSize: '14px', color: '#212529' }}>
                                      {instruction.hindi || <span className="text-muted">Not provided</span>}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Gujarati and Marathi Row */}
                              <div className="row g-2">
                                <div className="col-md-6">
                                  <label className="form-label fw-medium mb-1" style={{ fontSize: '12px', color: '#6c757d' }}>
                                    Gujarati
                                  </label>
                                  <div className="border rounded p-2" style={{ backgroundColor: 'white', minHeight: '40px' }}>
                                    <p className="mb-0" style={{ fontSize: '14px', color: '#212529' }}>
                                      {instruction.gujarati || <span className="text-muted">Not provided</span>}
                                    </p>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label fw-medium mb-1" style={{ fontSize: '12px', color: '#6c757d' }}>
                                    Marathi
                                  </label>
                                  <div className="border rounded p-2" style={{ backgroundColor: 'white', minHeight: '40px' }}>
                                    <p className="mb-0" style={{ fontSize: '14px', color: '#212529' }}>
                                      {instruction.marathi || <span className="text-muted">Not provided</span>}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    return (
                      <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                        <p className="mb-0" style={{ fontSize: '14px', color: '#212529' }}>
                          {instructions.join(', ')}
                        </p>
                      </div>
                    );
                  }
                } else {
                  return (
                    <div className="border rounded p-3 text-center" style={{ backgroundColor: '#f8f9fa' }}>
                      <p className="mb-0 text-muted" style={{ fontSize: '14px' }}>No instructions available</p>
                    </div>
                  );
                }
              })()}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer" style={{ 
            borderTop: '1px solid #e9ecef', 
            padding: '16px 24px',
            backgroundColor: '#f8f9fa'
          }}>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => onEdit && onEdit(allergy)}
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                <Edit size={16} className="me-1" />
                Edit
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllergyInstructions; 