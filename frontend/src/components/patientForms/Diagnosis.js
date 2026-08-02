import React from 'react';
import { Plus, X } from 'lucide-react';

const DIAGNOSIS_LIST = [
  { key: 'bronchialAsthma', label: 'Bronchial Asthma' },
  { key: 'copd', label: 'COPD' },
  { key: 'bronchiectasis', label: 'Bronchiectasis' },
  { key: 'rhinitis', label: 'Rhinitis' },
  { key: 'sinusitis', label: 'Sinusitis' },
  { key: 'drugAllergy', label: 'Drug Allergy' },
  { key: 'conjunctivitis', label: 'Conjunctivitis' },
  { key: 'eczema', label: 'Eczema' },
  { key: 'urticaria', label: 'Urticaria' }
];

const Diagnosis = ({ formData, onChange, error }) => {
  const handleCheckbox = (key) => {
    onChange(key, !formData[key]);
  };

  const handleOtherChange = (e) => {
    onChange('other', e.target.value);
  };

  return (
    <>
      <div className="card shadow-sm" style={{ maxWidth: 500, margin: '40px auto' }}>
        <div className="card-header bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title mb-1 fw-semibold">Diagnosis</h5>
            </div>
          </div>
        </div>
        <div style={{ padding: '32px' }}>
          <div className="row mb-3">
            {DIAGNOSIS_LIST.map((item, idx) => (
              <div className="col-6 mb-2" key={item.key}>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={item.key}
                    checked={formData[item.key]}
                    onChange={() => handleCheckbox(item.key)}
                    style={{ borderRadius: 4, cursor: 'pointer' }}
                  />
                  <label className="form-check-label" htmlFor={item.key} style={{ fontSize: 14, cursor: 'pointer' }}>
                    {item.label}
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <label className="form-label fw-medium text-dark" style={{ fontSize: 13 }}>Other:</label>
            <input
              type="text"
              className="form-control"
              value={formData.other}
              onChange={handleOtherChange}
              style={{
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                padding: '10px 14px',
                fontSize: '13px'
              }}
              placeholder="Specify other diagnosis"
            />
          </div>
          {error && (
            <div className="alert alert-danger" style={{ fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Diagnosis;