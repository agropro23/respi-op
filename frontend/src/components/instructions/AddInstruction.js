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
  { key: 'Foods', label: 'Veg Food' },
  { key: 'Non Jain', label: 'Non Jain' },
  { key: 'Non-Veg', label: 'Non-Veg' },
  { key: 'Miscellaneous', label: 'Miscellaneous' },
];

const getFoodType = (allergen) => {
  if (!allergen) return '';
  if (allergen.foodCategory) {
    switch (allergen.foodCategory.toLowerCase()) {
      case 'veg': return 'Veg';
      case 'jain': return 'Non Jain';
      case 'non-veg': return 'Non-Veg';
    }
  }
  if (!allergen.name?.english) return '';
  const foodName = allergen.name.english.toLowerCase();
  const nonVegFoods = [
    'chicken', 'beef', 'pork', 'lamb', 'fish', 'shrimp', 'crab', 'lobster',
    'oyster', 'clam', 'mussel', 'scallop', 'squid', 'octopus', 'duck',
    'turkey', 'goose', 'quail', 'pheasant', 'venison', 'rabbit', 'goat',
    'mutton', 'bacon', 'ham', 'sausage', 'pepperoni', 'salami', 'anchovy',
    'tuna', 'salmon', 'cod', 'halibut', 'mackerel', 'sardine', 'herring',
    'trout', 'catfish', 'tilapia', 'swordfish', 'mahi mahi', 'grouper',
    'red snapper', 'sea bass', 'egg', 'eggs', 'yolk', 'albumin',
    'ovalbumin', 'ovomucoid', 'lysozyme'
  ];
  const jainFoods = [
    'potato', 'onion', 'garlic', 'ginger', 'carrot', 'radish', 'turnip',
    'beetroot', 'sweet potato', 'yam', 'taro', 'cassava', 'parsnip',
    'rutabaga', 'celeriac', 'horseradish', 'wasabi', 'leek', 'shallot',
    'chive', 'scallion', 'spring onion', 'asafoetida', 'hing', 'mushroom',
    'truffle', 'morel', 'chanterelle', 'shiitake', 'oyster mushroom',
    'portobello', 'cremini', 'enoki', 'maitake', 'reishi'
  ];
  if (nonVegFoods.some(food => foodName.includes(food))) return 'Non-Veg';
  if (jainFoods.some(food => foodName.includes(food))) return 'Non Jain';
  return 'Veg';
};

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
    const fetchData = async () => {
      try {
        const [allergiesRes, existingRes] = await Promise.all([
          apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/allergies/all`),
          patientId ? apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/save-instruction/by-patient/${patientId}`) : Promise.resolve(null)
        ]);

        let fetchedAllergies = [];
        if (allergiesRes.ok) {
          const data = await allergiesRes.json();
          if (data && data.success && Array.isArray(data.data)) {
            fetchedAllergies = data.data;
            setAllergies(fetchedAllergies);
          } else {
            setAllergies([]);
            setError('No data found.');
          }
        } else {
          setError('Failed to fetch allergies');
          setAllergies([]);
        }

        if (existingRes && existingRes.ok) {
          const responseData = await existingRes.json();
          if (responseData && responseData.success && Array.isArray(responseData.data) && responseData.data.length > 0) {
            const savedDoc = responseData.data[0];

            if (Array.isArray(savedDoc.allergiesImage)) {
              const imageIds = savedDoc.allergiesImage.map(img => typeof img === 'object' && img._id ? String(img._id) : String(img));
              setSelectedImages(imageIds);
            }

            const restoredInstructions = [];
            const savedInstructions = savedDoc.instructions || [];
            const savedFoods = savedDoc.foods || [];

            fetchedAllergies.forEach(allergy => {
              const cat = (allergy.category || '').toLowerCase();
              if (cat === 'foods' || cat === 'miscellaneous') {
                const isFoodChecked = savedFoods.some(food => {
                  const foodEng = (typeof food === 'object' ? food.english : food) || '';
                  const allergyEng = (typeof allergy.name === 'object' ? allergy.name.english : allergy.name) || '';
                  return foodEng.trim().toLowerCase() === allergyEng.trim().toLowerCase();
                });
                if (isFoodChecked) {
                  restoredInstructions.push(`${allergy._id}-0`);
                }
              } else {
                if (Array.isArray(allergy.instructions)) {
                  allergy.instructions.forEach((inst, idx) => {
                    const instEng = (typeof inst === 'object' ? inst.english : inst) || '';
                    const isInstChecked = savedInstructions.some(sInst => {
                      const sEng = (typeof sInst === 'object' ? sInst.english : sInst) || '';
                      return sEng.trim().toLowerCase() === instEng.trim().toLowerCase();
                    });
                    if (isInstChecked) {
                      restoredInstructions.push(`${allergy._id}-${idx}`);
                    }
                  });
                }
              }
            });

            setSelectedInstructions(restoredInstructions);
          }
        }
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

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

  const allergySrMap = React.useMemo(() => {
    const grouped = {};
    allergies.forEach(item => {
      const cat = (item.category || '').toLowerCase();
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    const srMap = {};
    let currentSr = 1;

    const categories = [
      'pollens',
      'fungi',
      'mites',
      'dusts',
      'insects',
      'dander/epithelia',
    ];

    categories.forEach(cat => {
      if (grouped[cat]) {
        grouped[cat].forEach(item => {
          srMap[item._id] = currentSr++;
        });
      }
    });

    // Foods split
    const foods = grouped['foods'] || [];
    const vegFoods = foods.filter(a => getFoodType(a) === 'Veg');
    const jainFoods = foods.filter(a => getFoodType(a) === 'Non Jain');
    const nonVegFoods = foods.filter(a => getFoodType(a) === 'Non-Veg');

    vegFoods.forEach(item => { srMap[item._id] = currentSr++; });
    jainFoods.forEach(item => { srMap[item._id] = currentSr++; });
    nonVegFoods.forEach(item => { srMap[item._id] = currentSr++; });

    // Miscellaneous
    const misc = grouped['miscellaneous'] || [];
    misc.forEach(item => { srMap[item._id] = currentSr++; });

    return srMap;
  }, [allergies]);

  const isFoodOrMisc = ['foods', 'non jain', 'non-veg', 'miscellaneous'].includes(selectedCategory.toLowerCase());

  const displayedAllergies = allergies.filter(allergy => {
    const allergyCategory = (allergy.category || '').toLowerCase();
    const selCat = selectedCategory.toLowerCase();

    if (['foods', 'non jain', 'non-veg'].includes(selCat)) {
      if (allergyCategory !== 'foods') return false;
      const foodType = getFoodType(allergy);
      if (selCat === 'foods') return foodType === 'Veg';
      if (selCat === 'non jain') return foodType === 'Non Jain';
      if (selCat === 'non-veg') return foodType === 'Non-Veg';
      return false;
    }

    return allergyCategory === selCat;
  });

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

  const allInstructionKeys = displayedAllergies.flatMap(allergy => {
    if (isFoodOrMisc) {
      return [`${allergy._id}-0`];
    } else if (Array.isArray(allergy.instructions)) {
      return allergy.instructions
        .map((inst, instIdx) => {
          const text = inst && inst[selectedLanguage] ? inst[selectedLanguage] : (typeof inst === 'string' ? inst : inst?.english);
          return text && typeof text === 'string' && text.trim() !== '' ? `${allergy._id}-${instIdx}` : null;
        })
        .filter(key => key !== null);
    }
    return [];
  });
  const allInstructionsSelected = allInstructionKeys.length > 0 && allInstructionKeys.every(key => selectedInstructions.includes(key));

  const handleSelectAllInstructions = () => {
    if (allInstructionsSelected) {
      setSelectedInstructions(prev => prev.filter(key => !allInstructionKeys.includes(key)));
    } else {
      setSelectedInstructions(prev => Array.from(new Set([...prev, ...allInstructionKeys])));
    }
  };

  const allImageIds = displayedAllergies
    .filter(a => a.image && a.image.data && a.image.data !== '')
    .map(a => a._id);
  const allImagesSelected = allImageIds.length > 0 && allImageIds.every(id => selectedImages.includes(id));

  const handleSelectAllImages = () => {
    if (allImagesSelected) {
      setSelectedImages(prev => prev.filter(id => !allImageIds.includes(id)));
    } else {
      setSelectedImages(prev => Array.from(new Set([...prev, ...allImageIds])));
    }
  };

  return (
    <div className="container-fluid" style={{ padding: 0, height: '100vh', display: 'flex', flexDirection: 'column', background: '#f7f8fa', overflow: 'hidden' }}>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <div className="row flex-grow-1" style={{ margin: 0, height: '100%', overflow: 'hidden' }}>
        {/* Sidebar: Categories */}
        <div className="col-md-2 bg-white shadow-sm" style={{ padding: 0, borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="p-3 custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
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
        <div className="col-md-7 d-flex flex-column" style={{ padding: '20px 20px 0px 32px', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
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
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0" style={{ color: '#0f4c75' }}>{selectedCategory} Allergies</h5>
                {displayedAllergies.length > 0 && (
                  <button className="btn btn-sm btn-outline-primary" onClick={handleSelectAllInstructions}>
                    {allInstructionsSelected ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>
              <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: 10, paddingBottom: 20, minHeight: 0 }}>
                <div className="d-flex flex-column gap-3">
                  {displayedAllergies.map((allergy, idx) => {
                    const allergySr = allergySrMap[allergy._id] || (idx + 1);
                    return (
                      <div key={allergy._id} className="card shadow-sm" style={{ borderRadius: 12, padding: 0, border: '1px solid #e3e3e3' }}>
                        <div className="card-body" style={{ padding: 20 }}>
                          <h6 className="fw-bold mb-2" style={{ color: '#222' }}>
                            {allergySr}. {allergy.name && allergy.name[selectedLanguage] ? allergy.name[selectedLanguage] : (typeof allergy.name === 'string' ? allergy.name : allergy.name.english)}
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
                                {allergy.instructions.map((inst, instIdx) => {
                                  const text = inst && inst[selectedLanguage] ? inst[selectedLanguage] : (typeof inst === 'string' ? inst : inst?.english);
                                  if (!text || typeof text !== 'string' || text.trim() === '') return null;
                                  return (
                                    <li
                                      className="px-2 py-1 d-flex align-items-center"
                                      key={instIdx}
                                      style={{ fontSize: 13, border: 'none', background: 'none' }}
                                    >
                                      <input
                                        type="checkbox"
                                        className="me-2"
                                        style={{ width: 22, height: 22 }}
                                        checked={selectedInstructions.includes(`${allergy._id}-${instIdx}`)}
                                        onChange={() => handleInstructionCheckbox(allergy._id, instIdx)}
                                      />
                                      <span>
                                        <strong>{`${allergySr}${String.fromCharCode(65 + instIdx)}`}</strong>: {text}
                                      </span>
                                    </li>
                                  );
                                })}
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
        <div className="col-md-3 bg-white shadow-sm d-flex flex-column" style={{ padding: '32px 16px 0px 16px', borderLeft: '1px solid #eee', height: '100%' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0" style={{ color: '#0f4c75' }}>Select Images</h5>
            {displayedAllergies.length > 0 && !loading && !error && (
              <button className="btn btn-sm btn-outline-primary" onClick={handleSelectAllImages}>
                {allImagesSelected ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
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
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: 5, paddingBottom: 20, minHeight: 0 }}>
              <div className="d-flex flex-column gap-3">
                {displayedAllergies.map((allergy) => (
                <div key={allergy._id} className="card p-2 mb-2" style={{ borderRadius: 10, border: '1px solid #e3e3e3' }}>
                  <div className="d-flex align-items-center mb-2">
                    {allergy.image && allergy.image.data && allergy.image.data !== '' && (
                      <input
                        type="checkbox"
                        className="me-2"
                        style={{ width: 22, height: 22 }}
                        checked={selectedImages.includes(allergy._id)}
                        onChange={() => handleImageCheckbox(allergy._id)}
                      />
                    )}
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
            </div>
          )}
        </div>
      </div>
      {/* Sticky Save Bar */}
      <div className="sticky-bottom-bar bg-white shadow-lg" style={{ padding: '16px 32px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 12, zIndex: 10 }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
        <button className="btn btn-primary" onClick={() => handleSave(selectedLanguage)}>Save Instructions</button>
      </div>
    </div>
  );
};

export default AddInstruction;