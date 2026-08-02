const express = require('express');
const router = express.Router();
const SaveInstruction = require('../models/SaveInstruction');
const Patient = require('../models/Patient');

// Save instructions and foods for a patient
router.post('/', async (req, res) => {
  try {
    const { patient, data, overwrite } = req.body;
    if (!patient || !Array.isArray(data)) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Find the patient by patientId to get the ObjectId
    const patientDoc = await Patient.findOne({ patientId: patient });
    if (!patientDoc) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Check if a record already exists for this patient
    const existing = await SaveInstruction.findOne({ patient: patientDoc._id });
    if (existing && !overwrite) {
      return res.status(409).json({
        success: false,
        message: 'A record already exists for this patient.',
        existingId: existing._id
      });
    }

    // If overwrite is true, delete existing records for this patient
    if (overwrite && existing) {
      await SaveInstruction.deleteMany({ patient: patientDoc._id });
    }

    // Merge all instructions, images, and foods into a single document
    let allInstructions = [];
    let allFoods = [];
    let allAllergyImages = [];
    for (const entry of data) {
      if (Array.isArray(entry.instructions) && entry.instructions.length > 0) {
        // Accept as-is (object or string)
        allInstructions.push(...entry.instructions);
      }
      if (Array.isArray(entry.foods) && entry.foods.length > 0) {
        // Accept as-is (object or string)
        allFoods.push(...entry.foods);
      }
      // Support allergenId as array or single value
      if (Array.isArray(entry.allergenId)) {
        allAllergyImages.push(...entry.allergenId);
      } else if (entry.allergenId) {
        allAllergyImages.push(entry.allergenId);
      }
    }

    // Remove duplicates from allAllergyImages
    allAllergyImages = Array.from(new Set(allAllergyImages));

    // Save a single document for the patient
    const doc = new SaveInstruction({
      patient: patientDoc._id,
      allergiesImage: allAllergyImages.length > 0 ? allAllergyImages : [],
      instructions: allInstructions,
      foods: allFoods
    });
    console.log('Saving instruction document:', {
      patient: patientDoc._id,
      allergiesImageCount: allAllergyImages.length,
      instructionsCount: allInstructions.length,
      foodsCount: allFoods.length
    });
    await doc.save();
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all saved instructions (with images and instructions) for a patient
router.get('/by-patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    console.log('Fetching instructions for patient:', patientId);

    // First find the patient by patientId to get the ObjectId
    const patient = await Patient.findOne({ patientId: patientId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    let instructions = await SaveInstruction.find({ patient: patient._id })
      .populate('patient', 'basicInfo.name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: instructions
    });
  } catch (error) {
    console.error('Error fetching instructions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching instructions',
      error: error.message
    });
  }
});

module.exports = router;