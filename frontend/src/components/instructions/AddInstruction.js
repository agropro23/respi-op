import React, { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { apiFetch } from '../../utils/api';   

const allergenCategories = [
  { key: 'Pollens', label: 'Pollens' },
  { key: 'Fungi', label: 'Fungi' },
  { key: 'Mites', label: 'Mites' },
  { key: 'Dusts', label: 'Dusts' },
  { key: 'Insects', label: 'Insects' },
  { key: 'Dander/Epithelia', label: 'Dander/Epithelia' },
  { key: 'Foods', label: 'Foods' },
  { key: 'Miscellaneous', label: 'Miscellaneous' },
];

const categoryOrder = [
  'pollens',
  'fungi',
  'mites',
  'dusts',
  'insects',
  'dander/epithelia',
  'foods',
  'miscellaneous',
];

const LANGUAGE_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'marathi', label: 'Marathi' },
];

// Utility to fetch patient image as base64
async function fetchPatientImageBase64(patientId) {
  const response = await fetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/patients/fori/${patientId}`);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

const AddInstruction = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(allergenCategories[0].key);
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedInstructions, setSelectedInstructions] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Fetch allergies in parallel and sort after fetching
    apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/allergies/all`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.data)) {
          setAllergies(data.data);
        } else {
          setAllergies([]);
          setError('No data found.');
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch allergies');
        setAllergies([]);
        setLoading(false);
      });
  }, []);

  const handleInstructionCheckbox = (allergyId, instructionIndex) => {
    const instructionKey = `${allergyId}-${instructionIndex}`;
    setSelectedInstructions(prev =>
      prev.includes(instructionKey)
        ? prev.filter(key => key !== instructionKey)
        : [...prev, instructionKey]
    );
  };

  const handleImageCheckbox = (allergyId) => {
    setSelectedImages(prev =>
      prev.includes(allergyId)
        ? prev.filter(id => id !== allergyId)
        : [...prev, allergyId]
    );
  };

  const isFoodOrMisc = selectedCategory.toLowerCase() === 'foods' || selectedCategory.toLowerCase() === 'miscellaneous';

  const displayedAllergies = allergies.filter(
    allergy => allergy.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const handleSave = async (language) => {
    let allInstructions = [];
    let allFoods = [];
    let allAllergyImages = [];

    categoryOrder.forEach(cat => {
      allergies
        .filter(a => a.category.toLowerCase() === cat)
        .forEach(allergy => {
          const instructionIndexes = (allergy.instructions || []).map((_, idx) => `${allergy._id}-${idx}`);
          const checkedInstructions = instructionIndexes.filter(key => selectedInstructions.includes(key));
          const imageChecked = selectedImages.includes(allergy._id);

          if (cat === 'foods' || cat === 'miscellaneous') {
            if (selectedInstructions.includes(`${allergy._id}-0`)) {
              allFoods.push(allergy.name);
            }
            if (imageChecked) {
              allAllergyImages.push(allergy._id);
            }
          } else {
            if (checkedInstructions.length > 0) {
              checkedInstructions.forEach(key => {
                const idx = parseInt(key.split('-')[1], 10);
                const instruction = allergy.instructions[idx];
                allInstructions.push(instruction);
              });
            }
            if (imageChecked) {
              allAllergyImages.push(allergy._id);
            }
          }
        });
    });

    allAllergyImages = Array.from(new Set(allAllergyImages));

    const dataToSave = [{
      allergenId: allAllergyImages,
      instructions: allInstructions,
      foods: allFoods
    }];

    try {
      const res = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/save-instruction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient: patientId, data: dataToSave })
      });
      if (res.status === 409) {
        const result = await res.json();
        const overwriteRes = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/save-instruction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient: patientId, data: dataToSave, overwrite: true })
        });
        if (overwriteRes.ok) {
          toast.success('Instructions saved successfully! Generating report...');
          setTimeout(() => navigate(`/display-instruction/${patientId}`, { state: { selectedLanguage } }), 1200);
        } else {
          toast.error('Failed to overwrite instructions');
        }
      } else if (res.ok) {
        toast.success('Instructions saved successfully! Generating report...');
        setTimeout(() => navigate(`/display-instruction/${patientId}`, { state: { selectedLanguage } }), 1200);
      } else {
        toast.error('Failed to save instructions');
      }
    } catch (err) {
      toast.error('Failed to save instructions');
    }
  };

  const handleDownloadExisting = async (existingId) => {
    navigate(`/display-instruction/${patientId}`);
  };

  return (
    <div className="container-fluid" style={{ padding: 0, minHeight: '100vh', background: '#f7f8fa' }}>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <div className="row" style={{ minHeight: '100vh' }}>
        {/* Sidebar: Categories */}
        <div className="col-md-2 bg-white shadow-sm" style={{ padding: 0, borderRight: '1px solid #eee', minHeight: '100vh' }}>
          <div className="p-3">
            <h5 className="fw-bold mb-3" style={{ fontSize: 18 }}>Categories</h5>
            <div className="d-flex flex-column gap-2">
              {allergenCategories.map((cat) => (
                <button
                  key={cat.key}
                  className={`btn btn-sm ${selectedCategory === cat.key ? 'btn-primary' : 'btn-outline-primary'}`}
                  style={{ textAlign: 'left', borderRadius: 8 }}
                  onClick={() => setSelectedCategory(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Main Panel: Allergies and Instructions */}
        <div className="col-md-7" style={{ padding: '20px 20px 0px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <span
              className="fa fa-arrow-left me-3"
              style={{ fontSize: 20, color: '#0f4c75', cursor: 'pointer', marginRight: 16 }}
              onClick={() => navigate('/patients')}
            ></span>
            <span style={{ fontWeight: 600, fontSize: 18, color: '#0f4c75', marginRight: 18 }}>Add Instructions</span>
            <span style={{ background: '#e3f0ff', color: '#1761a0', borderRadius: 8, padding: '4px 14px', fontWeight: 600, fontSize: 15 }}>
              Patient ID: {patientId}
            </span>
          </div>
          <div style={{
            background: '#e6f9ec',
            color: '#218838',
            borderRadius: 8,
            padding: '12px 18px',
            marginBottom: 18,
            fontWeight: 500,
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid #b7e4c7',
            boxShadow: '0 1px 4px rgba(33,136,56,0.04)'
          }}>
            <i className="fa fa-info-circle" style={{ fontSize: 20, marginRight: 8 }}></i>
            <span>
              <span style={{ fontWeight: 600, marginRight: 8}}>Instructions:</span>
              Select a category from the left, choose allergies and their instructions, and select images to include in the report. Use the language dropdown to set the PDF language. When done, click <b>Save Instructions</b> below.
            </span>
          </div>
          <div className="mb-3">
            <label htmlFor="language-select" className="form-label fw-bold">Instruction Language for PDF:</label>
            <select
              id="language-select"
              className="form-select"
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
              style={{ maxWidth: 220 }}
            >
              {LANGUAGE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {/* Allergies and Instructions */}
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : displayedAllergies.length === 0 ? (
            <div className="alert alert-info" style={{ margin: '24px 0' }}>No allergies found for this category.</div>
          ) : (
            <Fragment>
              <div className="mb-4">
                <h5 className="fw-bold mb-3" style={{ color: '#0f4c75' }}>{selectedCategory} Allergies</h5>
                <div className="d-flex flex-column gap-3">
                  {displayedAllergies.map((allergy, idx) => {
                    const allergyIndex = allergies.findIndex(a => a._id === allergy._id);
                    return (
                      <div key={allergy._id} className="card shadow-sm" style={{ borderRadius: 12, padding: 0, border: '1px solid #e3e3e3' }}>
                        <div className="card-body" style={{ padding: 20 }}>
                          <h6 className="fw-bold mb-2" style={{ color: '#222' }}>
                            {allergyIndex + 1}. {allergy.name && allergy.name[selectedLanguage] ? allergy.name[selectedLanguage] : (typeof allergy.name === 'string' ? allergy.name : allergy.name.english)}
                          </h6>
                          {isFoodOrMisc ? (
                            <div className="d-flex align-items-center">
                              <input
                                type="checkbox"
                                className="me-2"
                                style={{ width: 22, height: 22 }}
                                checked={selectedInstructions.includes(`${allergy._id}-0`)}
                                onChange={() => handleInstructionCheckbox(allergy._id, 0)}
                              />
                              <span style={{ fontSize: 13 }}>{allergy.name && allergy.name[selectedLanguage] ? allergy.name[selectedLanguage] : (typeof allergy.name === 'string' ? allergy.name : allergy.name.english)}</span>
                            </div>
                          ) : (
                            Array.isArray(allergy.instructions) && allergy.instructions.length > 0 ? (
                              <ul className="list-group list-group-flush mb-0" style={{ border: 'none' }}>
                                {allergy.instructions.map((inst, idx) => (
                                  <li
                                    className="px-2 py-1 d-flex align-items-center"
                                    key={idx}
                                    style={{ fontSize: 13, border: 'none', background: 'none' }}
                                  >
                                    <input
                                      type="checkbox"
                                      className="me-2"
                                      style={{ width: 22, height: 22 }}
                                      checked={selectedInstructions.includes(`${allergy._id}-${idx}`)}
                                      onChange={() => handleInstructionCheckbox(allergy._id, idx)}
                                    />
                                    <span>
                                      <strong>{`${allergyIndex + 1}${String.fromCharCode(65 + idx)}`}</strong>: {inst && inst[selectedLanguage] ? inst[selectedLanguage] : (typeof inst === 'string' ? inst : inst.english)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-muted">No instructions available</span>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Fragment>
          )}
        </div>
        {/* Right Panel: Images */}
        <div className="col-md-3 bg-white shadow-sm" style={{ padding: '32px 16px', borderLeft: '1px solid #eee', minHeight: '100vh' }}>
          <h5 className="fw-bold mb-3" style={{ color: '#0f4c75' }}>Select Images</h5>
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : displayedAllergies.length === 0 ? (
            <div className="alert alert-info" style={{ margin: '24px 0' }}>No images found for this category.</div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {displayedAllergies.map((allergy) => (
                <div key={allergy._id} className="card p-2 mb-2" style={{ borderRadius: 10, border: '1px solid #e3e3e3' }}>
                  <div className="d-flex align-items-center mb-2">
                    <input
                      type="checkbox"
                      className="me-2"
                      style={{ width: 22, height: 22 }}
                      checked={selectedImages.includes(allergy._id)}
                      onChange={() => handleImageCheckbox(allergy._id)}
                    />
                    <span style={{ fontSize: 13 }}>{allergy.name && allergy.name[selectedLanguage] ? allergy.name[selectedLanguage] : (typeof allergy.name === 'string' ? allergy.name : allergy.name.english)}</span>
                  </div>
                  {allergy.image && allergy.image.data && allergy.image.data !== '' ? (
                    <img
                      src={`data:${allergy.image.contentType};base64,${allergy.image.data}`}
                      alt={allergy.name && allergy.name[selectedLanguage] ? allergy.name[selectedLanguage] : (typeof allergy.name === 'string' ? allergy.name : allergy.name.english)}
                      className="w-100"
                      style={{ objectFit: 'cover', height: 120, borderRadius: 8 }}
                    />
                  ) : (
                    <div
                      style={{
                        height: 120,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                        color: '#aaa',
                        fontSize: 13,
                        background: 'none'
                      }}
                    >
                      No Image
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Sticky Save Bar */}
      <div className="sticky-bottom-bar" style={{ position: 'sticky', bottom: 0, background: '#fff', padding: '16px 0', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 12, zIndex: 10 }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
        <button className="btn btn-primary" onClick={() => handleSave(selectedLanguage)}>Save Instructions</button>
      </div>
    </div>
  );
};

export default AddInstruction;