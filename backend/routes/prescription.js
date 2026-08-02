const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const fs = require('fs');
const path = require('path');

const modeOfIntakePath = path.join(__dirname, '../../frontend/src/data/modeOfIntake.json');

// Get all prescriptions
router.get('/', async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('patientId', 'basicInfo.name')
      .sort({ prescriptionDate: -1 });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prescriptions', details: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    
    const {
      patientId,
      patientName,
      prescriptionDate,
      followUp,
      medicines,
      additionalNotes,
      doctorRemarks
    } = req.body;

    if (!patientId || !patientName || !medicines || !medicines.length) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Patient ID, name, and at least one medicine are required'
      });
    }

    const prescription = new Prescription({
      patientId,
      patientName,
      prescriptionDate: prescriptionDate || new Date(),
      followUp,
      medicines,
      additionalNotes,
      doctorRemarks
    });

    const savedPrescription = await prescription.save();
    res.status(201).json(savedPrescription);
  } catch (error) {
    res.status(400).json({ 
      error: 'Failed to create prescription', 
      details: error.message 
    });
  }
});

// Add this route to get prescriptions by patient ID
router.get('/patient/:patientId', async (req, res) => {
    try {
        // First find the patient by patientId to get the ObjectId
        const patient = await Patient.findOne({ patientId: req.params.patientId });
        if (!patient) {
            return res.status(404).json({
                error: 'Patient not found'
            });
        }

        const prescriptions = await Prescription.find({ 
            patientId: patient._id 
        })
        .sort({ prescriptionDate: -1 });
        
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch prescriptions', 
            details: error.message 
        });
    }
});

// Add route to update prescription
router.patch('/:id', async (req, res) => {
    try {
        const {
            patientId,
            patientName,
            prescriptionDate,
            followUp,
            medicines,
            additionalNotes,
            doctorRemarks
        } = req.body;

        // Validate required fields
        if (!patientId || !medicines || !medicines.length) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'Patient ID and at least one medicine are required'
            });
        }

        const updatedPrescription = await Prescription.findByIdAndUpdate(
            req.params.id,
            {
                patientId,
                patientName,
                prescriptionDate,
                followUp,
                medicines,
                additionalNotes,
                doctorRemarks
            },
            { new: true, runValidators: true }
        );

        if (!updatedPrescription) {
            return res.status(404).json({ error: 'Prescription not found' });
        }

        res.json(updatedPrescription);
    } catch (error) {
        console.error('Update error:', error);
        res.status(400).json({
            error: 'Failed to update prescription',
            details: error.message
        });
    }
});

// Get all modes of intake
router.get('/mode-of-intake', (req, res) => {
  fs.readFile(modeOfIntakePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read mode of intake', details: err.message });
    }
    try {
      const modes = JSON.parse(data || '[]');
      res.json(modes);
    } catch (parseErr) {
      res.status(500).json({ error: 'Failed to parse mode of intake', details: parseErr.message });
    }
  });
});

// Add a new mode of intake
router.post('/mode-of-intake', (req, res) => {
  const { mode } = req.body;
  if (!mode || typeof mode !== 'string' || !mode.trim()) {
    return res.status(400).json({ error: 'Mode is required and must be a non-empty string' });
  }
  fs.readFile(modeOfIntakePath, 'utf8', (err, data) => {
    let modes = [];
    if (!err && data) {
      try {
        modes = JSON.parse(data);
      } catch (parseErr) {
        // ignore, will overwrite
      }
    }
    if (modes.includes(mode.trim())) {
      return res.status(409).json({ error: 'Mode already exists' });
    }
    modes.push(mode.trim());
    fs.writeFile(modeOfIntakePath, JSON.stringify(modes, null, 2), 'utf8', (writeErr) => {
      if (writeErr) {
        return res.status(500).json({ error: 'Failed to save mode of intake', details: writeErr.message });
      }
      res.status(201).json({ success: true, mode: mode.trim() });
    });
  });
});

module.exports = router;