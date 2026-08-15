import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, ChevronDown } from 'lucide-react';
import { getModesOfIntake, addModeOfIntake, deleteModeOfIntake } from '../../utils/modeOfIntakeApi';
import { translateText, localizeDigits } from '../../utils/translationUtils';
import Modal from 'react-modal';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { handleNumberInput } from '../../utils/inputUtils';

const LANGUAGE_OPTIONS = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'gujarati', label: 'Gujarati' },
    { value: 'marathi', label: 'Marathi' },
];

// Map UI language to Google Translate code
const langMap = {
    english: 'en',
    hindi: 'hi',
    gujarati: 'gu',
    marathi: 'mr',
};

function Prescription({ initialPatient, onClose, prescriptionToEdit }) {
    const [showModal, setShowModal] = useState(true);
    const [medicines, setMedicines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [selectedMedicine, setSelectedMedicine] = useState({
        medicineName: '',
        dosage: '',
        quantity: '',
        duration: '',
        timings: {
            morning: false,
            afternoon: false,
            evening: false,
            night: false
        },
        instructions: {
            beforeFood: false,
            afterFood: false,
            withFood: false,
            other: ''
        },
        isBelow: false
    });
    const [modeOfIntakeOptions, setModeOfIntakeOptions] = useState([]);
    const [newModeOfIntake, setNewModeOfIntake] = useState('');
    const [printLanguage, setPrintLanguage] = useState('english');
    const [translatedMedicines, setTranslatedMedicines] = useState([]);
    const [translatedMedicineDisplay, setTranslatedMedicineDisplay] = useState([]);
    const [translating, setTranslating] = useState(false);
    const navigate = useNavigate();
    const { patientId } = useParams();
    const [paperSize, setPaperSize] = useState('A4');
    const [useOwnLetterhead, setUseOwnLetterhead] = useState(false);
    
    // Custom dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        let timeoutId;
        if (error) {
            timeoutId = setTimeout(() => {
                setError(null);
            }, 5000); // 5 seconds
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [error]);

    useEffect(() => {
        let timeoutId;
        if (successMessage) {
            timeoutId = setTimeout(() => {
                setSuccessMessage(null);
            }, 3000); // 3 seconds
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [successMessage]);

    const [prescriptionForm, setPrescriptionForm] = useState({
        patientId: initialPatient?._id || '',
        patientName: initialPatient?.basicInfo?.name || '',
        prescriptionDate: prescriptionToEdit?.prescriptionDate
            ? new Date(prescriptionToEdit.prescriptionDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        followUp: prescriptionToEdit?.followUp || {
            duration: '',
            unit: 'days'
        },
        selectedMedicines: prescriptionToEdit?.medicines || [],
        medicines: [],
        additionalNotes: prescriptionToEdit?.additionalNotes || '',
        doctorRemarks: prescriptionToEdit?.doctorRemarks || '',
        selectedDoctor: 'DR. VIPUL SHAH',
        commonBelowInstruction: prescriptionToEdit?.commonBelowInstruction || ''
    });
    // Fetch medicines from API
    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/medicine`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch medicines');
                }

                const data = await response.json();
                setMedicines(data.data || []); // API returns { success: true, data: [...] }

            } catch (error) {
                console.error('Fetch error:', error);
                setError('Failed to load medicines. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMedicines();
    }, []);

    // Fetch mode of intake options
    useEffect(() => {
        async function fetchModes() {
            try {
                const modes = await getModesOfIntake();
                setModeOfIntakeOptions(modes);
            } catch (e) {
                setModeOfIntakeOptions([]);
            }
        }
        fetchModes();
    }, []);

    // Add effect to monitor state changes
    // useEffect(() => {
    //     console.log('Current state:', {
    //         isLoading,
    //         error,
    //         medicinesCount: medicines.length,
    //         medicines
    //     });
    // }, [isLoading, error, medicines]);

    const handleMedicineChange = (field, value) => {
        // console.log('Handling medicine change:', field, value);
        if (field === 'frequency') {
            // Ensure frequency is stored as a number
            setSelectedMedicine(prev => ({
                ...prev,
                [field]: parseInt(value)
            }));
        } else {
            setSelectedMedicine(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleAddMedicine = () => {
        // Validations
        if (!selectedMedicine.medicineName) {
            setError('Please select a medicine');
            return;
        }
        if (!selectedMedicine.dosage) {
            setError('Please select dosage');
            return;
        }
        if (!selectedMedicine.duration) {
            setError('Please specify duration');
            return;
        }
        if (parseInt(selectedMedicine.duration) <= 0) {
            setError('Duration must be greater than 0');
            return;
        }

        // Check if at least one timing is selected or custom timing provided
        const hasSelectedTiming = Object.values(selectedMedicine.timings).some(timing => timing);
        if (!hasSelectedTiming && !selectedMedicine.instructions.other.trim()) {
            setError('Please select at least one timing or provide medicine instruction');
            return;
        }

        // Remove instruction validation (make optional)
        // If all validations pass
        setError(null);
        setPrescriptionForm(prev => ({
            ...prev,
            selectedMedicines: [...prev.selectedMedicines, {
                name: selectedMedicine.medicineName,
                dosage: selectedMedicine.dosage,
                quantity: selectedMedicine.quantity || '',
                duration: selectedMedicine.duration,
                timings: selectedMedicine.timings,
                instructions: selectedMedicine.instructions,
                isBelow: selectedMedicine.isBelow
            }]
        }));

        // Reset selected medicine after successful addition
        setSelectedMedicine({
            medicineName: '',
            dosage: '',
            quantity: '',
            duration: '',
            timings: {
                morning: false,
                afternoon: false,
                evening: false,
                night: false
            },
            instructions: {
                beforeFood: false,
                afterFood: false,
                withFood: false,
                other: ''
            },
            isBelow: false
        });
    };
    const handleRemoveMedicine = (index) => {
        setPrescriptionForm(prev => ({
            ...prev,
            selectedMedicines: prev.selectedMedicines.filter((_, i) => i !== index)
        }));
    };

    const handleDeleteModeOfIntake = async (modeToDelete, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!window.confirm(`Are you sure you want to delete "${modeToDelete}"?`)) return;
        
        try {
            await deleteModeOfIntake(modeToDelete);
            setModeOfIntakeOptions(prev => prev.filter(m => m !== modeToDelete));
            if (selectedMedicine.dosage === modeToDelete) {
                setSelectedMedicine(prev => ({ ...prev, dosage: '' }));
            }
            setSuccessMessage(`Mode of intake "${modeToDelete}" deleted successfully`);
        } catch (err) {
            setError(err.message || 'Failed to delete mode of intake');
        }
    };

    // Update prescribingTo if initialPatient changes
    useEffect(() => {
        if (initialPatient?.basicInfo?.name) {
            setPrescriptionForm(form => ({
                ...form,
                prescribingTo: initialPatient.basicInfo.name
            }));
        }
    }, [initialPatient]);

    // Update the followUp state handling
    const handleInputChange = (field, value) => {
        if (field === 'followUpDays') {
            setPrescriptionForm(prev => ({
                ...prev,
                followUp: {
                    ...prev.followUp,
                    duration: value
                }
            }));
        } else if (field === 'followUpUnit') {
            setPrescriptionForm(prev => ({
                ...prev,
                followUp: {
                    ...prev.followUp,
                    unit: value
                }
            }));
        } else {
            setPrescriptionForm(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };
    // Update handleSubmit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Additional validations
            if (!prescriptionForm.prescriptionDate) {
                throw new Error('Please select prescription date');
            }

            if (!prescriptionForm.followUp.duration) {
                throw new Error('Please specify follow-up duration');
            }

            if (parseInt(prescriptionForm.followUp.duration) <= 0) {
                throw new Error('Follow-up duration must be greater than 0');
            }

            // Validate selected medicines
            if (prescriptionForm.selectedMedicines.length <= 0) {
                throw new Error('Please add at least one medicine');
            }

            // Validate each medicine
            prescriptionForm.selectedMedicines.forEach((medicine, index) => {
                if (!medicine.duration) {
                    throw new Error(`Please specify duration for ${medicine.name}`);
                }
                if (!Object.values(medicine.timings).some(timing => timing) && (!medicine.instructions || !medicine.instructions.other || !medicine.instructions.other.trim())) {
                    throw new Error(`Please select at least one timing or provide medicine instruction for ${medicine.name}`);
                }
            });
            // Format the data according to the schema
            const prescriptionData = {
                patientId: initialPatient._id,
                patientName: initialPatient.basicInfo.name,
                prescriptionDate: prescriptionForm.prescriptionDate || new Date().toISOString().split('T')[0],
                followUp: {
                    duration: parseInt(prescriptionForm.followUp.duration) || 0,
                    unit: prescriptionForm.followUp.unit || 'days'
                },
                medicines: prescriptionForm.selectedMedicines.map(med => ({
                    medicineName: med.name || med.medicineName || '',
                    dosage: med.dosage,
                    quantity: med.quantity || '',
                    duration: parseInt(med.duration) || 0,
                    timings: {
                        morning: med.timings.morning || false,
                        afternoon: med.timings.afternoon || false,
                        evening: med.timings.evening || false,
                        night: med.timings.night || false
                    },
                    instructions: {
                        beforeFood: med.instructions.beforeFood || false,
                        afterFood: med.instructions.afterFood || false,
                        withFood: med.instructions.withFood || false,
                        other: med.instructions.other || ''
                    },
                    isBelow: med.isBelow || false
                })),
                additionalNotes: prescriptionForm.additionalNotes || '',
                doctorRemarks: prescriptionForm.doctorRemarks || '',
                commonBelowInstruction: prescriptionForm.commonBelowInstruction || '',
                printLanguage,
                selectedDoctor: prescriptionForm.selectedDoctor,
                paperSize,
                useOwnLetterhead
            };

            // Validate required fields
            if (!prescriptionData.patientId) {
                throw new Error('Patient information is required');
            }

            if (!prescriptionData.medicines || prescriptionData.medicines.length === 0) {
                throw new Error('At least one medicine is required');
            }

            const url = prescriptionToEdit?._id
                ? `${process.env.REACT_APP_CLIENT_BASE_URL}/api/prescriptions/${prescriptionToEdit._id}`
                : `${process.env.REACT_APP_CLIENT_BASE_URL}/api/prescriptions`;

            const method = prescriptionToEdit?._id ? 'PATCH' : 'POST';

            const response = await apiFetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(prescriptionData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to ${prescriptionToEdit ? 'update' : 'create'} prescription`);
            }

            const savedPrescription = await response.json();
            // console.log(`Prescription ${prescriptionToEdit ? 'updated' : 'saved'}:`, savedPrescription);

            // Show success message
            setSuccessMessage(`Prescription ${prescriptionToEdit ? 'updated' : 'created'} successfully!`);

            // Close modal after a short delay
            setTimeout(() => {
                if (onClose) {
                    onClose(savedPrescription);
                }
            }, 1500);

        } catch (error) {
            console.error('Error saving prescription:', error);
            setError(error.message || 'Failed to save prescription. Please try again.');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        if (onClose) onClose();
    };

    // Sync form state with prescriptionToEdit and initialPatient
    useEffect(() => {
        if (prescriptionToEdit) {
            setPaperSize(prescriptionToEdit.paperSize || 'A4');
            setUseOwnLetterhead(prescriptionToEdit.useOwnLetterhead !== undefined ? prescriptionToEdit.useOwnLetterhead : false);
            setPrescriptionForm({
                patientId: initialPatient?._id || '',
                patientName: initialPatient?.basicInfo?.name || '',
                prescriptionDate: prescriptionToEdit.prescriptionDate
                    ? new Date(prescriptionToEdit.prescriptionDate).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0],
                followUp: prescriptionToEdit.followUp || { duration: '', unit: 'days' },
                selectedMedicines: (prescriptionToEdit.medicines || []).map(med => ({
                    ...med,
                    name: med.name || med.medicineName || ''
                })),
                medicines: [],
                additionalNotes: prescriptionToEdit.additionalNotes || '',
                doctorRemarks: prescriptionToEdit.doctorRemarks || '',
                selectedDoctor: prescriptionToEdit.selectedDoctor || 'DR. VIPUL SHAH',
                commonBelowInstruction: prescriptionToEdit.commonBelowInstruction || ''
            });
        }
    }, [prescriptionToEdit, initialPatient]);

    const handleAddModeOfIntake = async () => {
        if (!newModeOfIntake.trim()) return;
        if (modeOfIntakeOptions.includes(newModeOfIntake.trim())) return;
        // Add to local state
        setModeOfIntakeOptions(prev => [...prev, newModeOfIntake.trim()]);
        // Do NOT auto-select the new mode
        setNewModeOfIntake('');
        await addModeOfIntake(newModeOfIntake.trim());
    };

    // Helper to get timing labels in selected language
    const getTimingLabelsTranslated = async (med, lang) => {
        if (med.instructions && med.instructions.other && med.instructions.other.trim()) {
            return lang === 'en' ? med.instructions.other : await translateText(med.instructions.other, lang);
        }
        const timings = med.timings;
        const labels = [];
        if (timings.morning) labels.push(lang === 'en' ? 'Morning' : await translateText('Morning', lang));
        if (timings.afternoon) labels.push(lang === 'en' ? 'Afternoon' : await translateText('Afternoon', lang));
        if (timings.evening) labels.push(lang === 'en' ? 'Evening' : await translateText('Evening', lang));
        if (timings.night) labels.push(lang === 'en' ? 'Night' : await translateText('Night', lang));
        return labels.length ? labels.join(', ') : (lang === 'en' ? 'None' : await translateText('None', lang));
    };

    // Translate selected medicines for print preview
    useEffect(() => {
        async function translateForDisplay() {
            if (!prescriptionForm.selectedMedicines.length) {
                setTranslatedMedicineDisplay([]);
                setTranslating(false);
                return;
            }
            setTranslating(true);
            const translated = await Promise.all(
                prescriptionForm.selectedMedicines.map(async (med) => {
                    const langCode = langMap[printLanguage] || 'en';
                    // Medicine name always in English
                    const dosage = printLanguage === 'english' ? med.dosage : await translateText(med.dosage, langCode);
                    const quantity = printLanguage === 'english' ? med.quantity : (med.quantity ? await translateText(med.quantity.toString(), langCode) : '');
                    const duration = printLanguage === 'english' ? med.duration : await translateText(med.duration.toString(), langCode);
                    // Always set timingLabels for English
                    let timingLabels;
                    if (printLanguage === 'english') {
                        timingLabels = getTimingLabels(med);
                    } else {
                        timingLabels = await getTimingLabelsTranslated(med, langCode);
                    }
                    // Instructions: translate each instruction if not empty
                    const instructions = { ...med.instructions };
                    for (const key of Object.keys(instructions)) {
                        if (key !== 'other' && instructions[key]) {
                            instructions[key] = printLanguage === 'english' ? key.replace(/([A-Z])/g, ' $1').trim() : await translateText(key.replace(/([A-Z])/g, ' $1').trim(), langCode);
                        } else if (key === 'other' && instructions[key]) {
                            instructions[key] = printLanguage === 'english' ? instructions[key] : await translateText(instructions[key], langCode);
                        }
                    }
                    return {
                        ...med,
                        dosage,
                        quantity,
                        duration,
                        timingLabels,
                        instructions,
                    };
                })
            );
            setTranslatedMedicineDisplay(translated);
            setTranslating(false);
        }
        translateForDisplay();
        // eslint-disable-next-line
    }, [prescriptionForm.selectedMedicines, printLanguage]);

    // Fallback getTimingLabels for English
    const getTimingLabels = (med) => {
        if (med.instructions && med.instructions.other && med.instructions.other.trim()) {
            return med.instructions.other;
        }
        const timings = med.timings;
        const labels = [];
        if (timings.morning) labels.push('Morning');
        if (timings.afternoon) labels.push('Afternoon');
        if (timings.evening) labels.push('Evening');
        if (timings.night) labels.push('Night');
        return labels.length ? labels.join(', ') : 'None';
    };

    if (!showModal) return null;

    return (
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

            {error && (
                <div
                    role="alert"
                    style={{
                        position: 'fixed',
                        top: 32,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 2000,
                        minWidth: 320,
                        maxWidth: 420,
                        width: '90vw',
                        background: '#fff1f2',
                        color: '#b91c1c',
                        borderLeft: '6px solid #ef4444',
                        borderRadius: 12,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: '20px 24px 20px 20px',
                        fontWeight: 500,
                        animation: 'slideDown 0.4s cubic-bezier(.4,2,.6,1)'
                    }}
                >
                    <span style={{ fontSize: 32, marginRight: 18, marginTop: 2 }}>❗</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 2 }}>Error</div>
                        <div style={{ fontSize: 15 }}>{error}</div>
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={() => setError(null)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#b91c1c',
                            fontSize: 22,
                            fontWeight: 700,
                            marginLeft: 12,
                            cursor: 'pointer',
                            lineHeight: 1
                        }}
                    >×</button>
                </div>
            )}

            {successMessage && (
                <div
                    role="alert"
                    style={{
                        position: 'fixed',
                        top: 32,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 2000,
                        minWidth: 320,
                        maxWidth: 420,
                        width: '90vw',
                        background: '#f0fdf4',
                        color: '#166534',
                        borderLeft: '6px solid #22c55e',
                        borderRadius: 12,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: '20px 24px 20px 20px',
                        fontWeight: 500,
                        animation: 'slideDown 0.4s cubic-bezier(.4,2,.6,1)'
                    }}
                >
                    <span style={{ fontSize: 32, marginRight: 18, marginTop: 2 }}>✔️</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 2 }}>Success</div>
                        <div style={{ fontSize: 15 }}>{successMessage}</div>
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={() => setSuccessMessage(null)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#166534',
                            fontSize: 22,
                            fontWeight: 700,
                            marginLeft: 12,
                            cursor: 'pointer',
                            lineHeight: 1
                        }}
                    >×</button>
                </div>
            )}

            <style>
                {`
        @keyframes slideDown {
            from { opacity: 0; transform: translate(-50%, -40px); }
            to { opacity: 1; transform: translate(-50%, 0); }
        }
    `}
            </style>
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                    width: 'calc(100% - 64px)',
                    maxWidth: '1200px',
                    margin: '20px',
                    maxHeight: '90vh',
                    overflow: 'auto'
                }}
            >
                <div
                    style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px 12px 0 0'
                    }}
                >
                    <h5 className="mb-0" style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1e293b'
                    }}>{prescriptionToEdit ? 'Edit Prescription' : 'Create Prescription'}</h5>
                    <button
                        onClick={closeModal}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: '#64748b',
                            transition: 'all 0.2s ease-in-out'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f1f5f9';
                            e.target.style.color = '#475569';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#64748b';
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '24px' }}>
                    <div className="row" style={{ margin: '0 -12px' }}>
                        {/* Left side - Patient Info */}
                        <div className="col-md-8" style={{ padding: '0 12px' }}>
                            <div className="card shadow-sm" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                                <div className="card-body" style={{ padding: '24px' }}>
                                    <h6 style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#1e293b',
                                        marginBottom: '20px',
                                        borderBottom: '1px solid #e2e8f0',
                                        paddingBottom: '12px'
                                    }}>Patient Information</h6>

                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <label className="form-label" style={{
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                color: '#475569',
                                                marginBottom: '8px'
                                            }}>Prescribing to:</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={prescriptionForm.prescribingTo || initialPatient?.basicInfo?.name || prescriptionToEdit?.patientName || ''}
                                                readOnly
                                                style={{
                                                    borderRadius: '6px',
                                                    border: '1px solid #cbd5e1',
                                                    padding: '10px 14px',
                                                    fontSize: '14px',
                                                    backgroundColor: '#f8fafc',
                                                    color: '#1e293b',
                                                    cursor: 'default'
                                                }}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label" style={{
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                color: '#475569',
                                                marginBottom: '8px'
                                            }}>Date:</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={prescriptionForm.prescriptionDate}
                                                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, prescriptionDate: e.target.value }))}
                                                style={{
                                                    borderRadius: '6px',
                                                    border: '1px solid #cbd5e1',
                                                    padding: '10px 14px',
                                                    fontSize: '14px',
                                                    backgroundColor: '#ffffff',
                                                    color: '#1e293b'
                                                }}
                                            />
                                        </div>
                                    </div>


                                    <div className="card shadow-sm" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', margin: '10px'}}>
                                        <div className="card-body" style={{ padding: '24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                                <h6 style={{
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    color: '#1e293b',
                                                    margin: 0
                                                }}>Selected Medicines</h6>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                                                    <span style={{ fontSize: 14, color: '#475569', marginRight: 10, fontWeight: 600 }}>Print Language:</span>
                                                    <select
                                                        id="print-language-select"
                                                        className="form-select"
                                                        style={{ maxWidth: 140, minWidth: 100, fontSize: 14, padding: '4px 8px', height: 32, display: 'inline-block' }}
                                                        value={printLanguage}
                                                        onChange={e => setPrintLanguage(e.target.value)}
                                                    >
                                                        {LANGUAGE_OPTIONS.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {prescriptionForm.selectedMedicines?.length === 0 ? (
                                                <p style={{
                                                    fontSize: '14px',
                                                    color: '#64748b',
                                                    marginBottom: '0',
                                                    textAlign: 'center',
                                                    padding: '24px 0'
                                                }}>No medicines selected</p>
                                            ) : (
                                                <div className="selected-medicines">
                                                    {translating ? (
                                                        <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>Translating...</div>
                                                    ) : (
                                                        (printLanguage === 'english' ? prescriptionForm.selectedMedicines : translatedMedicineDisplay).map((medicine, index) => {
                                                            const timingLabels = printLanguage === 'english'
                                                                ? getTimingLabels(medicine)
                                                                : medicine.timingLabels;
                                                            // Localize dosage, quantity, duration for display
                                                            const displayDosage = printLanguage === 'english' ? medicine.dosage : localizeDigits(medicine.dosage, printLanguage);
                                                            const displayQuantity = printLanguage === 'english' ? medicine.quantity : (medicine.quantity ? localizeDigits(medicine.quantity, printLanguage) : '');
                                                            const displayDuration = printLanguage === 'english' ? medicine.duration : (medicine.duration ? localizeDigits(medicine.duration, printLanguage) : '');
                                                            return (
                                                                <div
                                                                    key={index}
                                                                    className="selected-medicine p-3 mb-2"
                                                                    style={{ backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}
                                                                >
                                                                    <div className="d-flex justify-content-between align-items-center">
                                                                        <div>
                                                                            <strong style={{ color: '#1e293b', fontSize: '14px', display: 'block', marginBottom: '4px' }}>{medicine.name}</strong>
                                                                            <div style={{ color: '#64748b', fontSize: '13px' }}>
                                                                                {displayDosage}
                                                                                {displayQuantity && (
                                                                                    <span style={{ fontWeight: 500, marginLeft: 8 }}>| Qty: {displayQuantity}</span>
                                                                                )}
                                                                                {displayDuration && (
                                                                                    <span style={{ fontWeight: 500, marginLeft: 8 }}>| {displayDuration} Days</span>
                                                                                )}
                                                                                {timingLabels && (
                                                                                    <span style={{ fontWeight: 500, marginLeft: 8 }}>| {timingLabels}</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-link text-danger p-1"
                                                                            onClick={() => handleRemoveMedicine(index)}
                                                                            style={{ minWidth: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h6 style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#475569',
                                            marginBottom: '16px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>Common Instruction</h6>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            value={prescriptionForm.commonBelowInstruction}
                                            onChange={(e) => handleInputChange('commonBelowInstruction', e.target.value)}
                                            placeholder="Enter Common Instructions"
                                            style={{
                                                borderRadius: '6px',
                                                border: '1px solid #cbd5e1',
                                                padding: '10px 14px',
                                                fontSize: '14px',
                                                backgroundColor: '#ffffff',
                                                color: '#1e293b'
                                            }}
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <h6 style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#475569',
                                            marginBottom: '16px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>Follow-up</h6>
                                        <div className="d-flex align-items-center gap-3">
                                            <label className="form-label mb-0" style={{
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                color: '#475569',
                                                whiteSpace: 'nowrap'
                                            }}>Follow up after</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={prescriptionForm.followUp.duration}
                                                onChange={(e) => handleInputChange('followUpDays', e.target.value)}
                                                min="1"
                                                onKeyDown={handleNumberInput}
                                                required
                                                style={{
                                                    borderRadius: '6px',
                                                    border: '1px solid #cbd5e1',
                                                    padding: '10px 14px',
                                                    fontSize: '14px',
                                                    backgroundColor: '#ffffff',
                                                    color: '#1e293b',
                                                    maxWidth: '100px'
                                                }}
                                            />
                                            <select
                                                className="form-select"
                                                value={prescriptionForm.followUp.unit}
                                                onChange={(e) => handleInputChange('followUpUnit', e.target.value)}
                                                style={{
                                                    borderRadius: '6px',
                                                    border: '1px solid #cbd5e1',
                                                    padding: '10px 14px',
                                                    fontSize: '14px',
                                                    backgroundColor: '#ffffff',
                                                    color: '#1e293b',
                                                    maxWidth: '120px'
                                                }}
                                            >
                                                <option value="days">Day(s)</option>
                                                <option value="weeks">Week(s)</option>
                                                <option value="months">Month(s)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-3" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                        <label style={{ fontWeight: 500, fontSize: 14, marginRight: 8 }}>Sign by:</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={prescriptionForm.selectedDoctor === 'DR. VIPUL SHAH'}
                                                    onChange={() => setPrescriptionForm(prev => ({ ...prev, selectedDoctor: 'DR. VIPUL SHAH' }))}
                                                    style={{ marginRight: 4 }}
                                                />
                                                DR. VIPUL SHAH
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={prescriptionForm.selectedDoctor === 'DR. ESHITA V. SHAH'}
                                                    onChange={() => setPrescriptionForm(prev => ({ ...prev, selectedDoctor: 'DR. ESHITA V. SHAH' }))}
                                                    style={{ marginRight: 4 }}
                                                />
                                                DR. ESHITA V. SHAH
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex justify-content-left gap-3">
                                <div className="d-flex align-items-center gap-3" style={{ marginRight: 12, marginLeft: 12 }}>
                                    <label htmlFor="paper-size-select" style={{ fontSize: 14, marginRight: 6, width: 100 }}>Paper Size:</label>
                                    <select
                                        id="paper-size-select"
                                        className="form-select"
                                        style={{ maxWidth: 80, fontSize: 14, padding: '4px 8px', height: 32, display: 'inline-block' }}
                                        value={paperSize}
                                        onChange={e => setPaperSize(e.target.value)}
                                    >
                                        <option value="A4">A4</option>
                                        <option value="Small">Small</option>
                                    </select>
                                    <div className="form-check" style={{ marginLeft: 12 }}>
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="own-letterhead-checkbox"
                                            checked={useOwnLetterhead}
                                            onChange={e => setUseOwnLetterhead(e.target.checked)}
                                            style={{ marginRight: 4 }}
                                        />
                                        <label className="form-check-label" htmlFor="own-letterhead-checkbox" style={{ fontSize: 14, width: 130 }}>
                                            Use own letterhead
                                        </label>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary px-4 py-2"
                                    style={{
                                        borderRadius: '6px',
                                        border: '1px solid #cbd5e1',
                                        color: '#64748b',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease-in-out',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff'
                                    }}
                                    onClick={() => {
                                        // Prepare prescription data for print view
                                        const prescriptionData = {
                                            ...prescriptionForm,
                                            medicines: (printLanguage === 'english' ? prescriptionForm.selectedMedicines : translatedMedicineDisplay).map(med => ({
                                                ...med,
                                                // Ensure medicineName is always in English
                                                medicineName: med.name || med.medicineName || '',
                                                dosage: med.dosage,
                                                timings: med.timings,
                                                instructions: med.instructions,
                                            })),
                                            printLanguage,
                                            paperSize,
                                            useOwnLetterhead,
                                        };
                                        navigate(`/patients/${initialPatient.patientId || patientId}/prescriptions`, {
                                            state: {
                                                printPrescription: prescriptionData,
                                                printLanguage,
                                                printNow: true,
                                                paperSize,
                                                useOwnLetterhead,
                                            },
                                        });
                                    }}
                                >
                                    Print
                                </button>
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    className="btn btn-primary px-4 py-2"
                                    style={{
                                        borderRadius: '6px',
                                        backgroundColor: '#2563eb',
                                        border: 'none',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease-in-out',
                                        fontSize: '14px',
                                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                    }}
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="btn btn-outline-secondary px-4 py-2"
                                    style={{
                                        borderRadius: '6px',
                                        border: '1px solid #cbd5e1',
                                        color: '#64748b',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease-in-out',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff'
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* Right side - Medicine Selection */}
                        <div className="col-md-4" style={{ padding: '0 12px' }}>
                            {/* Medicine Selection Card */}
                            <div className="card shadow-sm" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                                <div className="card-body" style={{ padding: '24px' }}>
                                    <h6 style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#1e293b',
                                        marginBottom: '20px',
                                        borderBottom: '1px solid #e2e8f0',
                                        paddingBottom: '12px'
                                    }}>Medicine Selection</h6>

                                    <div className="mb-4">
                                        <label className="form-label" style={{ fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>Medicine Name</label>
                                        <select
                                            className="form-select"
                                            value={selectedMedicine.medicineName}
                                            onChange={(e) => handleMedicineChange('medicineName', e.target.value)}
                                            disabled={isLoading}
                                        >
                                            <option value="">
                                                {isLoading ? 'Loading medicines...' : 'Select Medicine'}
                                            </option>
                                            {!isLoading && !error && medicines.map(medicine => (
                                                <option key={medicine._id} value={medicine.name}>
                                                    {medicine.name}
                                                </option>
                                            ))}
                                        </select>
                                        {/* Add Mode of Intake field below Medicine Name */}
                                        <div style={{ display: 'flex', marginTop: 8 }}>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Add new mode of intake"
                                                value={newModeOfIntake}
                                                onChange={e => setNewModeOfIntake(e.target.value)}
                                                style={{ marginRight: 8 }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary"
                                                onClick={handleAddModeOfIntake}
                                                disabled={!newModeOfIntake.trim() || modeOfIntakeOptions.includes(newModeOfIntake.trim())}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Mode of Intake Dropdown (replaces Dosage) */}
                                    <div className="mb-4" ref={dropdownRef}>
                                        <label className="form-label" style={{ fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>Mode of Intake</label>
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                type="button"
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                style={{ 
                                                    width: '100%', 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between', 
                                                    alignItems: 'center',
                                                    borderRadius: '6px', 
                                                    border: '1px solid #cbd5e1', 
                                                    padding: '10px 14px', 
                                                    fontSize: '14px', 
                                                    backgroundColor: '#ffffff', 
                                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', 
                                                    color: '#1e293b',
                                                    textAlign: 'left',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <span>{selectedMedicine.dosage || "Select Mode of Intake"}</span>
                                                <ChevronDown size={16} color="#64748b" />
                                            </button>
                                            
                                            {isDropdownOpen && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    right: 0,
                                                    marginTop: '4px',
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '6px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                                    zIndex: 50,
                                                    maxHeight: '250px',
                                                    overflowY: 'auto'
                                                }}>
                                                    <div 
                                                        style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: '14px' }}
                                                        onClick={() => { handleMedicineChange('dosage', ''); setIsDropdownOpen(false); }}
                                                    >
                                                        Select Mode of Intake
                                                    </div>
                                                    {modeOfIntakeOptions.map((mode, idx) => (
                                                        <div key={idx} style={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'space-between', 
                                                            alignItems: 'center', 
                                                            padding: '6px 12px',
                                                            cursor: 'pointer',
                                                            borderBottom: idx === modeOfIntakeOptions.length - 1 ? 'none' : '1px solid #f1f5f9',
                                                            fontSize: '14px'
                                                        }}>
                                                            <div 
                                                                style={{ flex: 1, padding: '4px 0', color: '#334155' }}
                                                                onClick={() => { handleMedicineChange('dosage', mode); setIsDropdownOpen(false); }}
                                                            >
                                                                {mode}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleDeleteModeOfIntake(mode, e)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: '#ef4444',
                                                                    cursor: 'pointer',
                                                                    padding: '4px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    borderRadius: '4px'
                                                                }}
                                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                title="Delete Mode of Intake"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label" style={{ fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>Quantity</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter quantity"
                                            value={selectedMedicine.quantity}
                                            onChange={(e) => handleMedicineChange('quantity', e.target.value)}
                                            style={{
                                                borderRadius: '6px',
                                                border: '1px solid #cbd5e1',
                                                padding: '10px 14px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label">Duration (Days)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={selectedMedicine.duration}
                                            onChange={(e) => handleMedicineChange('duration', e.target.value)}
                                            min="1"
                                            onKeyDown={handleNumberInput}
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label">Timings</label>
                                        <div className="d-flex flex-wrap gap-3">
                                            {Object.keys(selectedMedicine.timings).map(timing => (
                                                <div key={timing} className="form-check" style={{ minWidth: '100px' }}>
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        id={`timing-${timing}`}
                                                        checked={selectedMedicine.timings[timing]}
                                                        disabled={!selectedMedicine.isBelow && !!selectedMedicine.instructions.other.trim()}
                                                        onChange={(e) => handleMedicineChange('timings', {
                                                            ...selectedMedicine.timings,
                                                            [timing]: e.target.checked
                                                        })}
                                                    />
                                                    <label
                                                        className="form-check-label"
                                                        htmlFor={`timing-${timing}`}
                                                        style={{
                                                            fontSize: '14px',
                                                            color: '#475569'
                                                        }}
                                                    >
                                                        {timing.charAt(0).toUpperCase() + timing.slice(1)}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control mt-3"
                                            placeholder="Medicine instruction"
                                            value={selectedMedicine.instructions.other}
                                            disabled={!selectedMedicine.isBelow && Object.values(selectedMedicine.timings).some(t => t)}
                                            onChange={(e) => handleMedicineChange('instructions', {
                                                ...selectedMedicine.instructions,
                                                other: e.target.value
                                            })}
                                            style={{
                                                fontSize: '14px',
                                                padding: '8px 12px'
                                            }}
                                        />
                                        <div className="form-check mt-2">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="instruction-below"
                                                checked={selectedMedicine.isBelow}
                                                onChange={(e) => handleMedicineChange('isBelow', e.target.checked)}
                                            />
                                            <label className="form-check-label" htmlFor="instruction-below" style={{ fontSize: '14px', color: '#475569' }}>
                                                Keep instruction below
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label">Instructions</label>
                                        <div className="d-flex flex-wrap gap-3 mb-2">
                                            {Object.keys(selectedMedicine.instructions)
                                                .filter(key => key !== 'other')
                                                .map(instruction => (
                                                    <div key={instruction} className="form-check" style={{ minWidth: '120px' }}>
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id={`instruction-${instruction}`}
                                                            checked={selectedMedicine.instructions[instruction]}
                                                            onChange={(e) => handleMedicineChange('instructions', {
                                                                ...selectedMedicine.instructions,
                                                                [instruction]: e.target.checked
                                                            })}
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor={`instruction-${instruction}`}
                                                            style={{
                                                                fontSize: '14px',
                                                                color: '#475569'
                                                            }}
                                                        >
                                                            {instruction.replace(/([A-Z])/g, ' $1').trim()}
                                                        </label>
                                                    </div>
                                                ))}
                                        </div>

                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-primary w-100"
                                        onClick={handleAddMedicine}
                                        disabled={!selectedMedicine.medicineName || !selectedMedicine.dosage}
                                        style={{
                                            // ...existing styles
                                        }}
                                    >
                                        <Plus size={16} />
                                        Add Medicine
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

export default Prescription;