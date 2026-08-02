// Form structure for Urticaria / Angioedema based on the image
function UrticariaAngioedemaForm({ formData, onChange }) {
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
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Duration of Episodes</label>
            <input
              type="text"
              className="form-control"
              value={formData.durationOfEpisodes || ''}
              onChange={(e) => handleInputChange('durationOfEpisodes', e.target.value)}
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
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Aggravating Factors</label>
            <input
              type="text"
              className="form-control"
              value={formData.aggravatingFactors || ''}
              onChange={(e) => handleInputChange('aggravatingFactors', e.target.value)}
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
                id="hives"
                checked={formData.hives || false}
                onChange={(e) => handleCheckboxChange('hives', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="hives">Hives</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="swelling"
                checked={formData.swelling || false}
                onChange={(e) => handleCheckboxChange('swelling', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="swelling">Swelling</label>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="fever"
                checked={formData.fever || false}
                onChange={(e) => handleCheckboxChange('fever', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="fever">Fever</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="urinaryTractInfection"
                checked={formData.urinaryTractInfection || false}
                onChange={(e) => handleCheckboxChange('urinaryTractInfection', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="urinaryTractInfection">Urinary Tract Infection</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="jointPain"
                checked={formData.jointPain || false}
                onChange={(e) => handleCheckboxChange('jointPain', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="jointPain">Joint Pain</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="abdominalPain"
                checked={formData.abdominalPain || false}
                onChange={(e) => handleCheckboxChange('abdominalPain', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="abdominalPain">Abdominal Pain</label>
            </div>
          </div>
        </div>

        <h6 className="fw-semibold text-dark mb-3" style={{ color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Test Results
        </h6>

        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Scratch Test</label>
            <input
              type="text"
              className="form-control"
              value={formData.scratchTest || ''}
              onChange={(e) => handleInputChange('scratchTest', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Pressure Test</label>
            <input
              type="text"
              className="form-control"
              value={formData.pressureTest || ''}
              onChange={(e) => handleInputChange('pressureTest', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Cold Test</label>
            <input
              type="text"
              className="form-control"
              value={formData.coldTest || ''}
              onChange={(e) => handleInputChange('coldTest', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
        </div>
      </div>
    </form>
  );
}

export default UrticariaAngioedemaForm;