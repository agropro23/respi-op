// Form structure for Rhinitis based on the image
function RhinitisForm({ formData, onChange }) {
  const handleInputChange = (field, value) => {
    onChange({
      ...formData,
      [field]: value
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
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Worst Season</label>
            <input
              type="text"
              className="form-control"
              value={formData.worstSeason || ''}
              onChange={(e) => handleInputChange('worstSeason', e.target.value)}
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
                id="sneezing"
                checked={formData.sneezing || false}
                onChange={(e) => handleInputChange('sneezing', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="sneezing">Sneezing</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="runningNose"
                checked={formData.runningNose || false}
                onChange={(e) => handleInputChange('runningNose', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="runningNose">Running Nose</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="discharge"
                checked={formData.discharge || false}
                onChange={(e) => handleInputChange('discharge', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="discharge">Discharge</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="nasalCongestion"
                checked={formData.nasalCongestion || false}
                onChange={(e) => handleInputChange('nasalCongestion', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="nasalCongestion">Nasal Congestion</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="nasalBleeding"
                checked={formData.nasalBleeding || false}
                onChange={(e) => handleInputChange('nasalBleeding', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="nasalBleeding">Nasal Bleeding</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="lossOfSmell"
                checked={formData.lossOfSmell || false}
                onChange={(e) => handleInputChange('lossOfSmell', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="lossOfSmell">Loss of Smell</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="nasalPolyps"
                checked={formData.nasalPolyps || false}
                onChange={(e) => handleInputChange('nasalPolyps', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="nasalPolyps">Nasal Polyps</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="itchingInNose"
                checked={formData.itchingInNose || false}
                onChange={(e) => handleInputChange('itchingInNose', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="itchingInNose">Itching in Nose</label>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="postNasalDischarge"
                checked={formData.postNasalDischarge || false}
                onChange={(e) => handleInputChange('postNasalDischarge', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="postNasalDischarge">Post Nasal Discharge</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="frequentSoreThroat"
                checked={formData.frequentSoreThroat || false}
                onChange={(e) => handleInputChange('frequentSoreThroat', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="frequentSoreThroat">Frequent Sore Throat</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="tighteningFromEyes"
                checked={formData.tighteningFromEyes || false}
                onChange={(e) => handleInputChange('tighteningFromEyes', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="tighteningFromEyes">Tightening from Eyes</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="earache"
                checked={formData.earache || false}
                onChange={(e) => handleInputChange('earache', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="earache">Earache</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="cough"
                checked={formData.cough || false}
                onChange={(e) => handleInputChange('cough', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="cough">Cough</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="earInfections"
                checked={formData.earInfections || false}
                onChange={(e) => handleInputChange('earInfections', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="earInfections">Ear Infections</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="dizzySpells"
                checked={formData.dizzySpells || false}
                onChange={(e) => handleInputChange('dizzySpells', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="dizzySpells">Dizzy Spells</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="itchingInEyes"
                checked={formData.itchingInEyes || false}
                onChange={(e) => handleInputChange('itchingInEyes', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="itchingInEyes">Itching in Eyes</label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default RhinitisForm;