// Form structure for Asthma based on the image
function AsthmaForm({ formData, onChange }) {
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
        </div>

        <h6 className="fw-semibold text-dark mb-3" style={{ color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Associated Conditions
        </h6>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="bronchitis"
                checked={formData.bronchitis || false}
                onChange={(e) => handleCheckboxChange('bronchitis', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="bronchitis">Bronchitis</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="pneumonia"
                checked={formData.pneumonia || false}
                onChange={(e) => handleCheckboxChange('pneumonia', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="pneumonia">Pneumonia</label>
            </div>
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
                id="cough"
                checked={formData.cough || false}
                onChange={(e) => handleCheckboxChange('cough', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="cough">Cough</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="shortenessOfBreath"
                checked={formData.shortenessOfBreath || false}
                onChange={(e) => handleCheckboxChange('shortenessOfBreath', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="shortenessOfBreath">Shorteness of Breath</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="tightnessOfChest"
                checked={formData.tightnessOfChest || false}
                onChange={(e) => handleCheckboxChange('tightnessOfChest', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="tightnessOfChest">Tightness of Chest</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="wheeze"
                checked={formData.wheeze || false}
                onChange={(e) => handleCheckboxChange('wheeze', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="wheeze">Wheeze</label>
            </div>
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Sputum Color</label>
            <input
              type="text"
              className="form-control"
              value={formData.sputumColor || ''}
              onChange={(e) => handleInputChange('sputumColor', e.target.value)}
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

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Medicines Taken</label>
            <input
              type="text"
              className="form-control"
              value={formData.medicinesTaken || ''}
              onChange={(e) => handleInputChange('medicinesTaken', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Attacks During</label>
            <input
              type="text"
              className="form-control"
              value={formData.attacksDuring || ''}
              onChange={(e) => handleInputChange('attacksDuring', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Hospital Visits/Admissions</label>
            <input
              type="text"
              className="form-control"
              value={formData.hospitalVisitsAdmissions || ''}
              onChange={(e) => handleInputChange('hospitalVisitsAdmissions', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Frequency of Attacks</label>
            <input
              type="text"
              className="form-control"
              value={formData.freqOfAttacks || ''}
              onChange={(e) => handleInputChange('freqOfAttacks', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Quality of Life</label>
            <input
              type="text"
              className="form-control"
              value={formData.qualityOfLife || ''}
              onChange={(e) => handleInputChange('qualityOfLife', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Last Attack</label>
            <input
              type="text"
              className="form-control"
              value={formData.lastAttack || ''}
              onChange={(e) => handleInputChange('lastAttack', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Days of Missed Work/School</label>
          <input
            type="text"
            className="form-control"
            value={formData.daysOfMissedWorkSchool || ''}
            onChange={(e) => handleInputChange('daysOfMissedWorkSchool', e.target.value)}
            style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
          />
        </div>
      </div>
    </form>
  );
}

export default AsthmaForm;
