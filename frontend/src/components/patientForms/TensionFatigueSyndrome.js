// Form structure for Tension Fatigue Syndrome based on the image
function TensionFatigueSyndromeForm({ formData, onChange }) {
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
        <h6 className="fw-semibold text-dark mb-3" style={{ color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Symptoms
        </h6>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="fatigue"
                checked={formData.fatigue || false}
                onChange={(e) => handleCheckboxChange('fatigue', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="fatigue">Fatigue</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="tension"
                checked={formData.tension || false}
                onChange={(e) => handleCheckboxChange('tension', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="tension">Tension</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="excessiveSweating"
                checked={formData.excessiveSweating || false}
                onChange={(e) => handleCheckboxChange('excessiveSweating', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="excessiveSweating">Excessive Sweating</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="headaches"
                checked={formData.headaches || false}
                onChange={(e) => handleCheckboxChange('headaches', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="headaches">Headaches</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="nausea"
                checked={formData.nausea || false}
                onChange={(e) => handleCheckboxChange('nausea', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="nausea">Nausea</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="vomiting"
                checked={formData.vomiting || false}
                onChange={(e) => handleCheckboxChange('vomiting', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="vomiting">Vomiting</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="abdPain"
                checked={formData.abdPain || false}
                onChange={(e) => handleCheckboxChange('abdPain', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="abdPain">Abdominal Pain</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="diarrhoea"
                checked={formData.diarrhoea || false}
                onChange={(e) => handleCheckboxChange('diarrhoea', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="diarrhoea">Diarrhoea</label>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="constipation"
                checked={formData.constipation || false}
                onChange={(e) => handleCheckboxChange('constipation', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="constipation">Constipation</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="bedWetting"
                checked={formData.bedWetting || false}
                onChange={(e) => handleCheckboxChange('bedWetting', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="bedWetting">Bed Wetting</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="pallor"
                checked={formData.pallor || false}
                onChange={(e) => handleCheckboxChange('pallor', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="pallor">Pallor</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="weightLoss"
                checked={formData.weightLoss || false}
                onChange={(e) => handleCheckboxChange('weightLoss', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="weightLoss">Weight Loss</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="unexplainedFever"
                checked={formData.unexplainedFever || false}
                onChange={(e) => handleCheckboxChange('unexplainedFever', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="unexplainedFever">Unexplained Fever</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="vagueAches"
                checked={formData.vagueAches || false}
                onChange={(e) => handleCheckboxChange('vagueAches', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="vagueAches">Vague Aches</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="excessiveSchoolAbsences"
                checked={formData.excessiveSchoolAbsences || false}
                onChange={(e) => handleCheckboxChange('excessiveSchoolAbsences', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="excessiveSchoolAbsences">Excessive School Absences</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="darkOcularCircles"
                checked={formData.darkOcularCircles || false}
                onChange={(e) => handleCheckboxChange('darkOcularCircles', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="darkOcularCircles">Dark Ocular Circles</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="periorbitalOedema"
                checked={formData.periorbitalOedema || false}
                onChange={(e) => handleCheckboxChange('periorbitalOedema', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="periorbitalOedema">Periorbital Oedema</label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="cervicalAdenopathy"
                checked={formData.cervicalAdenopathy || false}
                onChange={(e) => handleCheckboxChange('cervicalAdenopathy', e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="cervicalAdenopathy">Cervical Adenopathy</label>
            </div>
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Sleep</label>
            <input
              type="text"
              className="form-control"
              value={formData.sleep || ''}
              onChange={(e) => handleInputChange('sleep', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Other Symptoms</label>
            <input
              type="text"
              className="form-control"
              value={formData.otherSymptoms || ''}
              onChange={(e) => handleInputChange('otherSymptoms', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>
        </div>
      </div>
    </form>
  );
}

export default TensionFatigueSyndromeForm;