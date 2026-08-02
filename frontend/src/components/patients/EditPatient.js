import React, { useState, useEffect } from 'react';
import { User, X } from 'lucide-react';
import RhinitisForm from '../patientForms/Rhinitis';
import HeadachesForm from '../patientForms/Headaches';
import AsthmaForm from '../patientForms/Asthma';
import UrticariaAngioedemaForm from '../patientForms/UrticariaAngioedema';
import DermatitisEczemaForm from '../patientForms/DermatitisEczema';
import InsectAllergyForm from '../patientForms/InsectAllergy';
import TensionFatigueSyndromeForm from '../patientForms/TensionFatigueSyndrome';
import OtherComplaintsForm from '../patientForms/OtherComplaints';
import DiagnosisForm from '../patientForms/Diagnosis';
import { apiFetch } from '../../utils/api';   
import DoctorExaminationForm from '../patientForms/DoctorExamination';
import ModalHeader from '../ModalHeader';
import { handleNumberInput } from '../../utils/inputUtils';

const EditPatient = ({ patient, onClose, onSuccess, onError }) => {
  console.log('EditPatient: Initial patient prop:', patient);
  const [showEditInfoForm, setShowEditInfoForm] = useState(true);
  const [showEditPersonalHistoryForm, setShowEditPersonalHistoryForm] = useState(false);
  const [showEditConditionHistoryForm, setShowEditConditionHistoryForm] = useState(false);
  const [editActiveHistoryTab, setEditActiveHistoryTab] = useState('Personal');
  const [editActiveConditionTab, setEditActiveConditionTab] = useState('Rhinitis');
  const [editFormErrors, setEditFormErrors] = useState({});
  const [editIsSubmitting, setEditIsSubmitting] = useState(false);
  const [editPatientId, setEditPatientId] = useState(patient.patientId || '');

  const [editPatientForm, setEditPatientForm] = useState(patient.basicInfo || {});
  const [editPersonalHistoryForm, setEditPersonalHistoryForm] = useState(() => {
    const personal = patient.patientHistory?.personal || {};
    const initialState = {
      diet: personal.diet || '',
      addictions: {
        smoker: personal.addictions?.smoker || false,
        alcoholic: personal.addictions?.alcoholic || false,
        details: personal.addictions?.details || '',
      },
      otherAddictions: personal.otherAddictions || '',
    };
    console.log('EditPatient: Initial editPersonalHistoryForm state:', initialState);
    return initialState;
  });

  // Effect to re-initialize personal history form when patient prop changes
  useEffect(() => {
    console.log('EditPatient: patient prop changed - re-initializing personal history form', patient);
    const personal = patient.patientHistory?.personal || {};
    setEditPersonalHistoryForm({
      diet: personal.diet || '',
      addictions: {
        smoker: personal.addictions?.smoker || false,
        alcoholic: personal.addictions?.alcoholic || false,
        details: personal.addictions?.details || '',
      },
      otherAddictions: personal.otherAddictions || '',
    });
  }, [patient]);

  console.log('EditPatient: Current editPersonalHistoryForm:', editPersonalHistoryForm);
  const [editMentalHistoryForm, setEditMentalHistoryForm] = useState(patient.patientHistory?.mental || {});
  const [editPastHistoryForm, setEditPastHistoryForm] = useState(patient.patientHistory?.past || {});
  const [editEnvironmentalHistoryForm, setEditEnvironmentalHistoryForm] = useState(patient.patientHistory?.environmental || {});
  const [editAllergyHistoryForm, setEditAllergyHistoryForm] = useState(patient.patientHistory?.allergy || {});
  const [editRhinitisForm, setEditRhinitisForm] = useState(patient.patientHistory?.patientHistory2?.rhinitis || {});
  const [editHeadachesForm, setEditHeadachesForm] = useState(patient.patientHistory?.patientHistory2?.headaches || {});
  const [editAsthmaForm, setEditAsthmaForm] = useState(patient.patientHistory?.patientHistory2?.asthma || {});
  const [editTensionFatigueSyndromeForm, setEditTensionFatigueSyndromeForm] = useState(patient.patientHistory?.patientHistory2?.tensionFatigueSyndrome || {});
  const [editUrticariaAngioedemaForm, setEditUrticariaAngioedemaForm] = useState(patient.patientHistory?.patientHistory2?.urticariaAngioedema || {});
  const [editDermatitisOrEczemaForm, setEditDermatitisOrEczemaForm] = useState(patient.patientHistory?.patientHistory2?.dermatitisOrEczema || {});
  const [editInsectAllergyForm, setEditInsectAllergyForm] = useState(patient.patientHistory?.patientHistory2?.insectAllergy || {});
  const [editOtherComplaintsForm, setEditOtherComplaintsForm] = useState(patient.patientHistory?.patientHistory2?.otherComplaints || {});
  const [editDiagnosisForm, setEditDiagnosisForm] = useState(patient.diagnosis || {});
  const [editExaminationForm, setEditExaminationForm] = useState(patient.examination || {});

  const familyMembers = ['Father', 'Mother', 'Brother', 'Sister', 'Grand father', 'Grand mother'];
  const illnessList = ['Asthma', 'Rhinitis', 'Sinusitis', 'Urticaria', 'Eczema', 'Hives/swellings', 'Migraine'];

  const [editFamilyHistoryForm, setEditFamilyHistoryForm] = useState(() => {
    // Create a complete default structure for all illnesses and members
    const defaultIllnessesStructure = illnessList.reduce((acc, illness) => {
      acc[illness] = familyMembers.reduce((memberAcc, member) => {
        memberAcc[member] = false; // Default to false for checkboxes
        return memberAcc;
      }, {});
      return acc;
    }, {});

    const patientFamilyHistory = patient.patientHistory?.family || {};
    const mergedIllnesses = {};

    // Merge existing patient illness data on top of the default structure, item by item
    illnessList.forEach(illness => {
      mergedIllnesses[illness] = {
        ...(defaultIllnessesStructure[illness] || {}), // Ensure default structure for this illness
        ...(patientFamilyHistory.illnesses?.[illness] || {}) // Overlay with existing data for this specific illness
      };
    });

    return {
      ...patientFamilyHistory,
      illnesses: mergedIllnesses,
    };
  });

  // Calculate BMI when height or weight changes
  useEffect(() => {
    if (editPatientForm.height && editPatientForm.weight) {
      const heightInMeters = parseFloat(editPatientForm.height) * 0.3048;
      const weightInKg = parseFloat(editPatientForm.weight);

      if (heightInMeters > 0 && weightInKg > 0) {
        const bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
        setEditPatientForm(prev => ({
          ...prev,
          bmi: bmi
        }));
      }
    }
  }, [editPatientForm.height, editPatientForm.weight]);

  const validateEditForm = (checkDiagnosis = false) => {
    const errors = {};
    if (!editPatientForm.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!editPatientForm.age) {
      errors.age = 'Age is required';
    } else if (isNaN(editPatientForm.age) || editPatientForm.age < 0 || editPatientForm.age > 150) {
      errors.age = 'Please enter a valid age';
    }
    if (!editPatientForm.sex) {
      errors.sex = 'Sex is required';
    }
    if (editPatientForm.tel1 && !/^\d{10}$/.test(editPatientForm.tel1)) {
      errors.tel1 = 'Please enter a valid 10-digit phone number';
    }
    if (editPatientForm.tel2 && !/^\d{10}$/.test(editPatientForm.tel2)) {
      errors.tel2 = 'Please enter a valid 10-digit phone number';
    }
    if (editPatientForm.height && isNaN(editPatientForm.height)) {
      errors.height = 'Please enter a valid height';
    }
    if (editPatientForm.weight && isNaN(editPatientForm.weight)) {
      errors.weight = 'Please enter a valid weight';
    }

    if (checkDiagnosis) {
      const atLeastOneDiagnosis =
        Object.values(editDiagnosisForm).some(
          (val, idx) => idx < 9 && val === true
        ) || (editDiagnosisForm.other && editDiagnosisForm.other.trim() !== '');
      if (!atLeastOneDiagnosis) {
        errors.diagnosis = 'At least one diagnosis must be selected or \"Other\" must be filled';
      }
    }

    return errors;
  };

  const handleEditInputChange = (field, value) => {
    setEditPatientForm(prev => ({
      ...prev,
      [field]: value
    }));
    if (editFormErrors[field]) {
      setEditFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleEditAddictionChange = (field, value) => {
    setEditPersonalHistoryForm(prev => ({
      ...prev,
      addictions: {
        ...prev.addictions,
        [field]: value
      }
    }));
  };

  const handleEditPersonalHistoryInputChange = (field, value) => {
    setEditPersonalHistoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditMentalHistoryChange = (field, value) => {
    setEditMentalHistoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditPastHistoryChange = (field, value) => {
    setEditPastHistoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditFamilyHistoryCheckbox = (illness, member, checked) => {
    setEditFamilyHistoryForm(prev => ({
      ...prev,
      illnesses: {
        ...prev.illnesses,
        [illness]: {
          ...(prev.illnesses?.[illness] || {}), // Ensure it's an object before spreading
          [member]: checked
        }
      }
    }));
  };

  const handleEditFamilyHistoryOther = (value) => {
    setEditFamilyHistoryForm(prev => ({ ...prev, other: value }));
  };

  const handleEditEnvironmentalHistoryChange = (field, value) => {
    setEditEnvironmentalHistoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditAllergyHistoryChange = (field, value) => {
    setEditAllergyHistoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditDiagnosisChange = (key, value) => {
    setEditDiagnosisForm(prev => ({
      ...prev,
      [key]: value
    }));

    const updatedForm = { ...editDiagnosisForm, [key]: value };
    const atLeastOneDiagnosis =
      Object.values(updatedForm).some(
        (val, idx) => idx < 9 && val === true
      ) || (updatedForm.other && updatedForm.other.trim() !== '');
    if (editFormErrors.diagnosis && atLeastOneDiagnosis) {
      setEditFormErrors(prev => ({ ...prev, diagnosis: '' }));
    }
  };

  const handleEditExaminationChange = (field, value) => {
    setEditExaminationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditOtherComplaintsChange = (field, value) => {
    setEditOtherComplaintsForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const historyTabs = [
    'Personal',
    'Mental',
    'Past',
    'Family',
    'Environmental',
    'Allergy'
  ];

  const conditionTabs = [
    'Rhinitis',
    'Headaches',
    'Asthma',
    'Urticaria/Angioedema',
    'Dermatitis/Eczema',
    'Insect Allergy',
    'Tension/Fatigue',
    'Other Complaints',
    'Doctor Examination',
    'Diagnosis'
  ];

  const handleEditPatientFormSubmit = (e) => {
    e.preventDefault();
    const errors = validateEditForm(false);

    const firstFormFields = [
      'name', 'age', 'sex', 'tel1', 'tel2', 'height', 'weight'
    ];
    const filteredErrors = Object.fromEntries(
      Object.entries(errors).filter(([key]) => firstFormFields.includes(key))
    );

    if (Object.keys(filteredErrors).length === 0) {
      setShowEditPersonalHistoryForm(true);
      setShowEditInfoForm(false);
      setEditFormErrors({});
    } else {
      setEditFormErrors(filteredErrors);
    }
  };

  const goToEditNextHistoryTab = () => {
    const currentIndex = historyTabs.indexOf(editActiveHistoryTab);
    if (currentIndex < historyTabs.length - 1) {
      setEditActiveHistoryTab(historyTabs[currentIndex + 1]);
    } else if (editActiveHistoryTab === 'Allergy') {
      setShowEditPersonalHistoryForm(false);
      setShowEditConditionHistoryForm(true);
      setEditActiveConditionTab('Rhinitis');
    }
  };

  const goToEditNextConditionTab = () => {
    const currentIndex = conditionTabs.indexOf(editActiveConditionTab);
    if (currentIndex < conditionTabs.length - 1) {
      setEditActiveConditionTab(conditionTabs[currentIndex + 1]);
    } else {
      handleEditFormSubmit();
    }
  };

  const handleEditConditionBack = () => {
    const currentIndex = conditionTabs.indexOf(editActiveConditionTab);
    if (currentIndex === 0) {
      setShowEditConditionHistoryForm(false);
      setShowEditPersonalHistoryForm(true);
      setEditActiveHistoryTab('Allergy');
    } else {
      setEditActiveConditionTab(conditionTabs[currentIndex - 1]);
    }
  };

  const goToEditPreviousHistoryTab = () => {
    const currentIndex = historyTabs.indexOf(editActiveHistoryTab);
    if (currentIndex > 0) {
      setEditActiveHistoryTab(historyTabs[currentIndex - 1]);
    } else {
      setShowEditPersonalHistoryForm(false);
      setShowEditInfoForm(true);
    }
  };

  const renderEditConditionTab = () => {
    switch (editActiveConditionTab) {
      case 'Rhinitis':
        return (
          <RhinitisForm formData={editRhinitisForm} onChange={setEditRhinitisForm} />
        );
      case 'Headaches':
        return (
          <HeadachesForm formData={editHeadachesForm} onChange={setEditHeadachesForm} />
        );
      case 'Asthma':
        return (
          <AsthmaForm formData={editAsthmaForm} onChange={setEditAsthmaForm} />
        );
      case 'Urticaria/Angioedema':
        return (
          <UrticariaAngioedemaForm formData={editUrticariaAngioedemaForm} onChange={setEditUrticariaAngioedemaForm} />
        );
      case 'Dermatitis/Eczema':
        return (
          <DermatitisEczemaForm formData={editDermatitisOrEczemaForm} onChange={setEditDermatitisOrEczemaForm} />
        );
      case 'Insect Allergy':
        return (
          <InsectAllergyForm formData={editInsectAllergyForm} onChange={setEditInsectAllergyForm} />
        );
      case 'Tension/Fatigue':
        return (
          <TensionFatigueSyndromeForm formData={editTensionFatigueSyndromeForm} onChange={setEditTensionFatigueSyndromeForm} />
        );
      case 'Other Complaints':
        return (
          <OtherComplaintsForm
            formData={editOtherComplaintsForm}
            onChange={setEditOtherComplaintsForm}
            patientForm={editPatientForm}
            personalHistoryForm={editPersonalHistoryForm}
            mentalHistoryForm={editMentalHistoryForm}
            pastHistoryForm={editPastHistoryForm}
            familyHistoryForm={editFamilyHistoryForm}
            environmentalHistoryForm={editEnvironmentalHistoryForm}
            allergyHistoryForm={editAllergyHistoryForm}
            rhinitisForm={editRhinitisForm}
            headachesForm={editHeadachesForm}
            asthmaForm={editAsthmaForm}
            urticariaAngioedemaForm={editUrticariaAngioedemaForm}
            dermatitisOrEczemaForm={editDermatitisOrEczemaForm}
            insectAllergyForm={editInsectAllergyForm}
            tensionFatigueSyndromeForm={editTensionFatigueSyndromeForm}
          />
        );
      case 'Doctor Examination':
        return (
          <DoctorExaminationForm formData={editExaminationForm} onChange={setEditExaminationForm} />
        );
      case 'Diagnosis':
        return (
          <DiagnosisForm
            formData={editDiagnosisForm}
            onChange={(key, value) => setEditDiagnosisForm(prev => ({ ...prev, [key]: value }))}
            error={editFormErrors.diagnosis}
          />
        );
      default:
        return null;
    }
  };

  const handleEditFormSubmit = async () => {
    const errors = validateEditForm(true);
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      onError();
      return;
    }
    setEditIsSubmitting(true);
    try {
      const mappedPersonalHistoryForm = {
        ...editPersonalHistoryForm,
        addictions: {
          smoker: editPersonalHistoryForm.addictions?.smoker || false,
          alcoholic: editPersonalHistoryForm.addictions?.alcoholic || false,
          details: editPersonalHistoryForm.addictions?.details || ''
        },
        otherAddictions: editPersonalHistoryForm.otherAddictions
      };
      const updatedPatientData = {
        patientId: editPatientId,
        basicInfo: {
          ...editPatientForm,
          bmi: editPatientForm.bmi
        },
        patientHistory: {
          personal: mappedPersonalHistoryForm,
          mental: editMentalHistoryForm,
          past: editPastHistoryForm,
          family: editFamilyHistoryForm,
          environmental: editEnvironmentalHistoryForm,
          allergy: editAllergyHistoryForm,
          patientHistory2: {
            rhinitis: editRhinitisForm,
            headaches: editHeadachesForm,
            asthma: editAsthmaForm,
            tensionFatigueSyndrome: editTensionFatigueSyndromeForm,
            urticariaAngioedema: editUrticariaAngioedemaForm,
            dermatitisOrEczema: editDermatitisOrEczemaForm,
            insectAllergy: editInsectAllergyForm,
            otherComplaints: editOtherComplaintsForm
          }
        },
        diagnosis: editDiagnosisForm,
        examination: editExaminationForm
      };
      const response = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/patients/${patient.patientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPatientData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update patient data');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating patient data:', error);
      onError();
    } finally {
      setEditIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}
    >
      <div
        style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', width: 'calc(100% - 64px)', maxWidth: '800px', margin: '0 20px', maxHeight: '90vh', overflow: 'auto' }}
      >
        {/* Modal Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f0f0f0', borderRadius: '12px 12px 0 0' }}>
          <div className="d-flex align-items-center">
            <div style={{ width: '36px', height: '36px', backgroundColor: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
              <User size={18} style={{ color: 'white' }} />
            </div>
            <div>
              <h5 className="mb-1 fw-bold text-dark" style={{ fontSize: '16px' }}>Edit Patient</h5>
              <div className="d-flex align-items-center text-muted" style={{ fontSize: '13px' }}>
                <span>{new Date().toLocaleDateString('en-GB')}</span>
                <span className="mx-2">•</span>
                <span>Patient Id: </span>
                <span className="text-primary fw-semibold ms-1">{editPatientId || '...'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#6b7280', transition: 'all 0.2s ease-in-out' }}
            onMouseEnter={e => { e.target.style.backgroundColor = '#f3f4f6'; e.target.style.color = '#374151'; }}
            onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#6b7280'; }}
          >
            <X size={20} />
          </button>
        </div>
        {/* Modal Body */}
        {!showEditPersonalHistoryForm && !showEditConditionHistoryForm && (
          <form onSubmit={handleEditPatientFormSubmit} style={{ padding: '32px' }}>
            <div className="mb-4">
              <h6 className="fw-semibold text-dark mb-3" style={{ color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Patient Information
              </h6>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Name *</label>
                  <input
                    type="text"
                    className={`form-control ${editFormErrors.name ? 'is-invalid' : ''}`}
                    value={editPatientForm.name}
                    onChange={e => setEditPatientForm(prev => ({ ...prev, name: e.target.value }))}
                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                    required
                  />
                  {editFormErrors.name && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{editFormErrors.name}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Age *</label>
                  <input
                    type="number"
                    className={`form-control ${editFormErrors.age ? 'is-invalid' : ''}`}
                    value={editPatientForm.age}
                    onChange={e => setEditPatientForm(prev => ({ ...prev, age: e.target.value }))}
                    onKeyDown={handleNumberInput}
                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                    required
                  />
                  {editFormErrors.age && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{editFormErrors.age}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Sex *</label>
                  <select
                    className={`form-select ${editFormErrors.sex ? 'is-invalid' : ''}`}
                    value={editPatientForm.sex}
                    onChange={e => setEditPatientForm(prev => ({ ...prev, sex: e.target.value }))}
                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                    required
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {editFormErrors.sex && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{editFormErrors.sex}</div>}
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Status</label>
                  <select
                    className="form-select"
                    value={editPatientForm.status}
                    onChange={e => setEditPatientForm(prev => ({ ...prev, status: e.target.value }))}
                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                  >
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Occupation</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editPatientForm.occupation}
                    onChange={e => setEditPatientForm(prev => ({ ...prev, occupation: e.target.value }))}
                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Nationality</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editPatientForm.nationality}
                    onChange={e => setEditPatientForm(prev => ({ ...prev, nationality: e.target.value }))}
                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                  />
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Height (Ft.)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editPatientForm.height}
                    onChange={e => setEditPatientForm(prev => ({ ...prev, height: e.target.value }))}
                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Weight (Kg)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editPatientForm.weight}
                    onChange={e => setEditPatientForm(prev => ({ ...prev, weight: e.target.value }))}
                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>BMI</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editPatientForm.bmi}
                    onChange={e => setEditPatientForm(prev => ({ ...prev, bmi: e.target.value }))}
                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                    placeholder="Auto or enter manually"
                  />
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Address</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={editPatientForm.address}
                    onChange={e => setEditPatientForm(prev => ({ ...prev, address: e.target.value }))}
                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Tel 1</label>
                  <input
                    type="tel"
                    className={`form-control ${editFormErrors.tel1 ? 'is-invalid' : ''}`}
                    value={editPatientForm.tel1}
                    onChange={e => setEditPatientForm(prev => ({ ...prev, tel1: e.target.value }))}
                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                    placeholder="10-digit number"
                  />
                  {editFormErrors.tel1 && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{editFormErrors.tel1}</div>}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Tel 2</label>
                  <input
                    type="tel"
                    className={`form-control ${editFormErrors.tel2 ? 'is-invalid' : ''}`}
                    value={editPatientForm.tel2}
                    onChange={e => setEditPatientForm(prev => ({ ...prev, tel2: e.target.value }))}
                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                    placeholder="10-digit number"
                  />
                  {editFormErrors.tel2 && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{editFormErrors.tel2}</div>}
                </div>
              </div>

              <h6 className="fw-semibold text-dark mb-3" style={{ color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Doctor Reference
              </h6>
              <div className="mb-3">
                <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Ref by</label>
                <input
                  type="text"
                  className={`form-control ${editFormErrors.refBy ? 'is-invalid' : ''}`}
                  value={editPatientForm.refBy}
                  onChange={e => setEditPatientForm(prev => ({ ...prev, refBy: e.target.value }))}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    padding: '10px 14px',
                    fontSize: '13px'
                  }}
                />
                {editFormErrors.refBy && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{editFormErrors.refBy}</div>}
              </div>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Dr's Address</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={editPatientForm.drAddress}
                    onChange={e => setEditPatientForm(prev => ({ ...prev, drAddress: e.target.value }))}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '10px 14px',
                      fontSize: '13px'
                    }} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Dr's Contact</label>
                  <input
                    type="text"
                    className={`form-control ${editFormErrors.drContact ? 'is-invalid' : ''}`}
                    value={editPatientForm.drContact}
                    onChange={e => setEditPatientForm(prev => ({ ...prev, drContact: e.target.value }))}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '10px 14px',
                      fontSize: '13px'
                    }}
                  />
                  {editFormErrors.drContact && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{editFormErrors.drContact}</div>}
                </div>
              </div>
              <div className="d-flex justify-content-end gap-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Next
                </button>
              </div>
            </div>
          </form>
        )}

        {showEditPersonalHistoryForm && (
          <div style={{ padding: '2px' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#f8fafc', borderRadius: '12px 12px 0 0' }}>
              {historyTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setEditActiveHistoryTab(tab)}
                  style={{
                    flex: 1,
                    padding: '16px 0',
                    background: editActiveHistoryTab === tab ? '#fff' : 'transparent',
                    border: 'none',
                    borderBottom: editActiveHistoryTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                    color: editActiveHistoryTab === tab ? '#2563eb' : '#6b7280',
                    fontWeight: editActiveHistoryTab === tab ? 600 : 500,
                    fontSize: '15px',
                    cursor: 'pointer',
                    outline: 'none',
                    borderRadius: '12px 12px 0 0',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab} History
                </button>
              ))}
            </div>
            <div style={{ padding: '32px' }}>
              {editActiveHistoryTab === 'Personal' && (
                <form>
                  <div className="mb-4">
                    <h6 className="fw-semibold text-dark mb-3" style={{ color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Diet
                    </h6>
                    <div className="mb-3 d-flex gap-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="diet"
                          id="edit-veg"
                          value="Veg"
                          checked={editPersonalHistoryForm.diet === 'Veg'}
                          onChange={() => handleEditPersonalHistoryInputChange('diet', 'Veg')}
                        />
                        <label className="form-check-label" htmlFor="edit-veg">Veg</label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="diet"
                          id="edit-nonveg"
                          value="Nonveg"
                          checked={editPersonalHistoryForm.diet === 'Nonveg'}
                          onChange={() => handleEditPersonalHistoryInputChange('diet', 'Nonveg')}
                        />
                        <label className="form-check-label" htmlFor="edit-nonveg">Nonveg</label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="diet"
                          id="edit-jain"
                          value="Jain"
                          checked={editPersonalHistoryForm.diet === 'Jain'}
                          onChange={() => handleEditPersonalHistoryInputChange('diet', 'Jain')}
                        />
                        <label className="form-check-label" htmlFor="edit-jain">Jain</label>
                      </div>
                    </div>

                    <h6 className="fw-semibold text-dark mb-3" style={{ color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Addictions
                    </h6>
                    {editPersonalHistoryForm?.addictions && (
                      <div className="row g-3 mb-3">
                        <div className="col-md-12">
                          <div className="d-flex flex-wrap gap-4 mb-3">
                            {[ { key: 'smoker', label: 'Smoker' }, { key: 'alcoholic', label: 'Alcoholic' } ].map((addiction) => (
                              <div className="d-flex align-items-center" key={addiction.key}>
                                <input
                                  type="checkbox"
                                  className="form-check-input me-2"
                                  id={`edit-addiction-${addiction.key}`}
                                  checked={editPersonalHistoryForm.addictions?.[addiction.key] || false}
                                  onChange={e => handleEditAddictionChange(addiction.key, e.target.checked)}
                                />
                                <label
                                  className="form-label fw-medium text-dark mb-0"
                                  htmlFor={`edit-addiction-${addiction.key}`}
                                  style={{ fontSize: '13px' }}
                                >
                                  {addiction.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          {(editPersonalHistoryForm.addictions?.smoker || editPersonalHistoryForm.addictions?.alcoholic) && (
                            <div className="mt-2">
                              <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Addiction Details</label>
                              <textarea
                                className="form-control"
                                rows="2"
                                value={editPersonalHistoryForm.addictions?.details || ''}
                                onChange={e => handleEditAddictionChange('details', e.target.value)}
                                style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                                placeholder="Enter details about smoking/alcohol consumption"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="col-md-12">
                      <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Other Addictions</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={editPersonalHistoryForm.otherAddictions || ''}
                        onChange={e => handleEditPersonalHistoryInputChange('otherAddictions', e.target.value)}
                        style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                        placeholder="Specify other addictions"
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                    <button
                      type="button"
                      onClick={goToEditPreviousHistoryTab}
                      className="btn btn-outline-secondary px-4 py-2"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        color: '#6b7280',
                        fontWeight: '500',
                        transition: 'all 0.2s ease-in-out',
                        fontSize: '13px'
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary px-4 py-2"
                      style={{
                        borderRadius: '8px',
                        backgroundColor: '#2563eb',
                        border: 'none',
                        fontWeight: '500',
                        transition: 'all 0.2s ease-in-out',
                        fontSize: '13px'
                      }}
                      onClick={() => goToEditNextHistoryTab()}
                    >
                      Next
                    </button>
                  </div>
                </form>
              )}
              {editActiveHistoryTab === 'Mental' && (
                <form>
                  <div className="mb-4">
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="edit-anxiety" checked={editMentalHistoryForm.anxiety} onChange={e => handleEditMentalHistoryChange('anxiety', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="edit-anxiety">Anxiety</label>
                        </div>
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="edit-depressiveThoughts" checked={editMentalHistoryForm.depressiveThoughts} onChange={e => handleEditMentalHistoryChange('depressiveThoughts', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="edit-depressiveThoughts">Depressive thoughts</label>
                        </div>
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="edit-obsession" checked={editMentalHistoryForm.obsession} onChange={e => handleEditMentalHistoryChange('obsession', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="edit-obsession">Obsession</label>
                        </div>
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="edit-cryingSpells" checked={editMentalHistoryForm.cryingSpells} onChange={e => handleEditMentalHistoryChange('cryingSpells', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="edit-cryingSpells">Crying spells</label>
                        </div>
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="edit-moodChanges" checked={editMentalHistoryForm.moodChanges} onChange={e => handleEditMentalHistoryChange('moodChanges', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="edit-moodChanges">Mood changes</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="edit-shortTemperedness" checked={editMentalHistoryForm.shortTemperedness} onChange={e => handleEditMentalHistoryChange('shortTemperedness', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="edit-shortTemperedness">Short temperedness</label>
                        </div>
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="edit-hysterical" checked={editMentalHistoryForm.hysterical} onChange={e => handleEditMentalHistoryChange('hysterical', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="edit-hysterical">Hysterical</label>
                        </div>
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="edit-violent" checked={editMentalHistoryForm.violent} onChange={e => handleEditMentalHistoryChange('violent', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="edit-violent">Violent</label>
                        </div>
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="edit-maniacalDisorders" checked={editMentalHistoryForm.maniacalDisorders} onChange={e => handleEditMentalHistoryChange('maniacalDisorders', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="edit-maniacalDisorders">Maniacal disorders</label>
                        </div>
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="edit-schizophrenia" checked={editMentalHistoryForm.schizophrenia} onChange={e => handleEditMentalHistoryChange('schizophrenia', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="edit-schizophrenia">Schizophrenia</label>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Other mentals</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={editMentalHistoryForm.otherMentals}
                        onChange={e => handleEditMentalHistoryChange('otherMentals', e.target.value)}
                        style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                        placeholder="Specify other mental conditions"
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                    <button
                      type="button"
                      onClick={goToEditPreviousHistoryTab}
                      className="btn btn-outline-secondary px-4 py-2"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        color: '#6b7280',
                        fontWeight: '500',
                        transition: 'all 0.2s ease-in-out',
                        fontSize: '13px'
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary px-4 py-2"
                      style={{
                        borderRadius: '8px',
                        backgroundColor: '#2563eb',
                        border: 'none',
                        fontWeight: '500',
                        transition: 'all 0.2s ease-in-out',
                        fontSize: '13px'
                      }}
                      onClick={() => goToEditNextHistoryTab()}
                    >
                      Next
                    </button>
                  </div>
                </form>
              )}
              {editActiveHistoryTab === 'Past' && (
                <form>
                  <div className="mb-4">
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Major illness suffered</label>
                          <input type="text" className="form-control" value={editPastHistoryForm.majorIllness} onChange={e => handleEditPastHistoryChange('majorIllness', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Current chronic illness</label>
                          <input type="text" className="form-control" value={editPastHistoryForm.chronicIllness} onChange={e => handleEditPastHistoryChange('chronicIllness', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Investigations carried out</label>
                          <input type="text" className="form-control" value={editPastHistoryForm.investigations} onChange={e => handleEditPastHistoryChange('investigations', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Surgical history</label>
                          <input type="text" className="form-control" value={editPastHistoryForm.surgicalHistory} onChange={e => handleEditPastHistoryChange('surgicalHistory', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Developmental / Neonatal history</label>
                          <input type="text" className="form-control" value={editPastHistoryForm.developmentalHistory} onChange={e => handleEditPastHistoryChange('developmentalHistory', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Obst /Gyn. history in case of a female</label>
                          <input type="text" className="form-control" value={editPastHistoryForm.obstGynHistory} onChange={e => handleEditPastHistoryChange('obstGynHistory', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Current treatment</label>
                          <input type="text" className="form-control" value={editPastHistoryForm.currentTreatment} onChange={e => handleEditPastHistoryChange('currentTreatment', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                    <button
                      type="button"
                      onClick={goToEditPreviousHistoryTab}
                      className="btn btn-outline-secondary px-4 py-2"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        color: '#6b7280',
                        fontWeight: '500',
                        transition: 'all 0.2s ease-in-out',
                        fontSize: '13px'
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary px-4 py-2"
                      style={{
                        borderRadius: '8px',
                        backgroundColor: '#2563eb',
                        border: 'none',
                        fontWeight: '500',
                        transition: 'all 0.2s ease-in-out',
                        fontSize: '13px'
                      }}
                      onClick={() => goToEditNextHistoryTab()}
                    >
                      Next
                    </button>
                  </div>
                </form>
              )}
              {editActiveHistoryTab === 'Family' && (
                <form>
                  <div className="mb-4">
                    <div className="table-responsive mb-3">
                      <table className="table table-bordered" style={{ minWidth: '600px', fontSize: '13px' }}>
                        <thead style={{ background: '#e0f2fe' }}>
                          <tr>
                            <th>Illness</th>
                            {familyMembers.map(member => (
                              <th key={member}>{member}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {illnessList.map(illness => {
                            // Debugging: Log the current illness and the relevant form data
                            console.log('Current Illness:', illness);
                            console.log('editFamilyHistoryForm.illnesses:', editFamilyHistoryForm.illnesses);
                            console.log('editFamilyHistoryForm.illnesses[illness]:', editFamilyHistoryForm.illnesses?.[illness]);

                            return (
                              <tr key={illness}>
                                <td>{illness}</td>
                                {familyMembers.map(member => (
                                  <td key={member} style={{ textAlign: 'center' }}>
                                    <input
                                      type="checkbox"
                                      checked={!!editFamilyHistoryForm.illnesses?.[illness]?.[member]}
                                      onChange={e => handleEditFamilyHistoryCheckbox(illness, member, e.target.checked)}
                                    />
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Any other family history</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={editFamilyHistoryForm.other}
                        onChange={e => handleEditFamilyHistoryOther(e.target.value)}
                        style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                    <button
                      type="button"
                      onClick={goToEditPreviousHistoryTab}
                      className="btn btn-outline-secondary px-4 py-2"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        color: '#6b7280',
                        fontWeight: '500',
                        transition: 'all 0.2s ease-in-out',
                        fontSize: '13px'
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary px-4 py-2"
                      style={{
                        borderRadius: '8px',
                        backgroundColor: '#2563eb',
                        border: 'none',
                        fontWeight: '500',
                        transition: 'all 0.2s ease-in-out',
                        fontSize: '13px'
                      }}
                      onClick={() => goToEditNextHistoryTab()}
                    >
                      Next
                    </button>
                  </div>
                </form>
              )}
              {editActiveHistoryTab === 'Environmental' && (
                <form>
                  <div className="mb-4">
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Duration of stay in current home</label>
                          <input type="text" className="form-control" value={editEnvironmentalHistoryForm.durationOfStay} onChange={e => handleEditEnvironmentalHistoryChange('durationOfStay', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Commercial place nearby</label>
                          <input type="text" className="form-control" value={editEnvironmentalHistoryForm.commercialPlace} onChange={e => handleEditEnvironmentalHistoryChange('commercialPlace', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Pets (Indoor / Outdoor)</label>
                          <input type="text" className="form-control" value={editEnvironmentalHistoryForm.pets} onChange={e => handleEditEnvironmentalHistoryChange('pets', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Pillow type</label>
                          <input type="text" className="form-control" value={editEnvironmentalHistoryForm.pillowType} onChange={e => handleEditEnvironmentalHistoryChange('pillowType', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Mattress type</label>
                          <input type="text" className="form-control" value={editEnvironmentalHistoryForm.mattressType} onChange={e => handleEditEnvironmentalHistoryChange('mattressType', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Carpet type</label>
                          <input type="text" className="form-control" value={editEnvironmentalHistoryForm.carpetType} onChange={e => handleEditEnvironmentalHistoryChange('carpetType', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Draperies type</label>
                          <input type="text" className="form-control" value={editEnvironmentalHistoryForm.draperiesType} onChange={e => handleEditEnvironmentalHistoryChange('draperiesType', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Blanket type</label>
                          <input type="text" className="form-control" value={editEnvironmentalHistoryForm.blanketType} onChange={e => handleEditEnvironmentalHistoryChange('blanketType', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Indoor type</label>
                          <input type="text" className="form-control" value={editEnvironmentalHistoryForm.indoorType} onChange={e => handleEditEnvironmentalHistoryChange('indoorType', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Stuffed toys in bedrooms</label>
                          <input type="text" className="form-control" value={editEnvironmentalHistoryForm.stuffedToys} onChange={e => handleEditEnvironmentalHistoryChange('stuffedToys', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3 d-flex align-items-center">
                          <input
                            className="form-check-input me-2"
                            type="checkbox"
                            id="edit-usingAC"
                            checked={editEnvironmentalHistoryForm.usingAC}
                            onChange={e => handleEditEnvironmentalHistoryChange('usingAC', e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="edit-usingAC" style={{ fontSize: '13px' }}>Using Air-conditioner</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Occupational Hazards</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={editEnvironmentalHistoryForm.occupationalHazards || ''}
                      onChange={e => handleEditEnvironmentalHistoryChange('occupationalHazards', e.target.value)}
                      style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                      placeholder="Specify any occupational hazards"
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                    <button
                      type="button"
                      onClick={goToEditPreviousHistoryTab}
                      className="btn btn-outline-secondary px-4 py-2"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        color: '#6b7280',
                        fontWeight: '500',
                        transition: 'all 0.2s ease-in-out',
                        fontSize: '13px'
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary px-4 py-2"
                      style={{
                        borderRadius: '8px',
                        backgroundColor: '#2563eb',
                        border: 'none',
                        fontWeight: '500',
                        transition: 'all 0.2s ease-in-out',
                        fontSize: '13px'
                      }}
                      onClick={() => goToEditNextHistoryTab()}
                    >
                      Next
                    </button>
                  </div>
                </form>
              )}
              {editActiveHistoryTab === 'Allergy' && (
                <form>
                  <div className="mb-4">
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Previous allergy tests (including when)</label>
                          <input type="text" className="form-control" value={editAllergyHistoryForm.previousTests} onChange={e => handleEditAllergyHistoryChange('previousTests', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Tests if done, by whom the tests were conducted</label>
                          <input type="text" className="form-control" value={editAllergyHistoryForm.testsByWhom} onChange={e => handleEditAllergyHistoryChange('testsByWhom', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Any injections started. If yes, when</label>
                          <input type="text" className="form-control" value={editAllergyHistoryForm.injectionsStarted} onChange={e => handleEditAllergyHistoryChange('injectionsStarted', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Continued injections how long</label>
                          <input type="text" className="form-control" value={editAllergyHistoryForm.continuedInjections} onChange={e => handleEditAllergyHistoryChange('continuedInjections', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Any results</label>
                          <input type="text" className="form-control" value={editAllergyHistoryForm.anyResults} onChange={e => handleEditAllergyHistoryChange('anyResults', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Drug allergies (including drug name and reaction type)</label>
                          <input type="text" className="form-control" value={editAllergyHistoryForm.drugAllergies} onChange={e => handleEditAllergyHistoryChange('drugAllergies', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Known food allergies</label>
                          <input type="text" className="form-control" value={editAllergyHistoryForm.foodAllergies} onChange={e => handleEditAllergyHistoryChange('foodAllergies', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Contact allergy</label>
                          <input type="text" className="form-control" value={editAllergyHistoryForm.contactAllergy} onChange={e => handleEditAllergyHistoryChange('contactAllergy', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                    <button
                      type="button"
                      onClick={goToEditPreviousHistoryTab}
                      className="btn btn-outline-secondary px-4 py-2"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        color: '#6b7280',
                        fontWeight: '500',
                        transition: 'all 0.2s ease-in-out',
                        fontSize: '13px'
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary px-4 py-2"
                      style={{
                        borderRadius: '8px',
                        backgroundColor: '#2563eb',
                        border: 'none',
                        fontWeight: '500',
                        transition: 'all 0.2s ease-in-out',
                        fontSize: '13px'
                      }}
                      onClick={() => goToEditNextHistoryTab()}
                    >
                      Next
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {showEditConditionHistoryForm && (
          <div style={{ padding: '2px' }}>
            <div style={{ background: '#f8fafc', borderRadius: '12px 12px 0 0' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0 16px' }}>
                {conditionTabs.slice(0, 5).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setEditActiveConditionTab(tab)}
                    style={{
                      flex: 1,
                      padding: '16px 0',
                      background: editActiveConditionTab === tab ? '#fff' : 'transparent',
                      border: 'none',
                      borderBottom: editActiveConditionTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                      color: editActiveConditionTab === tab ? '#2563eb' : '#6b7280',
                      fontWeight: editActiveConditionTab === tab ? 600 : 500,
                      fontSize: '14px',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s',
                      margin: '0 4px',
                      borderRadius: '8px 8px 0 0',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {tab}
                    {editActiveConditionTab === tab && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: '#2563eb', transition: 'all 0.2s' }} />
                    )}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', padding: '0 16px' }}>
                {conditionTabs.slice(5).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setEditActiveConditionTab(tab)}
                    style={{
                      flex: 1,
                      padding: '16px 0',
                      background: editActiveConditionTab === tab ? '#fff' : 'transparent',
                      border: 'none',
                      borderBottom: editActiveConditionTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                      color: editActiveConditionTab === tab ? '#2563eb' : '#6b7280',
                      fontWeight: editActiveConditionTab === tab ? 600 : 500,
                      fontSize: '14px',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s',
                      margin: '0 4px',
                      borderRadius: '8px 8px 0 0',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {tab}
                    {editActiveConditionTab === tab && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: '#2563eb', transition: 'all 0.2s' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ padding: '32px' }}>
              {renderEditConditionTab()}

              <div className="d-flex justify-content-end gap-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                <button
                  type="button"
                  onClick={handleEditConditionBack}
                  className="btn btn-outline-secondary px-4 py-2"
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    color: '#6b7280',
                    fontWeight: '500',
                    transition: 'all 0.2s ease-in-out',
                    fontSize: '13px'
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goToEditNextConditionTab}
                  disabled={editIsSubmitting}
                  className="btn btn-primary px-4 py-2"
                  style={{
                    borderRadius: '8px',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    fontWeight: '500',
                    transition: 'all 0.2s ease-in-out',
                    fontSize: '13px'
                  }}
                >
                  {editIsSubmitting ? 'Updating...' : conditionTabs.indexOf(editActiveConditionTab) === conditionTabs.length - 1 ? 'Update' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditPatient; 