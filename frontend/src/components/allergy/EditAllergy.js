import React, { useState, useEffect } from 'react';
import { X, Plus, User } from 'lucide-react';
import { apiFetch } from '../../utils/api';

const ALLERGY_CATEGORIES = [
    'pollens',
    'fungi',
    'mites',
    'dusts',
    'insects',
    'dander/epithelia',
    'foods',
    'miscellaneous'
];

const EditAllergy = ({ allergyToEdit, onClose, onSuccess, onError }) => {
    const [editingAllergy, setEditingAllergy] = useState({
        _id: null,
        name: { english: '', hindi: '', gujarati: '', marathi: '' },
        category: '',
        foodCategory: '', // new field for veg/non-veg/jain
        period: '',
        sourceof: '',
        instructions: [{ english: '', hindi: '', gujarati: '', marathi: '' }],
        image: null,
        currentImage: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (allergyToEdit) {
            // Handle backward compatibility for old schema
            let nameObj = { english: '', hindi: '', gujarati: '', marathi: '' };
            let instructionsArray = [{ english: '', hindi: '', gujarati: '', marathi: '' }];

            // Handle name - check if it's old schema (string) or new schema (object)
            if (typeof allergyToEdit.name === 'string') {
                // Old schema: name is string, check for separate language fields
                nameObj = {
                    english: allergyToEdit.name || '',
                    hindi: allergyToEdit.name_hindi || '',
                    gujarati: allergyToEdit.name_gujarati || '',
                    marathi: allergyToEdit.name_marathi || ''
                };
            } else if (allergyToEdit.name && typeof allergyToEdit.name === 'object') {
                // New schema: name is object
                nameObj = {
                    english: allergyToEdit.name.english || '',
                    hindi: allergyToEdit.name.hindi || '',
                    gujarati: allergyToEdit.name.gujarati || '',
                    marathi: allergyToEdit.name.marathi || ''
                };
            }

            // Handle instructions - check if it's old schema (array of strings) or new schema (array of objects)
            if (Array.isArray(allergyToEdit.instructions) && allergyToEdit.instructions.length > 0) {
                if (typeof allergyToEdit.instructions[0] === 'string') {
                    // Old schema: instructions is array of strings, check for separate language arrays
                    const englishInst = allergyToEdit.instructions || [];
                    const hindiInst = allergyToEdit.instructions_hindi || [];
                    const gujaratiInst = allergyToEdit.instructions_gujarati || [];
                    const marathiInst = allergyToEdit.instructions_marathi || [];

                    // Create objects from parallel arrays
                    const maxLength = Math.max(englishInst.length, hindiInst.length, gujaratiInst.length, marathiInst.length);
                    if (maxLength > 0) {
                        instructionsArray = Array.from({ length: maxLength }, (_, i) => ({
                            english: englishInst[i] || '',
                            hindi: hindiInst[i] || '',
                            gujarati: gujaratiInst[i] || '',
                            marathi: marathiInst[i] || ''
                        }));
                    }
                } else if (typeof allergyToEdit.instructions[0] === 'object') {
                    // New schema: instructions is array of objects
                    instructionsArray = allergyToEdit.instructions.map(i => ({
                        english: i.english || '',
                        hindi: i.hindi || '',
                        gujarati: i.gujarati || '',
                        marathi: i.marathi || ''
                    }));
                }
            }

            setEditingAllergy({
                _id: allergyToEdit._id,
                name: nameObj,
                category: allergyToEdit.category || '',
                foodCategory: allergyToEdit.foodCategory || '', // pre-fill if present
                period: allergyToEdit.period || '',
                sourceof: allergyToEdit.sourceof || '',
                instructions: instructionsArray,
                image: null, // Image file itself, for new upload
                currentImage: allergyToEdit.image
                    ? `data:${allergyToEdit.image.contentType};base64,${allergyToEdit.image.data}`
                    : null,
            });
        }
    }, [allergyToEdit]);

    const validateForm = () => {
        const errors = {};
        // English name is compulsory
        // if (!editingAllergy.name.english.trim()) {
        //   errors.name = 'English name is required';
        // }
        // Category is compulsory
        // if (!editingAllergy.category) {
        //   errors.category = 'Category is required';
        // }
        // Instructions validation - English instruction is compulsory for non-food/miscellaneous categories
        // if (!['foods', 'miscellaneous'].includes(editingAllergy.category)) {
        //   const hasValidInstruction = editingAllergy.instructions.some(inst => 
        //     inst.english && inst.english.trim()
        //   );
        //   if (!hasValidInstruction) {
        //     errors.instructions = 'At least one instruction (English) is required for this category';
        //   } else {
        //     const invalidInstructions = editingAllergy.instructions.filter(inst => {
        //       const hasOtherLanguage = inst.hindi?.trim() || inst.gujarati?.trim() || inst.marathi?.trim();
        //       const hasEnglish = inst.english && inst.english.trim();
        //       return hasOtherLanguage && !hasEnglish;
        //     });
        //     if (invalidInstructions.length > 0) {
        //       errors.instructions = 'All instructions must have English text if other languages are provided';
        //     }
        //   }
        // }
        return errors;
    };

    const handleInstructionChange = (index, field, value) => {
        const updatedInstructions = [...editingAllergy.instructions];
        updatedInstructions[index][field] = value;
        setEditingAllergy(prev => ({ ...prev, instructions: updatedInstructions }));

        // Clear instruction error when user starts typing
        if (formErrors.instructions) {
            setFormErrors(prev => ({ ...prev, instructions: '' }));
        }

        // Real-time validation for English requirement
        if (field !== 'english' && value && value.trim()) {
            const currentInstruction = updatedInstructions[index];
            const hasEnglish = currentInstruction.english && currentInstruction.english.trim();
            if (!hasEnglish) {
                setFormErrors(prev => ({
                    ...prev,
                    [`instruction_${index}`]: 'English text is required when other languages are provided'
                }));
            } else {
                setFormErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[`instruction_${index}`];
                    return newErrors;
                });
            }
        }
    };

    const addInstruction = () => {
        setEditingAllergy(prev => ({
            ...prev,
            instructions: [...prev.instructions, { english: '', hindi: '', gujarati: '', marathi: '' }]
        }));
    };

    const removeInstruction = (index) => {
        if (editingAllergy.instructions.length > 1) {
            const updatedInstructions = editingAllergy.instructions.filter((_, i) => i !== index);
            setEditingAllergy(prev => ({ ...prev, instructions: updatedInstructions }));
        }
    };

    const handleNameChange = (lang, value) => {
        setEditingAllergy(prev => ({ ...prev, name: { ...prev.name, [lang]: value } }));
        if (formErrors.name) {
            setFormErrors(prev => ({ ...prev, name: '' }));
        }
    };

    const handleInputChange = (field, value) => {
        setEditingAllergy(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }));
        }
        // Reset foodCategory if category is changed away from foods
        if (field === 'category' && value !== 'foods') {
            setEditingAllergy(prev => ({ ...prev, foodCategory: '' }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditingAllergy(prev => ({
                ...prev,
                image: file,
                currentImage: URL.createObjectURL(file)
            }));
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            onError('Please correct the form errors.');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', JSON.stringify(editingAllergy.name));
            formData.append('category', editingAllergy.category);
            if (editingAllergy.category === 'foods' && editingAllergy.foodCategory) {
                formData.append('foodCategory', editingAllergy.foodCategory);
            }
            formData.append('period', editingAllergy.period);
            formData.append('sourceof', ['fungi', 'mites', 'dusts', 'dander/epithelia'].includes(editingAllergy.category) ? editingAllergy.sourceof : '');

            // Filter out instructions with no English text but keep completely empty ones
            const filteredInstructions = editingAllergy.instructions.filter(i => {
                const hasEnglish = i.english && i.english.trim();
                const hasOtherLanguage = i.hindi?.trim() || i.gujarati?.trim() || i.marathi?.trim();

                // Keep if it has English text, or if it's completely empty
                return hasEnglish || (!hasEnglish && !hasOtherLanguage);
            });

            formData.append('instructions', JSON.stringify(filteredInstructions));
            if (editingAllergy.image instanceof File) {
                formData.append('image', editingAllergy.image);
            }

            if (editingAllergy.category === 'dander/epithelia') {
                editingAllergy.period = '';
            }

            const response = await apiFetch(`${process.env.REACT_APP_CLIENT_BASE_URL}/api/allergies/${editingAllergy._id}`, {
                method: 'PUT',
                body: formData
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update allergy');
            }
            onSuccess('Allergy updated successfully!');
            onClose();
        } catch (error) {
            console.error('Error updating allergy:', error);
            onError(error.message || 'Failed to update allergy. Please try again.');
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
                    maxWidth: '900px',
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
                            <h5 className="mb-1 fw-bold text-dark" style={{ fontSize: '16px' }}>Edit Allergy</h5>
                            <div className="d-flex align-items-center text-muted" style={{ fontSize: '13px' }}>
                                <span>{new Date().toLocaleDateString('en-GB')}</span>
                                <span className="mx-2">•</span>
                                <span>Allergen Management</span>
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
                <form onSubmit={handleFormSubmit} style={{ padding: '32px' }}>
                    {/* Allergy Info Section */}
                    <div className="mb-4">
                        <h6 className="fw-semibold text-dark mb-3" style={{ color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Allergen Information
                        </h6>

                        {/* First row: English + Hindi */}
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>
                                    Allergen Name (English)
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                                    value={editingAllergy.name.english}
                                    onChange={(e) => handleNameChange('english', e.target.value)}
                                    placeholder="e.g., Dust Mite, Peanut"
                                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                                />
                                {formErrors.name && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{formErrors.name}</div>}
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>
                                    Allergen Name (Hindi)
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editingAllergy.name.hindi}
                                    onChange={(e) => handleNameChange('hindi', e.target.value)}
                                    placeholder="Allergen Name in Hindi (optional)"
                                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                                />
                            </div>
                        </div>

                        {/* Second row: Gujarati + Marathi */}
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>
                                    Allergen Name (Gujarati)
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editingAllergy.name.gujarati}
                                    onChange={(e) => handleNameChange('gujarati', e.target.value)}
                                    placeholder="Allergen Name in Gujarati (optional)"
                                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>
                                    Allergen Name (Marathi)
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editingAllergy.name.marathi}
                                    onChange={(e) => handleNameChange('marathi', e.target.value)}
                                    placeholder="Allergen Name in Marathi (optional)"
                                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                                />
                            </div>
                        </div>

                        {/* Third row: Category (big) + Pollination Period */}
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>
                                    Category
                                </label>
                                <select
                                    className={`form-select ${formErrors.category ? 'is-invalid' : ''}`}
                                    value={editingAllergy.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px', minWidth: '220px' }}
                                >
                                    <option value="">Select Category</option>
                                    {ALLERGY_CATEGORIES.map(category => (
                                        <option key={category} value={category}>
                                            {category.replace(/^./, str => str.toUpperCase())}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.category && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{formErrors.category}</div>}
                            </div>
                            {/* Food Category Dropdown - only show if foods is selected */}
                            {editingAllergy.category === 'foods' && (
                                <div className="col-md-6">
                                    <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>
                                        Food Category
                                    </label>
                                    <select
                                        className="form-select"
                                        value={editingAllergy.foodCategory}
                                        onChange={e => handleInputChange('foodCategory', e.target.value)}
                                        style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px', minWidth: '120px' }}
                                    >
                                        <option value="">Select Food Category</option>
                                        <option value="veg">Veg</option>
                                        <option value="non-veg">Non-Veg</option>
                                        <option value="jain">Non-Jain</option>
                                    </select>
                                </div>
                            )}
                            <div className="col-md-6">
                                <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>
                                    {editingAllergy.category === 'fungi' ? 'Spollination Period' : 'Pollination Period'}
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editingAllergy.period}
                                    onChange={(e) => handleInputChange('period', e.target.value)}
                                    placeholder="e.g., Jan-Mar"
                                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px', minWidth: '120px' }}
                                />
                            </div>
                        </div>

                        {['fungi', 'mites', 'dusts', 'dander/epithelia'].includes(editingAllergy.category) && (
                            <div className="row g-3 mb-3">
                                <div className="col-md-12">
                                    <label className="form-label fw-medium text-dark" style={{ fontSize: '13px' }}>
                                        Source of Origin
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editingAllergy.sourceof}
                                        onChange={e => setEditingAllergy(prev => ({ ...prev, sourceof: e.target.value }))}
                                        placeholder="Enter source of origin (English only)"
                                        style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 14px', fontSize: '13px' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Instructions Section */}
                    <div className="mb-3">
                        <label className="form-label fw-medium text-dark" style={{ fontSize: '14px' }}>
                            Instructions
                        </label>
                        {/* {formErrors.instructions && <div className="text-danger mb-2" style={{ fontSize: '12px' }}>{formErrors.instructions}</div>} */}

                        {editingAllergy.instructions.map((instruction, index) => (
                            <div key={index} className="border rounded p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="mb-0" style={{ fontSize: '13px', color: '#495057' }}>Instruction {index + 1}</h6>
                                    {editingAllergy.instructions.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => removeInstruction(index)}
                                            style={{ fontSize: '11px', padding: '4px 8px' }}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                {/* English Row */}
                                <div className="row g-2 mb-2">
                                    <div className="col-6">
                                        <label className="form-label fw-medium text-dark" style={{ fontSize: '12px' }}>
                                            English
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={instruction.english}
                                            onChange={(e) => handleInstructionChange(index, 'english', e.target.value)}
                                            placeholder="Instruction in English"
                                            style={{
                                                borderRadius: '6px',
                                                border: '1px solid #d1d5db',
                                                padding: '8px 12px',
                                                fontSize: '13px'
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-dark" style={{ fontSize: '12px' }}>
                                            Hindi (optional)
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${formErrors[`instruction_${index}`] ? 'is-invalid' : ''}`}
                                            value={instruction.hindi}
                                            onChange={(e) => handleInstructionChange(index, 'hindi', e.target.value)}
                                            placeholder="Instruction in Hindi"
                                            style={{
                                                borderRadius: '6px',
                                                border: '1px solid #d1d5db',
                                                padding: '8px 12px',
                                                fontSize: '13px'
                                            }}
                                        />
                                        {formErrors[`instruction_${index}`] && <div className="invalid-feedback" style={{ fontSize: '11px' }}>{formErrors[`instruction_${index}`]}</div>}
                                    </div>
                                </div>

                                {/* Other Languages Row */}
                                <div className="row g-2">
                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-dark" style={{ fontSize: '12px' }}>
                                            Gujarati (optional)
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${formErrors[`instruction_${index}`] ? 'is-invalid' : ''}`}
                                            value={instruction.gujarati}
                                            onChange={(e) => handleInstructionChange(index, 'gujarati', e.target.value)}
                                            placeholder="Instruction in Gujarati"
                                            style={{
                                                borderRadius: '6px',
                                                border: '1px solid #d1d5db',
                                                padding: '8px 12px',
                                                fontSize: '13px'
                                            }}
                                        />
                                        {formErrors[`instruction_${index}`] && <div className="invalid-feedback" style={{ fontSize: '11px' }}>{formErrors[`instruction_${index}`]}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-dark" style={{ fontSize: '12px' }}>
                                            Marathi (optional)
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${formErrors[`instruction_${index}`] ? 'is-invalid' : ''}`}
                                            value={instruction.marathi}
                                            onChange={(e) => handleInstructionChange(index, 'marathi', e.target.value)}
                                            placeholder="Instruction in Marathi"
                                            style={{
                                                borderRadius: '6px',
                                                border: '1px solid #d1d5db',
                                                padding: '8px 12px',
                                                fontSize: '13px'
                                            }}
                                        />
                                        {formErrors[`instruction_${index}`] && <div className="invalid-feedback" style={{ fontSize: '11px' }}>{formErrors[`instruction_${index}`]}</div>}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={addInstruction}
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                            + Add Another Instruction
                        </button>
                    </div>

                    {/* Current Image Display */}
                    {editingAllergy.currentImage && (
                        <div className="mb-4">
                            <h6 className="fw-semibold text-dark mb-3" style={{ color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Current Image
                            </h6>
                            <div style={{ maxWidth: '200px' }}>
                                <img
                                    src={editingAllergy.currentImage}
                                    alt="Current allergy"
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        borderRadius: '8px',
                                        border: '1px solid #d1d5db'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Upload New Image Section */}
                    <div className="mb-4">
                        <h6 className="fw-semibold text-dark mb-3" style={{ color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Upload New Image (Optional)
                        </h6>
                        <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                padding: '10px 14px',
                                fontSize: '13px'
                            }}
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="d-flex justify-content-end gap-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-outline-secondary"
                            disabled={isSubmitting}
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                color: '#6b7280',
                                fontWeight: '500',
                                transition: 'all 0.2s ease-in-out',
                                fontSize: '13px',
                                padding: '10px 20px'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                            style={{
                                borderRadius: '8px',
                                backgroundColor: '#2563eb',
                                border: 'none',
                                fontWeight: '500',
                                transition: 'all 0.2s ease-in-out',
                                fontSize: '13px',
                                padding: '10px 20px'
                            }}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Allergy'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAllergy;