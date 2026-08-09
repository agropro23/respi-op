import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, TextField, Grid, RadioGroup, FormControlLabel, Radio, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, Paper, Select, MenuItem, FormLabel, CircularProgress, Button, Snackbar, Alert,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import useReportDownload from '../utils/useReportDownload';
import { apiFetch } from '../utils/api';
import ModalHeader from './ModalHeader';
import './patchTestScroll.css';
import { handleNumberInput } from '../utils/inputUtils';

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

// Helper function to determine food type
// const getFoodType = (allergen) => {
//   if (!allergen || !allergen.name?.english) return '';
  
//   const foodName = allergen.name.english.toLowerCase();
  
//   // Non-vegetarian foods
//   const nonVegFoods = [
//     'chicken', 'beef', 'pork', 'lamb', 'fish', 'shrimp', 'crab', 'lobster', 'oyster', 'clam',
//     'mussel', 'scallop', 'squid', 'octopus', 'duck', 'turkey', 'goose', 'quail', 'pheasant',
//     'venison', 'rabbit', 'goat', 'mutton', 'bacon', 'ham', 'sausage', 'pepperoni', 'salami',
//     'anchovy', 'tuna', 'salmon', 'cod', 'halibut', 'mackerel', 'sardine', 'herring', 'trout',
//     'catfish', 'tilapia', 'swordfish', 'mahi mahi', 'grouper', 'red snapper', 'sea bass',
//     'egg', 'eggs', 'yolk', 'albumin', 'ovalbumin', 'ovomucoid', 'lysozyme'
//   ];
  
//   // Jain foods (strict vegetarian, no root vegetables)
//   const jainFoods = [
//     'potato', 'onion', 'garlic', 'ginger', 'carrot', 'radish', 'turnip', 'beetroot',
//     'sweet potato', 'yam', 'taro', 'cassava', 'parsnip', 'rutabaga', 'celeriac',
//     'horseradish', 'wasabi', 'leek', 'shallot', 'chive', 'scallion', 'spring onion',
//     'asafoetida', 'hing', 'mushroom', 'truffle', 'morel', 'chanterelle', 'shiitake',
//     'oyster mushroom', 'portobello', 'cremini', 'enoki', 'maitake', 'reishi'
//   ];
  
//   // Check if it's non-vegetarian
//   if (nonVegFoods.some(food => foodName.includes(food))) {
//     return 'Non-Veg';
//   }
  
//   // Check if it's Jain (strict vegetarian)
//   if (jainFoods.some(food => foodName.includes(food))) {
//     return 'Jain';
//   }
  
//   // Default to vegetarian
//   return 'Veg';
// };
const getFoodType = (allergen) => {
  if (!allergen) return '';

  // First priority: use foodCategory from DB
  if (allergen.foodCategory) {
    switch (allergen.foodCategory.toLowerCase()) {
      case 'veg':
        return 'Veg';

      case 'jain':
        return 'Non Jain';

      case 'non-veg':
        return 'Non-Veg';
    }
  }

  // Fallback for old records without foodCategory
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

  if (nonVegFoods.some(food => foodName.includes(food))) {
    return 'Non-Veg';
  }

  if (jainFoods.some(food => foodName.includes(food))) {
    return 'Non Jain';
  }

  return 'Veg';
};

// Helper function to get food type color
const getFoodTypeColor = (foodType) => {
  switch (foodType) {
    case 'Non-Veg':
      return '#dc2626'; // Red for non-vegetarian
    case 'Non Jain':
      return '#059669'; // Green for Jain
    case 'Veg':
      return '#2563eb'; // Blue for vegetarian
    default:
      return '#6b7280'; // Gray for unknown
  }
};

// Helper function to get food type background color
const getFoodTypeBackgroundColor = (foodType) => {
  switch (foodType) {
    case 'Non-Veg':
      return '#fef2f2'; // Light red background
    case 'Non Jain':
      return '#f0fdf4'; // Light green background
    case 'Veg':
      return '#eff6ff'; // Light blue background
    default:
      return '#f9fafb'; // Light gray background
  }
};

const BASE_URL = process.env.REACT_APP_CLIENT_BASE_URL;

export default function PatchTest() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patchTestData, setPatchTestData] = useState({
    positive: [],
    negative: [],
    allergens: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [reportType, setReportType] = useState('skin');
  const [positiveControl, setPositiveControl] = useState('');
  const [negativeControl, setNegativeControl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Pollens');
  const [allAllergens, setAllAllergens] = useState([]);
  const [groupedAllergens, setGroupedAllergens] = useState({});
  const [srMap, setSrMap] = useState({});
  const [enythemaInputs, setEnythemaInputs] = useState({});
  const [saveStatus, setSaveStatus] = useState({ open: false, message: '', severity: 'success' });
  const [errorDialog, setErrorDialog] = useState({ open: false, message: '' });
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [existingReportId, setExistingReportId] = useState(null);
  const [loadingAllergens, setLoadingAllergens] = useState(true);
  const [specialAdvices, setSpecialAdvices] = useState({
    immunotherapy: false,
    oralSublingual: false,
    srsInjections: false,
    oralSrsSublingual: false
  });
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('vipul');
  const [selectedRegionalLanguage, setSelectedRegionalLanguage] = useState('gujarati');
  const [pendingRedirect, setPendingRedirect] = useState(false);

  const { downloadReport } = useReportDownload();
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [selectedCategory]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientRes, allergensRes, patchRes] = await Promise.all([
          apiFetch(`${BASE_URL}/api/patients/${patientId}`),
          apiFetch(`${BASE_URL}/api/allergies/all`),
          patientId ? apiFetch(`${BASE_URL}/api/patch-testing/patient/${patientId}`) : Promise.resolve(null)
        ]);

        // 1. Process Patient
        if (!patientRes.ok) throw new Error('Failed to fetch patient');
        const patientData = await patientRes.json();
        setPatient(patientData);

        // 2. Process Allergens
        if (!allergensRes.ok) {
          const errorData = await allergensRes.json();
          throw new Error(errorData.message || 'Failed to fetch allergens');
        }
        const responseData = await allergensRes.json();
        const data = responseData.data;
        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid data format received for allergens: data field is missing or not an array.');
        }
        
        console.log('Processing allergens:', data.length, 'items');
        setAllAllergens(data);
        const grouped = {};
        data.forEach(item => {
          const categoryKey = item.category.toLowerCase();
          if (!grouped[categoryKey]) grouped[categoryKey] = [];
          grouped[categoryKey].push(item);
        });
        console.log('Grouped allergens:', grouped);
        console.log('Available categories in API data:', Object.keys(grouped));
        console.log('Expected categories from allergenCategories:', allergenCategories.map(cat => cat.key));
        
        // Check for category name mismatches
        allergenCategories.forEach(cat => {
          const categoryKey = cat.key.toLowerCase();
          const apiCategoryKey = Object.keys(grouped).find(key => key.toLowerCase() === categoryKey);
          if (apiCategoryKey) {
            console.log(`✓ Category ${cat.key} matches API key: ${apiCategoryKey}`);
          } else {
            console.log(`✗ Category ${cat.key} (${categoryKey}) not found in API data`);
            console.log(`Similar keys in API:`, Object.keys(grouped).filter(key => key.toLowerCase().includes(categoryKey) || categoryKey.includes(key.toLowerCase())));
          }
        });
        
        setGroupedAllergens(grouped);
        
        let sr = 1;
        const srMapTemp = {};
        
        // Only calculate SR for categories that actually have data
        allergenCategories.forEach(cat => {
          const categoryKey = cat.key.toLowerCase();
          console.log(`Checking category: ${cat.key}, key: ${categoryKey}`);
          if (grouped[categoryKey] && grouped[categoryKey].length > 0) {
            srMapTemp[categoryKey] = sr;
            const categoryCount = grouped[categoryKey].length;
            console.log(`Category: ${cat.key}, Starting SR: ${sr}, Count: ${categoryCount}`);
            sr += categoryCount;
          } else {
            console.log(`Category: ${cat.key} has no data, skipping SR calculation`);
            console.log(`Available keys in grouped:`, Object.keys(grouped));
            console.log(`Looking for key: ${categoryKey}`);
          }
        });
        console.log('Final SR Map:', srMapTemp);
        setSrMap(srMapTemp);
        
        const inputs = {};
        data.forEach(item => {
          inputs[item._id] = { enythema1: '', enythema2: false };
        });

        // 3. Pre-fill existing patient patch test data if already saved
        if (patientId && patchRes && patchRes.ok) {
          try {
            const patchData = await patchRes.json();
              if (Array.isArray(patchData) && patchData.length > 0) {
                const report = patchData[0];
                if (report._id) setExistingReportId(report._id);

                if (report.reportType) {
                  setReportType(report.reportType === 'Skin Testing' ? 'skin' : 'blood');
                }

                if (report.positive !== undefined && report.positive !== null) {
                  setPositiveControl(String(report.positive));
                }

                if (report.negative !== undefined && report.negative !== null) {
                  setNegativeControl(String(report.negative));
                }

                if (report.regionalLanguage) {
                  setSelectedRegionalLanguage(report.regionalLanguage);
                }

                if (report.specialAdvices) {
                  setSpecialAdvices(report.specialAdvices);
                }

                if (report.allergens && typeof report.allergens === 'object') {
                  const savedMapById = {};
                  const savedMapByName = {};

                  Object.values(report.allergens).forEach(categoryItems => {
                    if (Array.isArray(categoryItems)) {
                      categoryItems.forEach(item => {
                        if (item.allergenId) {
                          savedMapById[item.allergenId] = item;
                        }
                        if (item.name) {
                          savedMapByName[item.name.trim().toLowerCase()] = item;
                        }
                      });
                    }
                  });

                  data.forEach(item => {
                    const savedItem = savedMapById[item._id] || savedMapByName[(item.name?.english || '').trim().toLowerCase()];
                    if (savedItem) {
                      inputs[item._id] = {
                        enythema1: savedItem.val !== undefined && savedItem.val !== null && savedItem.val > 0 ? String(savedItem.val) : '',
                        enythema2: !!savedItem.isChecked
                      };
                    }
                  });
                }
              }
          } catch (existingErr) {
            console.error('Error pre-filling existing patch test report:', existingErr);
          }
        }

        setEnythemaInputs(inputs);
      } catch (err) {
        console.error('Error fetching data:', err);
        setErrorDialog({ open: true, message: err.message });
      } finally {
        setLoadingAllergens(false);
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handleEnythema1Change = (id, value) => {
    setEnythemaInputs(prev => ({ ...prev, [id]: { ...prev[id], enythema1: value } }));
  };

  const handleEnythemaKeyDown = (e, index) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextInput = document.querySelector(`[data-enythema-index="${index + 1}"]`);
      if (nextInput) {
        nextInput.focus();
        if (nextInput.select) nextInput.select();
      } else {
        const currentCatIdx = allergenCategories.findIndex(c => c.key === selectedCategory);
        if (currentCatIdx !== -1 && currentCatIdx < allergenCategories.length - 1) {
          const nextCat = allergenCategories[currentCatIdx + 1].key;
          setSelectedCategory(nextCat);
          setTimeout(() => {
            const firstInNextCat = document.querySelector(`[data-enythema-index="0"]`);
            if (firstInNextCat) {
              firstInNextCat.focus();
              if (firstInNextCat.select) firstInNextCat.select();
            }
          }, 80);
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevInput = document.querySelector(`[data-enythema-index="${index - 1}"]`);
      if (prevInput) {
        prevInput.focus();
        if (prevInput.select) prevInput.select();
      } else {
        const currentCatIdx = allergenCategories.findIndex(c => c.key === selectedCategory);
        if (currentCatIdx > 0) {
          const prevCat = allergenCategories[currentCatIdx - 1].key;
          setSelectedCategory(prevCat);
          setTimeout(() => {
            const allInputs = document.querySelectorAll(`[data-enythema-index]`);
            if (allInputs.length > 0) {
              const lastInPrevCat = allInputs[allInputs.length - 1];
              lastInPrevCat.focus();
              if (lastInPrevCat.select) lastInPrevCat.select();
            }
          }, 80);
        }
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = document.querySelector(`[data-enythema-index="${index + 1}"]`);
      if (nextInput) {
        nextInput.focus();
        if (nextInput.select) nextInput.select();
      }
    } else if (typeof handleNumberInput === 'function') {
      handleNumberInput(e);
    }
  };

  const handleEnythema2Change = (id, checked) => {
    setEnythemaInputs(prev => ({ ...prev, [id]: { ...prev[id], enythema2: checked } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorDialog({ open: false, message: '' });
    setSaveStatus({ open: false, message: '', severity: 'success' });

    try {
      const transformedData = {
        patientId: patient._id,
        reportType: reportType === 'skin' ? 'Skin Testing' : 'Specific IgE',
        regionalLanguage: selectedRegionalLanguage,
        positive: parseInt(positiveControl),
        negative: parseInt(negativeControl),
        allergens: {},
        specialAdvices,
      };

      Object.keys(groupedAllergens).forEach(categoryKey => {
        const categoryAllergens = groupedAllergens[categoryKey] || [];
        const validAllergens = categoryAllergens
          .map(allergen => {
            const input = enythemaInputs[allergen._id];
            const val = input.enythema1 ? parseInt(input.enythema1) : 0;
            const isChecked = input.enythema2;
            if (val > 0 || isChecked) {
              return {
                allergenId: allergen._id,
                name: allergen.name?.english || '',
                val: val,
                isChecked: isChecked
              };
            }
            return null;
          })
          .filter(item => item !== null);

        if (validAllergens.length > 0) {
          const originalCategory = allergenCategories.find(cat => cat.key.toLowerCase() === categoryKey);
          transformedData.allergens[originalCategory ? originalCategory.key : categoryKey] = validAllergens;
        }
      });

      const response = await apiFetch(`${BASE_URL}/api/patch-testing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 && data.existingReportId) {
          setExistingReportId(data.existingReportId);
          setShowConflictDialog(true);
          return;
        } else {
          throw new Error(data.message || 'Failed to save patch test results');
        }
      }

      if (data && data._id) {
        setExistingReportId(data._id);
      }

      setSaveStatus({
        open: true,
        message: 'Patch test results saved successfully!',
        severity: 'success'
      });
      setPendingRedirect(true);
      setShowDoctorModal(true);
    } catch (err) {
      setErrorDialog({ open: true, message: err.message });
    }
  };

  const handleCloseErrorDialog = () => {
    setErrorDialog({ open: false, message: '' });
  };

  const handleCloseSnackbar = () => {
    setSaveStatus(prev => ({ ...prev, open: false }));
  };

  const handleCloseConflictDialog = () => {
    setShowConflictDialog(false);
    setExistingReportId(null);
  };

  const handleDeleteAndCreate = async () => {
    handleCloseConflictDialog();
    try {
      const deleteResponse = await apiFetch(`${BASE_URL}/api/patch-testing/${existingReportId}`, {
        method: 'DELETE',
      });

      if (!deleteResponse.ok) {
        const deleteData = await deleteResponse.json();
        throw new Error(deleteData.message || 'Failed to delete existing report');
      }

      const transformedData = {
        patientId: patient._id,
        reportType: reportType === 'skin' ? 'Skin Testing' : 'Specific IgE',
        regionalLanguage: selectedRegionalLanguage,
        positive: parseInt(positiveControl),
        negative: parseInt(negativeControl),
        allergens: {},
        specialAdvices,
      };

      Object.keys(groupedAllergens).forEach(categoryKey => {
        const categoryAllergens = groupedAllergens[categoryKey] || [];
        const validAllergens = categoryAllergens
          .map(allergen => {
            const input = enythemaInputs[allergen._id];
            const val = input.enythema1 ? parseInt(input.enythema1) : 0;
            const isChecked = input.enythema2;
            if (val > 0 || isChecked) {
              return {
                allergenId: allergen._id,
                name: allergen.name?.english || '',
                val: val,
                isChecked: isChecked
              };
            }
            return null;
          })
          .filter(item => item !== null);

        if (validAllergens.length > 0) {
          const originalCategory = allergenCategories.find(cat => cat.key.toLowerCase() === categoryKey);
          transformedData.allergens[originalCategory ? originalCategory.key : categoryKey] = validAllergens;
        }
      });

      const createResponse = await apiFetch(`${BASE_URL}/api/patch-testing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformedData)
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(createData.message || 'Failed to save new report after deletion');
      }

      if (createData && createData._id) {
        setExistingReportId(createData._id);
      }

      setSaveStatus({
        open: true,
        message: 'Existing report deleted and new report saved successfully!',
        severity: 'success'
      });
      setPendingRedirect(true);
      setShowDoctorModal(true);
    } catch (err) {
      setErrorDialog({ open: true, message: err.message });
    }
  };

  const handleDownloadExisting = async () => {
    handleCloseConflictDialog();
    if (!existingReportId || !patient.name) {
      setErrorDialog({
        open: true,
        message: 'Cannot download existing report: Missing ID or patient name.'
      });
      return;
    }

    try {
      const response = await apiFetch(`${BASE_URL}/api/patch-testing/${existingReportId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch existing report data for download');
      }
      const reportData = await response.json();
      await downloadReport(reportData, patient.name);
      setSaveStatus({
        open: true,
        message: 'Existing report downloaded successfully!',
        severity: 'success'
      });
    } catch (err) {
      setErrorDialog({ open: true, message: err.message });
    }
  };

  // Removed full page loading blocker

  const allergensToShow = groupedAllergens[selectedCategory.toLowerCase()] || [];
  const selectedCategoryObject = allergenCategories.find(cat => cat.key === selectedCategory);
  
  // Get allergens based on category - for new food categories, pull from foods and filter
  let filteredAllergens;
  if (selectedCategory === 'Foods') {
    // Foods category shows only vegetarian foods
    const foodsCategory = groupedAllergens['foods'] || [];
    filteredAllergens = foodsCategory.filter(allergen => getFoodType(allergen) === 'Veg');
  } else if (selectedCategory === 'Non Jain') {
    // Jain category shows Jain foods from the foods category
    const foodsCategory = groupedAllergens['foods'] || [];
    filteredAllergens = foodsCategory.filter(allergen => getFoodType(allergen) === 'Non Jain');
  } else if (selectedCategory === 'Non-Veg') {
    // Non-Veg category shows non-vegetarian foods from the foods category
    const foodsCategory = groupedAllergens['foods'] || [];
    filteredAllergens = foodsCategory.filter(allergen => getFoodType(allergen) === 'Non-Veg');
  } else {
    // Other categories show all allergens in that category
    filteredAllergens = allergensToShow;
  }

  // Calculate SR start - for food categories, calculate based on position in foods category
  let srStart;
  if (selectedCategory === 'Foods' || selectedCategory === 'Non Jain' || selectedCategory === 'Non-Veg') {
    // For food-related categories, calculate SR based on position in foods category
    const foodsCategory = groupedAllergens['foods'] || [];
    let currentSr = srMap['foods'] || 1; // Start from Foods category SR
    
    if (selectedCategory === 'Non Jain') {
      // Count how many Veg items come before Non Jain
      const vegCount = foodsCategory.filter(allergen => getFoodType(allergen) === 'Veg').length;
      currentSr += vegCount;
    } else if (selectedCategory === 'Non-Veg') {
      // Count how many Veg and Jain items come before Non-Veg
      const vegCount = foodsCategory.filter(allergen => getFoodType(allergen) === 'Veg').length;
      const jainCount = foodsCategory.filter(allergen => getFoodType(allergen) === 'Non Jain').length;
      currentSr += vegCount + jainCount;
    }
    
    srStart = currentSr;
    console.log(`${selectedCategory} category - srStart: ${srStart}`);
  } else {
    // For non-food categories, use the normal SR mapping
    srStart = srMap[selectedCategory.toLowerCase()] || 1;
    console.log(`${selectedCategory} category - srStart: ${srStart}`);
  }
  
  console.log('Current srMap:', srMap);
  console.log('Selected category:', selectedCategory);

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      {/* Header with back button and title, styled like the screenshot */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            onClick={() => navigate('/patients')}
            sx={{ minWidth: 0, padding: 0, marginRight: 1, color: '#111', background: 'none', boxShadow: 'none', '&:hover': { background: 'none' } }}
            disableRipple
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Button>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700, fontSize: 28, color: '#111', ml: 1 }}>
            Allergy Test
          </Typography>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Button
            variant="contained"
            style={{
              fontWeight: 600,
              fontSize: 16,
              borderRadius: 8,
              backgroundColor: '#2563eb',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
              textTransform: 'none',
              padding: '10px 32px',
              minWidth: 170
            }}
            onClick={() => setShowDoctorModal(true)}
          >
            View Report
          </Button>
        </div>
      </div>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(37,99,235,0.07)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField label="Patient's name" value={patient?.basicInfo?.name || ''} fullWidth InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField label="Age/Sex" value={`${patient?.basicInfo?.age || ''}/${patient?.basicInfo?.sex || ''}`} fullWidth InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField label="PEFR" value={patient?.examination?.pefr || ''} fullWidth InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField label="SpO2" value={patient?.examination?.spo2 || ''} fullWidth InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField label="Patient ID" value={patient?.patientId || ''} fullWidth InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={6} sm={3} md={1}>
            <TextField
              label="Date"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(37,99,235,0.07)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormLabel>Report</FormLabel>
            <RadioGroup
              row
              value={reportType}
              onChange={e => setReportType(e.target.value)}
            >
              <FormControlLabel value="skin" control={<Radio />} label="Skin Testing" />
              <FormControlLabel value="blood" control={<Radio />} label="Specific IgE" />
            </RadioGroup>
          </Grid>
          <Grid item xs={12} sm={6} md={9} style={{marginTop: '20px'}}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Positive Control (mm)"
                  type="number"
                  value={positiveControl}
                  onChange={e => setPositiveControl(e.target.value)}
                  onKeyDown={handleNumberInput}
                  size="small"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Negative Control (mm)"
                  type="number"
                  value={negativeControl}
                  onChange={e => setNegativeControl(e.target.value)}
                  onKeyDown={handleNumberInput}
                  size="small"
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      {/* Dietary Summary Cards */}
      {selectedCategory === 'Foods' || selectedCategory === 'Non Jain' || selectedCategory === 'Non-Veg' ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {(() => {
            const foodsCategory = groupedAllergens['foods'] || [];
            const vegCount = foodsCategory.filter(allergen => getFoodType(allergen) === 'Veg').length;
            const jainCount = foodsCategory.filter(allergen => getFoodType(allergen) === 'Non Jain').length;
            const nonVegCount = foodsCategory.filter(allergen => getFoodType(allergen) === 'Non-Veg').length;
            
            return [
              {
                title: 'Vegetarian Foods',
                count: vegCount,
                color: '#2563eb',
                bgColor: '#eff6ff',
                description: 'Safe for all vegetarian diets'
              },
              {
                title: 'Non Jain Foods',
                count: jainCount,
                color: '#059669',
                bgColor: '#f0fdf4',
                description: 'Contains root vegetables & mushrooms'
              },
              {
                title: 'Non-Vegetarian',
                count: nonVegCount,
                color: '#dc2626',
                bgColor: '#fef2f2',
                description: 'Meat, fish, eggs, animal products'
              },
              {
                title: 'Total Food Items',
                count: foodsCategory.length,
                color: '#7c3aed',
                bgColor: '#f3f4f6',
                description: 'All food allergens combined'
              }
            ];
          })().map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: `1px solid ${card.color}20`,
                  backgroundColor: card.bgColor,
                  textAlign: 'center',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 700, color: card.color, mb: 1 }}>
                  {card.count}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', mb: 0.5 }}>
                  {card.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '11px' }}>
                  {card.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : null}
      
      <Grid container spacing={2} alignItems="flex-start">
        {/* Allergens Section */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(37,99,235,0.07)', minHeight: 480, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2563eb', mb: 0, letterSpacing: 0.5 }}>Allergies</Typography>
            </div>
            <TableContainer style={{ flex: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>SR</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="center" style={{ width: 150, minWidth: 180, maxWidth: 10, padding: '8px 8px' }}>Enythema-1 (mm)</TableCell>
                    <TableCell align="center" style={{ width: 100, minWidth: 100, maxWidth: 100, padding: '8px 8px' }}>Enythema-2</TableCell>
                    {(selectedCategory === 'Foods' || selectedCategory === 'Non Jain' || selectedCategory === 'Non-Veg') && (
                      <TableCell align="center" style={{ width: 120, minWidth: 120, maxWidth: 120, padding: '8px 8px', fontWeight: 600, color: '#2563eb' }}>Food Type</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} sx={{ background: '#f0f0f0', fontWeight: 'bold' }}>
                      {selectedCategory}
                    </TableCell>
                  </TableRow>
                  {loadingAllergens ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', padding: '20px' }}>
                        <CircularProgress size={24} />
                        <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                          Loading allergens...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredAllergens.length > 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} style={{ padding: 0, border: 0 }}>
                        <div ref={scrollContainerRef} key={selectedCategory} className="allergen-scroll-container">
                          {filteredAllergens.map((row, idx) => (
                            <div key={row._id} className="allergen-row">
                              <TableRow>
                                <TableCell>{srStart + idx}</TableCell>
                                <TableCell>{row.name?.english || ''}</TableCell>
                                <TableCell align="center" style={{ width: 150, minWidth: 150, maxWidth: 150, padding: '4px', marginLeft: '-10px'}}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <TextField
                                      size="small"
                                      type="number"
                                      value={enythemaInputs[row._id]?.enythema1 || ''}
                                      onChange={e => handleEnythema1Change(row._id, e.target.value)}
                                      onKeyDown={e => handleEnythemaKeyDown(e, idx)}
                                      inputProps={{
                                        'data-enythema-index': idx,
                                        style: { width: 100, textAlign: 'center', padding: '4px', marginLeft: '-10px' }
                                      }}
                                    />
                                  </div>
                                </TableCell>
                                <TableCell align="center" style={{ width: 100, minWidth: 100, maxWidth: 100, padding: '4px 8px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Checkbox
                                      checked={enythemaInputs[row._id]?.enythema2 || false}
                                      onChange={e => handleEnythema2Change(row._id, e.target.checked)}
                                    />
                                  </div>
                                </TableCell>
                                {(selectedCategory === 'Foods' || selectedCategory === 'Non Jain' || selectedCategory === 'Non-Veg') && (
                                  <TableCell align="center" style={{ width: 120, minWidth: 120, maxWidth: 120, padding: '4px 8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                      <div
                                        style={{
                                          padding: '4px 12px',
                                          borderRadius: '16px',
                                          backgroundColor: getFoodTypeBackgroundColor(getFoodType(row)),
                                          color: getFoodTypeColor(getFoodType(row)),
                                          fontWeight: 600,
                                          fontSize: '12px',
                                          border: `1px solid ${getFoodTypeColor(getFoodType(row))}`,
                                          textAlign: 'center',
                                          minWidth: '60px'
                                        }}
                                      >
                                        {selectedCategory === 'Non Jain' && getFoodType(row) === 'Jain' ? 'Non Jain' : getFoodType(row)}
                                      </div>
                                    </div>
                                  </TableCell>
                                )}
                              </TableRow>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', color: '#666' }}>
                        No allergens found for this category
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        {/* Categories and Special Advises stacked vertically on the right */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(37,99,235,0.07)' }}>
            <Typography variant="h6" gutterBottom>Categories</Typography>
          
            <RadioGroup
              value={selectedCategory}
              onChange={handleCategoryChange}
              name="allergen-category-radio"
            >
              {allergenCategories.map(cat => (
                <FormControlLabel
                  key={cat.key}
                  value={cat.key}
                  control={<Radio />}
                  label={cat.label}
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontWeight: cat.key === selectedCategory ? 600 : 400,
                      color: cat.key === selectedCategory ? '#2563eb' : '#374151'
                    }
                  }}
                />
              ))}
            </RadioGroup>
          </Paper>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(37,99,235,0.07)' }}>
            <Typography variant="h6" gutterBottom>Special Advises</Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <FormControlLabel
                control={<Checkbox checked={specialAdvices.immunotherapy} onChange={e => setSpecialAdvices(sa => ({ ...sa, immunotherapy: e.target.checked }))} />}
                label="Allergen Immunotherapy"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: 15 }, marginBottom: 0, alignItems: 'center', gap: 1 }}
              />
              <FormControlLabel
                control={<Checkbox checked={specialAdvices.oralSublingual} onChange={e => setSpecialAdvices(sa => ({ ...sa, oralSublingual: e.target.checked }))} />}
                label="Allergen Immunotherapy ORAL / Sublingual"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: 15 }, marginBottom: 0, alignItems: 'center', gap: 1 }}
              />
              <FormControlLabel
                control={<Checkbox checked={specialAdvices.srsInjections} onChange={e => setSpecialAdvices(sa => ({ ...sa, srsInjections: e.target.checked }))} />}
                label="Allergen Immunotherapy SRS Injections."
                sx={{ '& .MuiFormControlLabel-label': { fontSize: 15 }, marginBottom: 0, alignItems: 'center', gap: 1 }}
              />
              <FormControlLabel
                control={<Checkbox checked={specialAdvices.oralSrsSublingual} onChange={e => setSpecialAdvices(sa => ({ ...sa, oralSrsSublingual: e.target.checked }))} />}
                label="Allergen Immunotherapy ORAL SRS / Sublingual"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: 15 }, marginBottom: 0, alignItems: 'center', gap: 1 }}
              />
            </div>
          </Paper>
        </Grid>
      </Grid>
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 24 }}>
        <Button
          variant="contained"
          style={{
            fontWeight: 600,
            fontSize: 16,
            borderRadius: 8,
            backgroundColor: '#2563eb',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
            textTransform: 'none',
            padding: '8px 28px',
            marginLeft: 8
          }}
          onClick={handleSubmit}
        >
          Save Allergy Test
        </Button>
      </div>
      <Snackbar
        open={saveStatus.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={saveStatus.severity}
          sx={{ width: '100%' }}
        >
          {saveStatus.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={showConflictDialog}
        onClose={handleCloseConflictDialog}
        aria-labelledby="conflict-dialog-title"
        aria-describedby="conflict-dialog-description"
      >
        <DialogTitle id="conflict-dialog-title">Report Already Exists</DialogTitle>
        <DialogContent>
          <DialogContentText id="conflict-dialog-description">
            A patch test report already exists for this patient. What would you like to do?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDownloadExisting} color="primary">Download Existing</Button>
          <Button onClick={handleDeleteAndCreate} color="secondary" autoFocus>Delete Existing and Create New</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={errorDialog.open}
        onClose={handleCloseErrorDialog}
        aria-labelledby="error-dialog-title"
        aria-describedby="error-dialog-description"
      >
        <DialogTitle id="error-dialog-title">Error</DialogTitle>
        <DialogContent>
          <DialogContentText id="error-dialog-description">
            {errorDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseErrorDialog} color="primary">Close</Button>
          {errorDialog.message.includes('allergens') && (
            <Button 
              onClick={() => {
                handleCloseErrorDialog();
                setLoadingAllergens(true);
                // Retry fetching allergens
                const fetchAllergens = async () => {
                  try {
                    const response = await fetch(`${BASE_URL}/api/allergies/all`);
                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.message || 'Failed to fetch allergens');
                    }
                    const responseData = await response.json();
                    const data = responseData.data;
                    if (!data || !Array.isArray(data)) {
                      throw new Error('Invalid data format received for allergens');
                    }
                    setAllAllergens(data);
                    const grouped = {};
                    data.forEach(item => {
                      const categoryKey = item.category.toLowerCase();
                      if (!grouped[categoryKey]) grouped[categoryKey] = [];
                      grouped[categoryKey].push(item);
                    });
                    setGroupedAllergens(grouped);
                    let sr = 1;
                    const srMapTemp = {};
                    allergenCategories.forEach(cat => {
                      const categoryKey = cat.key.toLowerCase();
                      srMapTemp[categoryKey] = sr;
                      sr += (grouped[categoryKey]?.length || 0);
                    });
                    setSrMap(srMapTemp);
                    const inputs = {};
                    data.forEach(item => {
                      inputs[item._id] = { enythema1: '', enythema2: false };
                    });
                    setEnythemaInputs(inputs);
                  } catch (err) {
                    setErrorDialog({ open: true, message: err.message });
                  } finally {
                    setLoadingAllergens(false);
                  }
                };
                fetchAllergens();
              }} 
              color="secondary"
            >
              Retry
            </Button>
          )}
        </DialogActions>
      </Dialog>
      {/* Doctor Selection Modal */}
      {showDoctorModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
              width: 'calc(100% - 64px)',
              maxWidth: '420px',
              margin: '20px',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '0 0 24px 0'
            }}
          >
            <div
              style={{
                padding: '20px 28px 0 28px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
                borderRadius: '12px 12px 0 0'
              }}
            >
              <h5 className="mb-0" style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>Select Doctor for Report</h5>
              <button
                onClick={() => setShowDoctorModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#64748b',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={e => {
                  e.target.style.backgroundColor = '#f1f5f9';
                  e.target.style.color = '#475569';
                }}
                onMouseLeave={e => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#64748b';
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div style={{ padding: '28px 28px 0 28px' }}>
              <div style={{ fontWeight: 600, fontSize: 16, color: '#1e293b', marginBottom: 18 }}>Doctor's name to be included</div>
              <div className="mb-4">
                <div className="form-check" style={{ marginBottom: '16px' }}>
                  <input
                    className="form-check-input"
                    type="radio"
                    id="doctor-vipul"
                    name="doctor"
                    value="vipul"
                    checked={selectedDoctor === 'vipul'}
                    onChange={() => setSelectedDoctor('vipul')}
                    style={{ width: '18px', height: '18px', marginRight: '12px', accentColor: '#2563eb' }}
                  />
                  <label className="form-check-label" htmlFor="doctor-vipul" style={{ fontSize: '15px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>
                    Dr. Vipul Shah
                  </label>
                </div>
                <div className="form-check" style={{ marginBottom: '16px' }}>
                  <input
                    className="form-check-input"
                    type="radio"
                    id="doctor-eshita"
                    name="doctor"
                    value="eshita"
                    checked={selectedDoctor === 'eshita'}
                    onChange={() => setSelectedDoctor('eshita')}
                    style={{ width: '18px', height: '18px', marginRight: '12px', accentColor: '#2563eb' }}
                  />
                  <label className="form-check-label" htmlFor="doctor-eshita" style={{ fontSize: '15px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>
                    Dr. Eshita Shah
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="doctor-both"
                    name="doctor"
                    value="both"
                    checked={selectedDoctor === 'both'}
                    onChange={() => setSelectedDoctor('both')}
                    style={{ width: '18px', height: '18px', marginRight: '12px', accentColor: '#2563eb' }}
                  />
                  <label className="form-check-label" htmlFor="doctor-both" style={{ fontSize: '15px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>
                    Both (Dr. Vipul Shah & Dr. Eshita Shah)
                  </label>
                </div>
              </div>

              <div style={{ fontWeight: 600, fontSize: 16, color: '#1e293b', marginBottom: 14 }}>Language to include</div>
              <div className="mb-4">
                <div className="form-check" style={{ marginBottom: '16px' }}>
                  <input
                    className="form-check-input"
                    type="radio"
                    id="lang-modal-gujarati"
                    name="modalRegionalLang"
                    value="gujarati"
                    checked={selectedRegionalLanguage === 'gujarati'}
                    onChange={() => setSelectedRegionalLanguage('gujarati')}
                    style={{ width: '18px', height: '18px', marginRight: '12px', accentColor: '#2563eb' }}
                  />
                  <label className="form-check-label" htmlFor="lang-modal-gujarati" style={{ fontSize: '15px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>
                    Gujarati (ગુજરાતી)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="lang-modal-marathi"
                    name="modalRegionalLang"
                    value="marathi"
                    checked={selectedRegionalLanguage === 'marathi'}
                    onChange={() => setSelectedRegionalLanguage('marathi')}
                    style={{ width: '18px', height: '18px', marginRight: '12px', accentColor: '#2563eb' }}
                  />
                  <label className="form-check-label" htmlFor="lang-modal-marathi" style={{ fontSize: '15px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>
                    Marathi (मराठी)
                  </label>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '28px', marginTop: '-25px', marginBottom: '-20px'}}>
              <button
                type="button"
                onClick={() => setShowDoctorModal(false)}
                className="btn btn-outline-secondary px-4 py-2"
                style={{
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  color: '#64748b',
                  fontWeight: '500',
                  transition: 'all 0.2s ease-in-out',
                  fontSize: '15px',
                  backgroundColor: '#ffffff',
                  padding: '8px 28px'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDoctorModal(false);
                  if (pendingRedirect) {
                    setPendingRedirect(false);
                    navigate(`/allergy-report/${patientId}`, { state: { selectedDoctor, selectedRegionalLanguage } });
                  } else {
                    navigate(`/allergy-report/${patientId}`, { state: { selectedDoctor, selectedRegionalLanguage } });
                  }
                }}
                className="btn btn-primary px-4 py-2"
                style={{
                  borderRadius: '6px',
                  backgroundColor: '#2563eb',
                  border: 'none',
                  fontWeight: '500',
                  transition: 'all 0.2s ease-in-out',
                  fontSize: '15px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  color: '#fff',
                  padding: '8px 28px'
                }}
              >
                View Report
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}