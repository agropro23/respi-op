// Form structure for Dermatitis or Eczema based on the image
function DermatitisEczemaForm({ formData, onChange }) {
  const handleInputChange = (field, value) => {
    onChange({
      ...formData,
      [field]: value
    });
  };

  const handleCheckboxChange = (field, checked) => {
    onChange({
      ...formData,
      [field]: checked
    });
  };

  return (
    <form>
      <div className="mb-4">
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Onset</label>
            <input
              type="text"
              className="form-control"
              value={formData.onset || ''}
              onChange={(e) => handleInputChange('onset', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Rashes</label>
            <input
              type="text"
              className="form-control"
              value={formData.rashes || ''}
              onChange={(e) => handleInputChange('rashes', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Location</label>
            <input
              type="text"
              className="form-control"
              value={formData.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Possible Causes</label>
            <input
              type="text"
              className="form-control"
              value={formData.possibleCauses || ''}
              onChange={(e) => handleInputChange('possibleCauses', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
        </div>

        <h6 className="fw-semibold text-dark mb-3" style={{ color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Symptoms
        </h6>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="itching"
                checked={formData.itching || false}
                onChange={(e) => handleCheckboxChange('itching', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="itching">Itching</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="scaling"
                checked={formData.scaling || false}
                onChange={(e) => handleCheckboxChange('scaling', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="scaling">Scaling</label>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="burning"
                checked={formData.burning || false}
                onChange={(e) => handleCheckboxChange('burning', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="burning">Burning</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="infection"
                checked={formData.infection || false}
                onChange={(e) => handleCheckboxChange('infection', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="infection">Infection</label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default DermatitisEczemaForm;