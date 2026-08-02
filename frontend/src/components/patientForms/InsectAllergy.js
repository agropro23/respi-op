// Form structure for Insect Allergy based on the image
function InsectAllergyForm({ formData, onChange }) {
  const handleInputChange = (field, value) => {
    onChange({
      ...formData,
      [field]: value
    });
  };

  const handleReactionChange = (reaction, checked) => {
    onChange({
      ...formData,
      reactions: {
        ...formData.reactions,
        [reaction]: checked
      }
    });
  };

  return (
    <form>
      <div className="mb-4">
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Insect</label>
            <input
              type="text"
              className="form-control"
              value={formData.insect || ''}
              onChange={(e) => handleInputChange('insect', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>When Bitten</label>
            <input
              type="text"
              className="form-control"
              value={formData.whenBitten || ''}
              onChange={(e) => handleInputChange('whenBitten', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
        </div>

        <h6 className="fw-semibold text-dark mb-3" style={{ color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Reactions
        </h6>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="itching"
                checked={formData.reactions?.itching || false}
                onChange={(e) => handleReactionChange('itching', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="itching">Itching</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="burning"
                checked={formData.reactions?.burning || false}
                onChange={(e) => handleReactionChange('burning', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="burning">Burning</label>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="redness"
                checked={formData.reactions?.redness || false}
                onChange={(e) => handleReactionChange('redness', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="redness">Redness</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="swelling"
                checked={formData.reactions?.swelling || false}
                onChange={(e) => handleReactionChange('swelling', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="swelling">Swelling</label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default InsectAllergyForm;