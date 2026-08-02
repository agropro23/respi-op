const express = require('express');
const router = express.Router();
const PatientPatchTest = require('../models/PatientPatchTest');
const Patient = require('../models/Patient');

// GET all patch tests
router.get('/', async (req, res) => {
  try {
    const patchTests = await PatientPatchTest.find()
      .populate('patientId', 'basicInfo.name basicInfo.age basicInfo.sex')
      .sort({ date: -1 });
    res.json(patchTests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all patch tests for a patient by patientId (ObjectId) - more specific route first
router.get('/by-patient/:patientId', async (req, res) => {
  try {
    const patchTests = await PatientPatchTest.find({ patientId: req.params.patientId });
    res.json(patchTests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET patch test by id - less specific route last
router.get('/:id', async (req, res) => {
  try {
    const patchTest = await PatientPatchTest.findById(req.params.id);
    if (!patchTest) {
      return res.status(404).json({ message: 'Patch test not found' });
    }
    res.json(patchTest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create new patch test
router.post('/', async (req, res) => {
  const { patientId, date, allergies, advice } = req.body;
  console.log('POST /patient-patch-test - Received data:', { patientId, date, allergies });
  
  if (!patientId || !date || !Array.isArray(allergies) || allergies.length === 0) {
    console.log('Validation failed - missing required fields');
    return res.status(400).json({ message: 'patientId, date, and allergies are required' });
  }
  
  try {
    // Check if a report already exists for this patient
    console.log('Checking for existing report for patientId:', patientId);
    const existingReport = await PatientPatchTest.findOne({ patientId });
    console.log('Existing report found:', existingReport);
    
    if (existingReport) {
      console.log('Conflict detected - returning 409 with existingReportId:', existingReport._id);
      return res.status(409).json({ 
        message: 'A patch test report already exists for this patient.', 
        existingReportId: existingReport._id 
      });
    }

    console.log('No existing report found - creating new patch test');
    const patchTest = new PatientPatchTest({ patientId, date, allergies, advice });
    await patchTest.save();
    console.log('Patch test saved successfully:', patchTest._id);
    res.status(201).json(patchTest);
  } catch (err) {
    console.error('Error in POST /patient-patch-test:', err);
    
    // Handle duplicate error from pre-save middleware
    if (err.name === 'DuplicateError') {
      // Try to find the existing report to return its ID
      try {
        const existingReport = await PatientPatchTest.findOne({ patientId });
        if (existingReport) {
          return res.status(409).json({ 
            message: 'A patch test report already exists for this patient.', 
            existingReportId: existingReport._id 
          });
        }
      } catch (findError) {
        console.error('Error finding existing report:', findError);
      }
      
      return res.status(409).json({ 
        message: 'A patch test report already exists for this patient.'
      });
    }
    
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      try {
        const existingReport = await PatientPatchTest.findOne({ patientId });
        if (existingReport) {
          return res.status(409).json({ 
            message: 'A patch test report already exists for this patient.', 
            existingReportId: existingReport._id 
          });
        }
      } catch (findError) {
        console.error('Error finding existing report:', findError);
      }
      
      return res.status(409).json({ 
        message: 'A patch test report already exists for this patient.'
      });
    }
    
    res.status(500).json({ message: err.message });
  }
});

// PUT update patch test by id
router.put('/:id', async (req, res) => {
  const { patientId, date, allergies, advice } = req.body;
  try {
    const updated = await PatientPatchTest.findByIdAndUpdate(
      req.params.id,
      { patientId, date, allergies, advice },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Patch test not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE patch test by id
router.delete('/:id', async (req, res) => {
  try {
    const patchTest = await PatientPatchTest.findByIdAndDelete(req.params.id);
    if (!patchTest) {
      return res.status(404).json({ message: 'Patch test not found' });
    }
    res.json({ message: 'Patch test deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
