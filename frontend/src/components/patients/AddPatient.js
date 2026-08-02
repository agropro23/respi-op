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
import { apiFetch } from '../../utils/api'; 
import DiagnosisForm from '../patientForms/Diagnosis';
import DoctorExaminationForm from '../patientForms/DoctorExamination';
import ModalHeader from '../ModalHeader';
import { handleNumberInput } from '../../utils/inputUtils';

const AddPatient = ({ onClose, onSuccess, onError }) => {
  const [showPersonalHistoryForm, setShowPersonalHistoryForm] = useState(false);
  const [showConditionHistoryForm, setShowConditionHistoryForm] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [activeHistoryTab, setActiveHistoryTab] = useState('Personal');
  const [activeConditionTab, setActiveConditionTab] = useState('Rhinitis');

  const [patientForm, setPatientForm] = useState({
    name: '',
    age: '',
    sex: '',
    status: '',
    occupation: '',
    nationality: 'Indian',
    height: '',
    weight: '',
    bmi: '',
    address: '',
    tel1: '',
    tel2: '',
    refBy: '',
    drAddress: '',
    drContact: ''
  });

  const [personalHistoryForm, setPersonalHistoryForm] = useState({
    diet: '',
    addictions: {
      smoker: false,
      alcoholic: false,
      details: ''
    },
    otherAddictions: ''
  });

  const [mentalHistoryForm, setMentalHistoryForm] = useState({
    anxiety: false,
    depressiveThoughts: false,
    obsession: false,
    cryingSpells: false,
    moodChanges: false,
    shortTemperedness: false,
    hysterical: false,
    violent: false,
    maniacalDisorders: false,
    schizophrenia: false,
    otherMentals: ''
  });

  const [pastHistoryForm, setPastHistoryForm] = useState({
    majorIllness: '',
    chronicIllness: '',
    investigations: '',
    surgicalHistory: '',
    developmentalHistory: '',
    obstGynHistory: '',
    currentTreatment: ''
  });

  const [familyHistoryForm, setFamilyHistoryForm] = useState({
    illnesses: {
      Asthma: {},
      Rhinitis: {},
      Sinusitis: {},
      Urticaria: {},
      Eczema: {},
      'Hives/swellings': {},
      Migraine: {}
    },
    other: ''
  });

  const [environmentalHistoryForm, setEnvironmentalHistoryForm] = useState({
    durationOfStay: '',
    commercialPlace: '',
    pets: '',
    pillowType: '',
    mattressType: '',
    carpetType: '',
    draperiesType: '',
    blanketType: '',
    indoorType: '',
    stuffedToys: '',
    usingAC: false,
    occupationalHazards: ''
  });

  const [allergyHistoryForm, setAllergyHistoryForm] = useState({
    previousTests: '',
    testsByWhom: '',
    injectionsStarted: '',
    continuedInjections: '',
    anyResults: '',
    drugAllergies: '',
    foodAllergies: '',
    contactAllergy: ''
  });

  const [rhinitisForm, setRhinitisForm] = useState({
    onset: '',
    worstSeason: '',
    sneezing: false,
    runningNose: false,
    discharge: false,
    nasalCongestion: false,
    nasalBleeding: false,
    lossOfSmell: false,
    nasalPolyps: false,
    itchingInNose: false,
    postNasalDischarge: false,
    frequentSoreThroat: false,
    tighteningFromEyes: false,
    earache: false,
    cough: false,
    earInfections: false,
    dizzySpells: false,
    itchingInEyes: false
  });

  const [headachesForm, setHeadachesForm] = useState({
    onset: '',
    durationOfEpisode: '',
    characterOfHeadache: '',
    location: '',
    frequency: '',
    aggravation: '',
    associatedSymptoms: {
      nausea: false,
      vomiting: false,
      visualDisturbances: false,
      numbnessInExtremities: false
    },
    possibleCauses: ''
  });

  const [asthmaForm, setAsthmaForm] = useState({
    onset: '',
    bronchitis: false,
    pneumonia: false,
    cough: false,
    tightnessOfChest: false,
    wheeze: false,
    sputumColor: '',
    worstSeason: '',
    medicinesTaken: '',
    attacksDuring: '',
    hospitalVisitsAdmissions: '',
    freqOfAttacks: '',
    qualityOfLife: '',
    lastAttack: '',
    daysOfMissedWorkSchool: ''
  });

  const [tensionFatigueSyndromeForm, setTensionFatigueSyndromeForm] = useState({
    fatigue: false,
    tension: false,
    excessiveSweating: false,
    headaches: false,
    nausea: false,
    vomiting: false,
    abdPain: false,
    diarrhoea: false,
    constipation: false,
    bedWetting: false,
    pallor: false,
    weightLoss: false,
    unexplainedFever: false,
    vagueAches: false,
    excessiveSchoolAbsences: false,
    darkOcularCircles: false,
    periorbitalOedema: false,
    cervicalAdenopathy: false,
    sleep: '',
    otherSymptoms: ''
  });

  const [urticariaAngioedemaForm, setUrticariaAngioedemaForm] = useState({
    onset: '',
    durationOfEpisodes: '',
    location: '',
    aggravatingFactors: '',
    itching: false,
    hives: false,
    swelling: false,
    fever: false,
    urinaryTractInfection: false,
    jointPain: false,
    abdominalPain: false,
    scratchTest: '',
    pressureTest: '',
    coldTest: ''
  });

  const [dermatitisOrEczemaForm, setDermatitisOrEczemaForm] = useState({
    onset: '',
    rashes: '',
    location: '',
    possibleCauses: '',
    itching: false,
    scaling: false,
    burning: false,
    infection: false
  });

  const [insectAllergyForm, setInsectAllergyForm] = useState({
    insect: '',
    whenBitten: '',
    reactions: {
      itching: false,
      burning: false,
      redness: false,
      swelling: false
    }
  });

  const [otherComplaintsForm, setOtherComplaintsForm] = useState({
    complaints: ''
  });

  const [diagnosisForm, setDiagnosisForm] = useState({
    bronchialAsthma: false,
    copd: false,
    bronchiectasis: false,
    rhinitis: false,
    sinusitis: false,
    drugAllergy: false,
    conjunctivitis: false,
    eczema: false,
    urticaria: false,
    other: ''
  });

  const [examinationForm, setExaminationForm] = useState({
    pulse: '',
    bp: '',
    conjunctiva: '',
    nails: '',
    tongue: '',
    throat: '',
    sclera: ''
  });

  const familyMembers = ['Father', 'Mother', 'Brother', 'Sister', 'Grand father', 'Grand mother'];
  const illnessList = ['Asthma', 'Rhinitis', 'Sinusitis', 'Urticaria', 'Eczema', 'Hives/swellings', 'Migraine'];

  // Generate Patient ID function
  const generatePatientId = async () => {
    try {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);

      const response = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/patients`);
      const data = await response.json();
      const patients = Array.isArray(data) ? data : data.patients || [];

      const currentMonthPatients = patients.filter(patient => {
        if (!patient.patientId) return false;
        const patientMonth = patient.patientId.substring(patient.patientId.length - 4, patient.patientId.length - 2);
        const patientYear = patient.patientId.substring(patient.patientId.length - 2);
        return patientMonth === month && patientYear === year;
      });

      let maxSequenceNumber = 0;
      currentMonthPatients.forEach(patient => {
        const seqNum = parseInt(patient.patientId.substring(0, patient.patientId.length - 4));
        if (!isNaN(seqNum) && seqNum > maxSequenceNumber) {
          maxSequenceNumber = seqNum;
        }
      });

      const newSequenceNumber = (maxSequenceNumber + 1).toString();
      const newPatientId = `${newSequenceNumber}${month}${year}`;
      return newPatientId;
    } catch (error) {
      console.error('Error generating patient ID:', error);
      return null;
    }
  };

  useEffect(() => {
    generatePatientId().then(id => {
      if (id) setPatientId(id);
    });
  }, []);

  // Calculate BMI when height or weight changes
  useEffect(() => {
    if (patientForm.height && patientForm.weight) {
      const height = parseFloat(patientForm.height);
      const weight = parseFloat(patientForm.weight);

      if (!isNaN(height) && !isNaN(weight) && height > 0 && weight > 0) {
        const heightInMeters = height / 100; // Convert centimeters to meters
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        setPatientForm(prev => ({
          ...prev,
          bmi: bmi
        }));
      }
    }
  }, [patientForm.height, patientForm.weight]);

  const validateForm = (checkDiagnosis = false) => {
    const errors = {};
    if (!patientForm.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!patientForm.age) {
      errors.age = 'Age is required';
    } else if (isNaN(patientForm.age) || patientForm.age < 0 || patientForm.age > 150) {
      errors.age = 'Please enter a valid age';
    }
    if (!patientForm.sex) {
      errors.sex = 'Sex is required';
    }
    // Make phone numbers optional but validate format if provided
    if (patientForm.tel1 && patientForm.tel1.trim() && !/^\d{10}$/.test(patientForm.tel1)) {
      errors.tel1 = 'Please enter a valid 10-digit phone number';
    }
    if (patientForm.tel2 && patientForm.tel2.trim() && !/^\d{10}$/.test(patientForm.tel2)) {
      errors.tel2 = 'Please enter a valid 10-digit phone number';
    }
    // Make height and weight optional but validate if provided
    if (patientForm.height && patientForm.height.trim() && isNaN(patientForm.height)) {
      errors.height = 'Please enter a valid height';
    }
    if (patientForm.weight && patientForm.weight.trim() && isNaN(patientForm.weight)) {
      errors.weight = 'Please enter a valid weight';
    }

    // Only check diagnosis if requested (i.e., on final submit)
    if (checkDiagnosis) {
      const atLeastOneDiagnosis =
        Object.values(diagnosisForm).some(
          (val, idx) => idx < 9 && val === true
        ) || (diagnosisForm.other && diagnosisForm.other.trim() !== '');
      if (!atLeastOneDiagnosis) {
        errors.diagnosis = 'At least one diagnosis must be selected or "Other" must be filled';
      }
    }

    return errors;
  };

  const handleInputChange = (field, value) => {
    setPatientForm(prev => {
      const updated = {
        ...prev,
        [field]: value
      };

      // Auto-calculate BMI when height or weight changes
      if ((field === 'height' || field === 'weight') && updated.height && updated.weight) {
        const height = parseFloat(updated.height);
        const weight = parseFloat(updated.weight);

        if (!isNaN(height) && !isNaN(weight) && height > 0 && weight > 0) {
          const heightInMeters = height / 100; // Convert centimeters to meters
          const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
          updated.bmi = bmi;
        }
      }

      return updated;
    });

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddictionChange = (field, value) => {
    setPersonalHistoryForm(prev => ({
      ...prev,
      addictions: {
        ...prev.addictions,
        [field]: value
      }
    }));
  };

  const handlePersonalHistoryInputChange = (field, value) => {
    setPersonalHistoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMentalHistoryChange = (field, value) => {
    setMentalHistoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePastHistoryChange = (field, value) => {
    setPastHistoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFamilyHistoryCheckbox = (illness, member, checked) => {
    setFamilyHistoryForm(prev => ({
      ...prev,
      illnesses: {
        ...prev.illnesses,
        [illness]: {
          ...prev.illnesses[illness],
          [member]: checked
        }
      }
    }));
  };

  const handleFamilyHistoryOther = (value) => {
    setFamilyHistoryForm(prev => ({ ...prev, other: value }));
  };

  const handleEnvironmentalHistoryChange = (field, value) => {
    setEnvironmentalHistoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAllergyHistoryChange = (field, value) => {
    setAllergyHistoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDiagnosisChange = (key, value) => {
    setDiagnosisForm(prev => ({
      ...prev,
      [key]: value
    }));

    // Clear error if at least one diagnosis is selected or "Other" is filled
    const updatedForm = { ...diagnosisForm, [key]: value };
    const atLeastOneDiagnosis =
      Object.values(updatedForm).some(
        (val, idx) => idx < 9 && val === true
      ) || (updatedForm.other && updatedForm.other.trim() !== '');
    if (formErrors.diagnosis && atLeastOneDiagnosis) {
      setFormErrors(prev => ({ ...prev, diagnosis: '' }));
    }
  };

  const handleExaminationChange = (field, value) => {
    setExaminationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOtherComplaintsChange = (field, value) => {
    setOtherComplaintsForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Navigation handlers
  const goToPersonalInfo = () => {
    setShowPersonalHistoryForm(false);
    setActiveHistoryTab('Personal');
  };
  const goToHistoryTab = (tab) => {
    setActiveHistoryTab(tab);
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

  const handlePatientFormSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm(false);

    // Only validate required fields for the first form
    const requiredFields = ['name', 'age', 'sex'];
    const filteredErrors = Object.fromEntries(
      Object.entries(errors).filter(([key]) => requiredFields.includes(key))
    );

    if (Object.keys(filteredErrors).length === 0) {
      setShowPersonalHistoryForm(true);
      setFormErrors({});
    } else {
      setFormErrors(filteredErrors);
    }
  };

  const goToNextHistoryTab = () => {
    const currentIndex = historyTabs.indexOf(activeHistoryTab);
    if (currentIndex < historyTabs.length - 1) {
      setActiveHistoryTab(historyTabs[currentIndex + 1]);
    } else if (activeHistoryTab === 'Allergy') {
      setShowPersonalHistoryForm(false);
      setShowConditionHistoryForm(true);
      setActiveConditionTab('Rhinitis');
    }
  };

  const handleConditionBack = () => {
    const currentIndex = conditionTabs.indexOf(activeConditionTab);
    if (currentIndex === 0) {
      setShowConditionHistoryForm(false);
      setShowPersonalHistoryForm(true);
      setActiveHistoryTab('Allergy');
    } else {
      setActiveConditionTab(conditionTabs[currentIndex - 1]);
    }
  };

  const goToNextConditionTab = () => {
    const currentIndex = conditionTabs.indexOf(activeConditionTab);
    if (currentIndex < conditionTabs.length - 1) {
      setActiveConditionTab(conditionTabs[currentIndex + 1]);
    } else {
      // If we're on the last tab, submit the form
      handleFormSubmit();
    }
  };

  const goToPreviousHistoryTab = () => {
    const currentIndex = historyTabs.indexOf(activeHistoryTab);
    if (currentIndex > 0) {
      setActiveHistoryTab(historyTabs[currentIndex - 1]);
    } else {
      setShowPersonalHistoryForm(false);
    }
  };

  const renderConditionTab = () => {
    switch (activeConditionTab) {
      case 'Rhinitis':
        return (
          <RhinitisForm
            formData={rhinitisForm}
            onChange={(newFormData) => setRhinitisForm(newFormData)}
          />
        );
      case 'Headaches':
        return (
          <HeadachesForm
            formData={headachesForm}
            onChange={(newFormData) => setHeadachesForm(newFormData)}
          />
        );
      case 'Asthma':
        return (
          <AsthmaForm
            formData={asthmaForm}
            onChange={(newFormData) => setAsthmaForm(newFormData)}
          />
        );
      case 'Urticaria/Angioedema':
        return (
          <UrticariaAngioedemaForm
            formData={urticariaAngioedemaForm}
            onChange={(newFormData) => setUrticariaAngioedemaForm(newFormData)}
          />
        );
      case 'Dermatitis/Eczema':
        return (
          <DermatitisEczemaForm
            formData={dermatitisOrEczemaForm}
            onChange={(newFormData) => setDermatitisOrEczemaForm(newFormData)}
          />
        );
      case 'Insect Allergy':
        return (
          <InsectAllergyForm
            formData={insectAllergyForm}
            onChange={(newFormData) => setInsectAllergyForm(newFormData)}
          />
        );
      case 'Tension/Fatigue':
        return (
          <TensionFatigueSyndromeForm
            formData={tensionFatigueSyndromeForm}
            onChange={(newFormData) => setTensionFatigueSyndromeForm(newFormData)}
          />
        );
      case 'Other Complaints':
        return (
          <OtherComplaintsForm
            formData={otherComplaintsForm}
            onChange={(newFormData) => setOtherComplaintsForm(newFormData)}
            patientForm={patientForm}
            personalHistoryForm={personalHistoryForm}
            mentalHistoryForm={mentalHistoryForm}
            pastHistoryForm={pastHistoryForm}
            familyHistoryForm={familyHistoryForm}
            environmentalHistoryForm={environmentalHistoryForm}
            allergyHistoryForm={allergyHistoryForm}
            rhinitisForm={rhinitisForm}
            headachesForm={headachesForm}
            asthmaForm={asthmaForm}
            urticariaAngioedemaForm={urticariaAngioedemaForm}
            dermatitisOrEczemaForm={dermatitisOrEczemaForm}
            insectAllergyForm={insectAllergyForm}
            tensionFatigueSyndromeForm={tensionFatigueSyndromeForm}
          />
        );
      case 'Doctor Examination':
        return (
          <DoctorExaminationForm
            formData={examinationForm}
            onChange={(newFormData) => setExaminationForm(newFormData)}
          />
        );
      case 'Diagnosis':
        return (
          <DiagnosisForm
            formData={diagnosisForm}
            onChange={(key, value) => {
              setDiagnosisForm(prev => ({
                ...prev,
                [key]: value
              }));

              const updatedForm = { ...diagnosisForm, [key]: value };
              const atLeastOneDiagnosis =
                Object.values(updatedForm).some(
                  (val, idx) => idx < 9 && val === true
                ) || (updatedForm.other && updatedForm.other.trim() !== '');
              if (formErrors.diagnosis && atLeastOneDiagnosis) {
                setFormErrors(prev => ({ ...prev, diagnosis: '' }));
              }
            }}
            error={formErrors.diagnosis}
          />
        );
      default:
        return null;
    }
  };

  const handleFormSubmit = async () => {
    const errors = validateForm(true); // Check diagnosis on final submit
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      onError();
      return;
    }

    setIsSubmitting(true);
    try {
      const mappedPersonalHistoryForm = {
        ...personalHistoryForm,
        addictions: {
          smoker: personalHistoryForm.addictions.smoker || false,
          alcoholic: personalHistoryForm.addictions.alcoholic || false,
          details: personalHistoryForm.addictions.details || ''
        },
        otherAddictions: personalHistoryForm.otherAddictions || ''
      };

      const patientData = {
        patientId,
        basicInfo: {
          ...patientForm,
          bmi: patientForm.bmi
        },
        patientHistory: {
          personal: mappedPersonalHistoryForm,
          mental: mentalHistoryForm,
          past: pastHistoryForm,
          family: familyHistoryForm,
          environmental: environmentalHistoryForm,
          allergy: allergyHistoryForm,
          patientHistory2: {
            rhinitis: rhinitisForm,
            headaches: headachesForm,
            asthma: asthmaForm,
            tensionFatigueSyndrome: tensionFatigueSyndromeForm,
            urticariaAngioedema: urticariaAngioedemaForm,
            dermatitisOrEczema: dermatitisOrEczemaForm,
            insectAllergy: insectAllergyForm,
            otherComplaints: otherComplaintsForm
          }
        },
        diagnosis: diagnosisForm,
        examination: examinationForm
      };

      const response = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save patient data');
      }

      onSuccess();
      onClose(); // Close modal on successful submission
    } catch (error) {
      console.error('Error saving patient data:', error);
      onError();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          width: 'calc(100% - 64px)',
          maxWidth: '800px',
          margin: '0 20px',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f0f0f0',
            borderRadius: '12px 12px 0 0'
          }}
        >
          <div className="d-flex align-items-center">
            <div
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#2563eb',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}
            >
              <User size={18} style={{ color: 'white' }} />
            </div>
            <div>
              <h5 className="mb-1 fw-bold text-dark" style={{ fontSize: '16px' }}>Add Patient</h5>
              <div className="d-flex align-items-center text-muted" style={{ fontSize: '13px' }}>
                <span>{new Date().toLocaleDateString('en-GB')}</span>
                <span className="mx-2">•</span>
                <span>Patient Id: </span>
                <span className="text-primary fw-semibold ms-1">{patientId || 'Generating...'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#6b7280',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#6b7280';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        {!showPersonalHistoryForm && !showConditionHistoryForm && (
          <form onSubmit={handlePatientFormSubmit} style={{ padding: '32px' }}>
            {/* Patient Info Section */}
            <div className="mb-4">
              <h6 className="fw-semibold text-dark mb-3" style={{ color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Patient Information
              </h6>

              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Name *</label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                    value={patientForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '10px 14px',
                      fontSize: '13px'
                    }}
                    required
                  />
                  {formErrors.name && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{formErrors.name}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Age *</label>
                  <input
                    type="number"
                    className={`form-control ${formErrors.age ? 'is-invalid' : ''}`}
                    value={patientForm.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    onKeyDown={handleNumberInput}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '10px 14px',
                      fontSize: '13px'
                    }}
                    required
                  />
                  {formErrors.age && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{formErrors.age}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Sex *</label>
                  <select
                    className={`form-select ${formErrors.sex ? 'is-invalid' : ''}`}
                    value={patientForm.sex}
                    onChange={(e) => handleInputChange('sex', e.target.value)}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '10px 14px',
                      fontSize: '13px'
                    }}
                    required
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.sex && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{formErrors.sex}</div>}
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Status</label>
                  <select
                    className="form-select"
                    value={patientForm.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '10px 14px',
                      fontSize: '13px'
                    }}
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
                    value={patientForm.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '10px 14px',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Nationality</label>
                  <input
                    type="text"
                    className="form-control"
                    value={patientForm.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '10px 14px',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Height (Cm)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={patientForm.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Weight (Kg)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={patientForm.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>BMI</label>
                  <input
                    type="text"
                    className="form-control"
                    value={patientForm.bmi}
                    onChange={(e) => handleInputChange('bmi', e.target.value)}
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
                    value={patientForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Tel 1</label>
                  <input
                    type="tel"
                    className={`form-control ${formErrors.tel1 ? 'is-invalid' : ''}`}
                    value={patientForm.tel1}
                    onChange={(e) => handleInputChange('tel1', e.target.value)}
                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                    placeholder="10-digit number"
                  />
                  {formErrors.tel1 && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{formErrors.tel1}</div>}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Tel 2</label>
                  <input
                    type="tel"
                    className={`form-control ${formErrors.tel2 ? 'is-invalid' : ''}`}
                    value={patientForm.tel2}
                    onChange={(e) => handleInputChange('tel2', e.target.value)}
                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                    placeholder="10-digit number"
                  />
                  {formErrors.tel2 && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{formErrors.tel2}</div>}
                </div>
              </div>

              {/* Doctor Reference Section */}
              <h6 className="fw-semibold text-dark mb-3" style={{ color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Doctor Reference
              </h6>

              <div className="mb-3">
                <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Ref by</label>
                <input
                  type="text"
                  className={`form-control ${formErrors.refBy ? 'is-invalid' : ''}`}
                  value={patientForm.refBy}
                  onChange={(e) => handleInputChange('refBy', e.target.value)}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    padding: '10px 14px',
                    fontSize: '13px'
                  }}
                />
                {formErrors.refBy && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{formErrors.refBy}</div>}
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Dr's Address</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={patientForm.drAddress}
                    onChange={(e) => handleInputChange('drAddress', e.target.value)}
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
                    className={`form-control ${formErrors.drContact ? 'is-invalid' : ''}`}
                    value={patientForm.drContact}
                    onChange={(e) => handleInputChange('drContact', e.target.value)}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '10px 14px',
                      fontSize: '13px'
                    }}
                  />
                  {formErrors.drContact && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{formErrors.drContact}</div>}
                </div>
              </div>

              {/* Form Actions */}
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

        {showPersonalHistoryForm && (
          <div style={{ padding: '2px' }}>
            {/* Tabs (enabled) */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#f8fafc', borderRadius: '12px 12px 0 0' }}>
              {historyTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => goToHistoryTab(tab)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    background: activeHistoryTab === tab ? '#fff' : 'transparent',
                    border: 'none',
                    borderBottom: activeHistoryTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                    color: activeHistoryTab === tab ? '#2563eb' : '#6b7280',
                    fontWeight: activeHistoryTab === tab ? 600 : 500,
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

            {/* Tab Content */}
            <div style={{ padding: '32px' }}>
              {activeHistoryTab === 'Personal' && (
                <form>
                  <div className="mb-4">
                    {/* Diet Section */}
                    <h6 className="fw-semibold text-dark mb-3" style={{ color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Diet
                    </h6>
                    <div className="mb-3 d-flex gap-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="diet"
                          id="veg"
                          value="Veg"
                          checked={personalHistoryForm.diet === 'Veg'}
                          onChange={() => handlePersonalHistoryInputChange('diet', 'Veg')}
                        />
                        <label className="form-check-label" htmlFor="veg">Veg</label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="diet"
                          id="nonveg"
                          value="Nonveg"
                          checked={personalHistoryForm.diet === 'Nonveg'}
                          onChange={() => handlePersonalHistoryInputChange('diet', 'Nonveg')}
                        />
                        <label className="form-check-label" htmlFor="nonveg">Nonveg</label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="diet"
                          id="jain"
                          value="Jain"
                          checked={personalHistoryForm.diet === 'Jain'}
                          onChange={() => handlePersonalHistoryInputChange('diet', 'Jain')}
                        />
                        <label className="form-check-label" htmlFor="jain">Jain</label>
                      </div>
                    </div>

                    {/* Addictions Section */}
                    <h6 className="fw-semibold text-dark mb-3" style={{ color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Addictions
                    </h6>
                    <div className="row g-3 mb-3">
                      <div className="col-md-12">
                        <div className="d-flex flex-wrap gap-4 mb-3">
                          {[ { key: 'smoker', label: 'Smoker' }, { key: 'alcoholic', label: 'Alcoholic' } ].map((addiction) => (
                            <div className="d-flex align-items-center" key={addiction.key}>
                              <input
                                type="checkbox"
                                className="form-check-input me-2"
                                id={`addiction-${addiction.key}`}
                                checked={personalHistoryForm.addictions?.[addiction.key] || false}
                                onChange={e => handleAddictionChange(addiction.key, e.target.checked)}
                              />
                              <label
                                className="form-label fw-medium text-dark mb-0"
                                htmlFor={`addiction-${addiction.key}`}
                                style={{ fontSize: '13px' }}
                              >
                                {addiction.label}
                              </label>
                            </div>
                          ))}
                        </div>
                        {(personalHistoryForm.addictions?.smoker || personalHistoryForm.addictions?.alcoholic) && (
                          <div className="mt-2">
                            <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Addiction Details</label>
                            <textarea
                              className="form-control"
                              rows="2"
                              value={personalHistoryForm.addictions?.details || ''}
                              onChange={e => handleAddictionChange('details', e.target.value)}
                              style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                              placeholder="Enter details about smoking/alcohol consumption"
                            />
                          </div>
                        )}
                      </div>

                      <div className="col-md-12">
                        <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Other Addictions</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          value={personalHistoryForm.otherAddictions || ''}
                          onChange={e => handlePersonalHistoryInputChange('otherAddictions', e.target.value)}
                          style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                          placeholder="Specify other addictions"
                        />
                      </div>
                    </div>

                    <div className="d-flex justify-content-end gap-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                      <button
                        type="button"
                        onClick={goToPreviousHistoryTab}
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
                        onClick={() => goToNextHistoryTab()}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </form>
              )}
              {activeHistoryTab === 'Mental' && (
                <form>
                  <div className="mb-4">
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="anxiety" checked={mentalHistoryForm.anxiety} onChange={e => handleMentalHistoryChange('anxiety', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="anxiety">Anxiety</label>
                        </div>
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="depressiveThoughts" checked={mentalHistoryForm.depressiveThoughts} onChange={e => handleMentalHistoryChange('depressiveThoughts', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="depressiveThoughts">Depressive thoughts</label>
                        </div>
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="obsession" checked={mentalHistoryForm.obsession} onChange={e => handleMentalHistoryChange('obsession', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="obsession">Obsession</label>
                        </div>
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="cryingSpells" checked={mentalHistoryForm.cryingSpells} onChange={e => handleMentalHistoryChange('cryingSpells', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="cryingSpells">Crying spells</label>
                        </div>
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="moodChanges" checked={mentalHistoryForm.moodChanges} onChange={e => handleMentalHistoryChange('moodChanges', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="moodChanges">Mood changes</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="shortTemperedness" checked={mentalHistoryForm.shortTemperedness} onChange={e => handleMentalHistoryChange('shortTemperedness', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="shortTemperedness">Short temperedness</label>
                        </div>
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="hysterical" checked={mentalHistoryForm.hysterical} onChange={e => handleMentalHistoryChange('hysterical', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="hysterical">Hysterical</label>
                        </div>
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="violent" checked={mentalHistoryForm.violent} onChange={e => handleMentalHistoryChange('violent', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="violent">Violent</label>
                        </div>
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="maniacalDisorders" checked={mentalHistoryForm.maniacalDisorders} onChange={e => handleMentalHistoryChange('maniacalDisorders', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="maniacalDisorders">Maniacal disorders</label>
                        </div>
                        <div className="form-check mb-2">
                          <input className="form-check-input" type="checkbox" id="schizophrenia" checked={mentalHistoryForm.schizophrenia} onChange={e => handleMentalHistoryChange('schizophrenia', e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="schizophrenia">Schizophrenia</label>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Other mentals</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={mentalHistoryForm.otherMentals}
                        onChange={e => handleMentalHistoryChange('otherMentals', e.target.value)}
                        style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                        placeholder="Specify other mental conditions"
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                    <button
                      type="button"
                      onClick={goToPreviousHistoryTab}
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
                      onClick={() => goToNextHistoryTab()}
                    >
                      Next
                    </button>
                  </div>
                </form>
              )}
              {activeHistoryTab === 'Past' && (
                <form>
                  <div className="mb-4">
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Major illness suffered</label>
                          <input type="text" className="form-control" value={pastHistoryForm.majorIllness} onChange={e => handlePastHistoryChange('majorIllness', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Current chronic illness</label>
                          <input type="text" className="form-control" value={pastHistoryForm.chronicIllness} onChange={e => handlePastHistoryChange('chronicIllness', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Investigations carried out</label>
                          <input type="text" className="form-control" value={pastHistoryForm.investigations} onChange={e => handlePastHistoryChange('investigations', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Surgical history</label>
                          <input type="text" className="form-control" value={pastHistoryForm.surgicalHistory} onChange={e => handlePastHistoryChange('surgicalHistory', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Developmental / Neonatal history</label>
                          <input type="text" className="form-control" value={pastHistoryForm.developmentalHistory} onChange={e => handlePastHistoryChange('developmentalHistory', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Obst /Gyn. history in case of a female</label>
                          <input type="text" className="form-control" value={pastHistoryForm.obstGynHistory} onChange={e => handlePastHistoryChange('obstGynHistory', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Current treatment</label>
                          <input type="text" className="form-control" value={pastHistoryForm.currentTreatment} onChange={e => handlePastHistoryChange('currentTreatment', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                    <button
                      type="button"
                      onClick={goToPreviousHistoryTab}
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
                      onClick={() => goToNextHistoryTab()}
                    >
                      Next
                    </button>
                  </div>
                </form>
              )}
              {activeHistoryTab === 'Family' && (
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
                          {illnessList.map(illness => (
                            <tr key={illness}>
                              <td>{illness}</td>
                              {familyMembers.map(member => (
                                <td key={member} style={{ textAlign: 'center' }}>
                                  <input
                                    type="checkbox"
                                    checked={!!familyHistoryForm.illnesses[illness][member]}
                                    onChange={e => handleFamilyHistoryCheckbox(illness, member, e.target.checked)}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Any other family history</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={familyHistoryForm.other}
                        onChange={e => handleFamilyHistoryOther(e.target.value)}
                        style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                    <button
                      type="button"
                      onClick={goToPreviousHistoryTab}
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
                      onClick={() => goToNextHistoryTab()}
                    >
                      Next
                    </button>
                  </div>
                </form>
              )}
              {activeHistoryTab === 'Environmental' && (
                <form>
                  <div className="mb-4">
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Duration of stay in current home</label>
                          <input type="text" className="form-control" value={environmentalHistoryForm.durationOfStay} onChange={e => handleEnvironmentalHistoryChange('durationOfStay', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Commercial place nearby</label>
                          <input type="text" className="form-control" value={environmentalHistoryForm.commercialPlace} onChange={e => handleEnvironmentalHistoryChange('commercialPlace', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Pets (Indoor / Outdoor)</label>
                          <input type="text" className="form-control" value={environmentalHistoryForm.pets} onChange={e => handleEnvironmentalHistoryChange('pets', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Pillow type</label>
                          <input type="text" className="form-control" value={environmentalHistoryForm.pillowType} onChange={e => handleEnvironmentalHistoryChange('pillowType', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Mattress type</label>
                          <input type="text" className="form-control" value={environmentalHistoryForm.mattressType} onChange={e => handleEnvironmentalHistoryChange('mattressType', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Carpet type</label>
                          <input type="text" className="form-control" value={environmentalHistoryForm.carpetType} onChange={e => handleEnvironmentalHistoryChange('carpetType', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Draperies type</label>
                          <input type="text" className="form-control" value={environmentalHistoryForm.draperiesType} onChange={e => handleEnvironmentalHistoryChange('draperiesType', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Blanket type</label>
                          <input type="text" className="form-control" value={environmentalHistoryForm.blanketType} onChange={e => handleEnvironmentalHistoryChange('blanketType', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Indoor type</label>
                          <input type="text" className="form-control" value={environmentalHistoryForm.indoorType} onChange={e => handleEnvironmentalHistoryChange('indoorType', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Stuffed toys in bedrooms</label>
                          <input type="text" className="form-control" value={environmentalHistoryForm.stuffedToys} onChange={e => handleEnvironmentalHistoryChange('stuffedToys', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3 d-flex align-items-center">
                          <input
                            className="form-check-input me-2"
                            type="checkbox"
                            id="usingAC"
                            checked={environmentalHistoryForm.usingAC}
                            onChange={e => handleEnvironmentalHistoryChange('usingAC', e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="usingAC" style={{ fontSize: '13px' }}>Using Air-conditioner</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Occupational Hazards</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={environmentalHistoryForm.occupationalHazards || ''}
                      onChange={e => handleEnvironmentalHistoryChange('occupationalHazards', e.target.value)}
                      style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                      placeholder="Specify any occupational hazards"
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                    <button
                      type="button"
                      onClick={goToPreviousHistoryTab}
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
                      onClick={() => goToNextHistoryTab()}
                    >
                      Next
                    </button>
                  </div>
                </form>
              )}
              {activeHistoryTab === 'Allergy' && (
                <form>
                  <div className="mb-4">
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Previous allergy tests (including when)</label>
                          <input type="text" className="form-control" value={allergyHistoryForm.previousTests} onChange={e => handleAllergyHistoryChange('previousTests', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Tests if done, by whom the tests were conducted</label>
                          <input type="text" className="form-control" value={allergyHistoryForm.testsByWhom} onChange={e => handleAllergyHistoryChange('testsByWhom', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Any injections started. If yes, when</label>
                          <input type="text" className="form-control" value={allergyHistoryForm.injectionsStarted} onChange={e => handleAllergyHistoryChange('injectionsStarted', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Continued injections how long</label>
                          <input type="text" className="form-control" value={allergyHistoryForm.continuedInjections} onChange={e => handleAllergyHistoryChange('continuedInjections', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Any results</label>
                          <input type="text" className="form-control" value={allergyHistoryForm.anyResults} onChange={e => handleAllergyHistoryChange('anyResults', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Drug allergies (including drug name and reaction type)</label>
                          <input type="text" className="form-control" value={allergyHistoryForm.drugAllergies} onChange={e => handleAllergyHistoryChange('drugAllergies', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Known food allergies</label>
                          <input type="text" className="form-control" value={allergyHistoryForm.foodAllergies} onChange={e => handleAllergyHistoryChange('foodAllergies', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>Contact allergy</label>
                          <input type="text" className="form-control" value={allergyHistoryForm.contactAllergy} onChange={e => handleAllergyHistoryChange('contactAllergy', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                    <button
                      type="button"
                      onClick={goToPreviousHistoryTab}
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
                      onClick={() => goToNextHistoryTab()}
                    >
                      Next
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {showConditionHistoryForm && (
          <div style={{ padding: '2px' }}>
            {/* Tabs */}
            <div style={{ background: '#f8fafc', borderRadius: '12px 12px 0 0' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0 16px' }}>
                {conditionTabs.slice(0, 5).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveConditionTab(tab)}
                    style={{
                      flex: 1,
                      padding: '16px 0',
                      background: activeConditionTab === tab ? '#fff' : 'transparent',
                      border: 'none',
                      borderBottom: activeConditionTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                      color: activeConditionTab === tab ? '#2563eb' : '#6b7280',
                      fontWeight: activeConditionTab === tab ? 600 : 500,
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
                    {activeConditionTab === tab && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: '#2563eb', transition: 'all 0.2s' }} />
                    )}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', padding: '0 16px' }}>
                {conditionTabs.slice(5).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveConditionTab(tab)}
                    style={{
                      flex: 1,
                      padding: '16px 0',
                      background: activeConditionTab === tab ? '#fff' : 'transparent',
                      border: 'none',
                      borderBottom: activeConditionTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                      color: activeConditionTab === tab ? '#2563eb' : '#6b7280',
                      fontWeight: activeConditionTab === tab ? 600 : 500,
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
                    {activeConditionTab === tab && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: '#2563eb', transition: 'all 0.2s' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div style={{ padding: '32px' }}>
              {renderConditionTab()}

              <div className="d-flex justify-content-end gap-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                <button
                  type="button"
                  onClick={handleConditionBack}
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
                  onClick={goToNextConditionTab}
                  disabled={isSubmitting}
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
                  {isSubmitting ? 'Saving...' : conditionTabs.indexOf(activeConditionTab) === conditionTabs.length - 1 ? 'Submit' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddPatient; 