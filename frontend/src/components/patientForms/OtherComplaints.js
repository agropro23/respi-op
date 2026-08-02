import React from 'react';

const OtherComplaintsForm = ({
  formData,
  onChange,
  patientForm,
  personalHistoryForm,
  mentalHistoryForm,
  pastHistoryForm,
  familyHistoryForm,
  environmentalHistoryForm,
  allergyHistoryForm,
  rhinitisForm,
  headachesForm,
  asthmaForm,
  urticariaAngioedemaForm,
  dermatitisOrEczemaForm,
  insectAllergyForm,
  tensionFatigueSyndromeForm
}) => {
  const handleInputChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  // Helper function to wrap text with newlines
  const wrapText = (text, maxLength) => {
    if (!text) return '';
    let result = '';
    for (let i = 0; i < text.length; i += maxLength) {
      result += text.substring(i, i + maxLength);
      if (i + maxLength < text.length) {
        result += '\n';
      }
    }
    return result;
  };

  // Helper function to check if a value is not empty/null/false
  const isNotEmpty = (val) => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'string') return val.trim() !== '';
    if (typeof val === 'object') return Object.keys(val).length > 0 && Object.values(val).some(val => val !== null && val !== undefined && val !== ''); // Adjusted for deeper check
    if (typeof val === 'boolean') return val;
    return true;
  };

  // Helper: Format label
  const formatLabel = (label) =>
    label
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace('Tel 1', 'Phone 1')
      .replace('Tel 2', 'Phone 2')
      .replace('Ref By', 'Referred By')
      .replace('Dr Address', 'Doctor Address')
      .replace('Dr Contact', 'Doctor Contact')
      .replace('Bittle Nut', 'Betel Nut')
      .replace('Other Mentals', 'Other Mental Conditions')
      .replace('Obst Gyn History', 'Obstetric/Gynecological History')
      .replace('Using AC', 'Using Air Conditioner');

  // Function to extract non-empty fields from an object, handling nested structures
  const getNonEmptyFields = (obj, prefix = '') => {
    const result = [];

    // Define forms that have direct boolean fields that need grouping
    const directBooleanFormMap = {
      'Mental History': 'Mental Conditions',
      'Rhinitis': 'Rhinitis Symptoms',
      'Asthma': 'Asthma Symptoms',
      'Tension/Fatigue Syndrome': 'Symptoms',
      'Urticaria/Angioedema': 'Urticaria/Angioedema Symptoms',
      'Dermatitis/Eczema': 'Dermatitis/Eczema Symptoms',
      'Diagnosis': 'Diagnosis',
      'Doctor Examination': 'Examination Findings'
    };

    const currentFormName = prefix.slice(0, -1); // e.g., 'Rhinitis' from 'Rhinitis.'

    if (directBooleanFormMap[currentFormName]) {
      const booleanFields = [];
      const otherFields = [];

      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'boolean' && value === true) {
          booleanFields.push(formatLabel(key));
        } else if (isNotEmpty(value)) {
          // For non-boolean fields, add them individually
          otherFields.push({ key: `${prefix}${key}`, label: formatLabel(key), value: value });
        }
      }

      if (booleanFields.length > 0) {
        result.push({
          key: prefix, // Use the form prefix as key for the grouped entry
          label: directBooleanFormMap[currentFormName],
          value: booleanFields.join(', ')
        });
      }
      result.push(...otherFields);
      return result; // Prevent further generic processing for this top-level form
    }

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined || value === '') continue;

      if (typeof value === 'object' && !Array.isArray(value)) {
        // Handle specific objects that need custom formatting
        if (prefix + key === 'Personal History.addictions') {
          const checkedAddictions = [];
          if (value.smoker) checkedAddictions.push('Smoker');
          if (value.alcoholic) checkedAddictions.push('Alcoholic');
          let addictionValue = checkedAddictions.join(', ');
          
          if (addictionValue) {
            result.push({ key: `${prefix}${key}`, label: 'Addictions', value: addictionValue });
          }
          if (value.details && value.details.trim() !== '') {
            const wrappedDetails = wrapText(value.details,50);
            result.push({ key: `${prefix}${key}.details`, label: 'Addiction Details', value: wrappedDetails });
          }
          continue; // Skip default processing for addictions
        }

        if (prefix + key === 'Family History.illnesses') {
          // Process family illnesses for better display
          const familyIllnessSummary = {};
          for (const illnessName of Object.keys(value)) {
            for (const memberName of Object.keys(value[illnessName])) {
              if (value[illnessName][memberName]) {
                if (!familyIllnessSummary[memberName]) {
                  familyIllnessSummary[memberName] = [];
                }
                familyIllnessSummary[memberName].push(illnessName);
              }
            }
          }
          for (const [member, illnesses] of Object.entries(familyIllnessSummary)) {
            result.push({ key: `${prefix}${member}`, label: member, value: illnesses.join(', ') });
          }
          continue; // Skip default processing for illnesses
        }

        // Generic handling for objects containing multiple boolean flags (checkbox groups)
        // This is for nested objects like associatedSymptoms in Headaches, or reactions in Insect Allergy
        const booleanFields = Object.entries(value).filter(([_, v]) => typeof v === 'boolean' && v === true);
        const nonBooleanFieldsInNestedObject = Object.entries(value).filter(([_, v]) => typeof v !== 'boolean' && isNotEmpty(v));

        if (booleanFields.length > 0) {
          const parentLabel = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
          
          const selectedLabels = booleanFields.map(([k, _]) => formatLabel(k));
          result.push({ key: `${prefix}${key}`, label: parentLabel, value: selectedLabels.join(', ') });

          for (const [nonBooleanKey, nonBooleanValue] of nonBooleanFieldsInNestedObject) {
            const nestedNonBooleanFields = getNonEmptyFields({ [nonBooleanKey]: nonBooleanValue }, `${prefix}${key}.${nonBooleanKey}.`);
            result.push(...nestedNonBooleanFields);
          }
          continue; // IMPORTANT: Ensure no further processing of this current object (value) by generic logic
        }

        const nestedFields = getNonEmptyFields(value, `${prefix}${key}.`);
        result.push(...nestedFields);
      } else if (Array.isArray(value)) {
        // Skip arrays (not used in provided forms)
        continue;
      } else if (typeof value !== 'boolean') { // Only include non-boolean primitive values here
        const label = formatLabel(key);
        result.push({ key: `${prefix}${key}`, label, value });
      }
    }
    return result;
  };

  // Collect non-empty fields from all forms
  const summaryFields = [
    ...getNonEmptyFields(patientForm, 'Patient Info.'),
    ...getNonEmptyFields(personalHistoryForm, 'Personal History.'),
    ...getNonEmptyFields(mentalHistoryForm, 'Mental History.'),
    ...getNonEmptyFields(pastHistoryForm, 'Past History.'),
    ...getNonEmptyFields(familyHistoryForm, 'Family History.'),
    ...getNonEmptyFields(environmentalHistoryForm, 'Environmental History.'),
    ...getNonEmptyFields(allergyHistoryForm, 'Allergy History.'),
    ...getNonEmptyFields(rhinitisForm, 'Rhinitis.'),
    ...getNonEmptyFields(headachesForm, 'Headaches.'),
    ...getNonEmptyFields(asthmaForm, 'Asthma.'),
    ...getNonEmptyFields(urticariaAngioedemaForm, 'Urticaria/Angioedema.'),
    ...getNonEmptyFields(dermatitisOrEczemaForm, 'Dermatitis/Eczema.'),
    ...getNonEmptyFields(insectAllergyForm, 'Insect Allergy.'),
    ...getNonEmptyFields(tensionFatigueSyndromeForm, 'Tension/Fatigue Syndrome.')
  ];

  // Group non-empty fields by section
  const groupedSummary = {};
  summaryFields.forEach(({ key, label, value }) => {
    const [section, ...rest] = key.split('.');
    if (!groupedSummary[section]) groupedSummary[section] = [];
    groupedSummary[section].push({ label, value });
  });

  return (
    <form>
      <div className="mb-4">
        {/* Summary Section */}
        <div className="mb-4">
          <h6 className="fw-semibold text-dark mb-3" style={{ color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Summary of Entered Data
          </h6>
          {Object.keys(groupedSummary).length === 0 ? (
            <p className="text-muted" style={{ fontSize: '13px' }}>No data entered yet.</p>
          ) : (
            <div style={{ maxHeight: '350px', overflowY: 'auto', borderRadius: '8px', border: '1px solid #d1d5db', padding: '16px', background: '#f9fafb' }}>
              {Object.entries(groupedSummary).map(([section, fields]) => (
                <div key={section} style={{ marginBottom: '18px' }}>
                  <div style={{ fontWeight: 600, color: '#2563eb', fontSize: '18px', marginBottom: '6px', borderBottom: '1px solid #e5e7eb', paddingBottom: '2px' }}>
                    {section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                  <ul className="list-group" style={{ border: 'none', marginBottom: 0 }}>
                    {fields.map(({ label, value }, idx) => (
                      <li
                        key={label + idx}
                        className="list-group-item d-flex justify-content-between align-items-center"
                        style={{ fontSize: '15px', padding: '8px 10px', border: 'none', background: 'transparent' }}
                      >
                        <span className="fw-medium text-dark">{label}:</span>
                        <span className="text-muted" style={label === 'Addiction Details' ? { whiteSpace: 'pre-wrap' } : {}}>{value.toString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Complaints Textarea */}
        <div className="mb-3">
          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Complaints</label>
          <textarea
            className="form-control"
            value={formData.complaints || ''}
            onChange={(e) => handleInputChange('complaints', e.target.value)}
            style={{
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              padding: '10px 14px',
              fontSize: '13px'
            }}
          />
        </div>
      </div>
    </form>
  );
};

export default OtherComplaintsForm;