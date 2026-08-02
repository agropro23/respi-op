import React from 'react';

const EXAMINATION_FIELDS = [
  { key: 'pulse', label: 'Pulse' },
  { key: 'bp', label: 'Blood Pressure' },
  { key: 'spo2', label: 'SpO2' },
  { key: 'pefr', label: 'PEFR' },
  { key: 'nasal', label: 'Nasal' },
  { key: 'respiratory', label: 'Respiratory' }
];

const DoctorExamination = ({ formData, onChange }) => {
  const handleInputChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="card shadow-sm" style={{ maxWidth: 800, margin: '40px auto' }}>
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-1 fw-semibold">Doctor's Examination</h5>
          </div>
        </div>
      </div>
      <div style={{ padding: '32px' }}>
        <div className="row">
          {EXAMINATION_FIELDS.map((field) => (
            <div className="col-md-6 mb-3" key={field.key}>
              <label className="form-label fw-medium text-dark" style={{ fontSize: 13 }}>
                {field.label}:
              </label>
              <input
                type="text"
                className="form-control"
                value={formData[field.key] || ''}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  padding: '10px 14px',
                  fontSize: '13px'
                }}
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            </div>
          ))}
        </div>
        <div className="mb-4">
          <label className="form-label fw-medium text-dark" style={{ fontSize: 13 }}>
            Additional Notes:
          </label>
          <textarea
            className="form-control"
            value={formData.additionalNotes || ''}
            onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
            style={{
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              padding: '10px 14px',
              fontSize: '13px',
              minHeight: '100px'
            }}
            placeholder="Enter any additional examination notes"
          />
        </div>
      </div>
    </div>
  );
};

export default DoctorExamination;