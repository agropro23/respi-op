// Form structure for Headaches based on the image
function HeadachesForm({ formData, onChange }) {
  const handleInputChange = (field, value) => {
    onChange({
      ...formData,
      [field]: value
    });
  };

  const handleAssociatedSymptomsChange = (symptom, checked) => {
    onChange({
      ...formData,
      associatedSymptoms: {
        ...formData.associatedSymptoms,
        [symptom]: checked
      }
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
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Duration of Episode</label>
            <input
              type="text"
              className="form-control"
              value={formData.durationOfEpisode || ''}
              onChange={(e) => handleInputChange('durationOfEpisode', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Character of Headache</label>
            <input
              type="text"
              className="form-control"
              value={formData.characterOfHeadache || ''}
              onChange={(e) => handleInputChange('characterOfHeadache', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
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
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Frequency</label>
            <input
              type="text"
              className="form-control"
              value={formData.frequency || ''}
              onChange={(e) => handleInputChange('frequency', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Aggravation</label>
            <input
              type="text"
              className="form-control"
              value={formData.aggravation || ''}
              onChange={(e) => handleInputChange('aggravation', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
        </div>

        <h6 className="fw-semibold text-dark mb-3" style={{ color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Associated Symptoms
        </h6>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="nausea"
                checked={formData.associatedSymptoms?.nausea || false}
                onChange={(e) => handleAssociatedSymptomsChange('nausea', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="nausea">Nausea</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="vomiting"
                checked={formData.associatedSymptoms?.vomiting || false}
                onChange={(e) => handleAssociatedSymptomsChange('vomiting', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="vomiting">Vomiting</label>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="visualDisturbances"
                checked={formData.associatedSymptoms?.visualDisturbances || false}
                onChange={(e) => handleAssociatedSymptomsChange('visualDisturbances', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="visualDisturbances">Visual Disturbances</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="numbnessInExtremities"
                checked={formData.associatedSymptoms?.numbnessInExtremities || false}
                onChange={(e) => handleAssociatedSymptomsChange('numbnessInExtremities', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="numbnessInExtremities">Numbness in Extremities</label>
            </div>
          </div>
        </div>

        <div className="mb-3">
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
    </form>
  );
}

export default HeadachesForm;