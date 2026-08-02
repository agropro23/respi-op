const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const multer = require('multer');
const upload = multer(); // For parsing multipart/form-data

// POST route to add a new medicine
router.post('/', upload.none(), async (req, res) => {
  try {
    // req.body will work for both JSON and form-data now
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Medicine name is required' });
    }


    const medicine = new Medicine({ name: name.trim() });
    await medicine.save();
    res.status(201).json({ message: 'Medicine added successfully', data: medicine });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(409).json({ error: 'Medicine already exists' });
    }
    res.status(400).json({ error: 'Failed to add medicine', details: error.message });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const deletedMedicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!deletedMedicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    res.status(200).json({ message: 'Medicine deleted successfully', data: deletedMedicine });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete medicine', details: error.message });
  }
});
// GET route to fetch all medicines
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ name: 1 }); // Sort by name (optional)
    res.status(200).json({ success: true, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch medicines', details: error.message });
  }
});

// PATCH route to update a medicine by ID
router.patch('/:id', upload.none(), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Medicine name is required' });
    }
    const updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,    
      { name: name.trim() },
      { new: true, runValidators: true }
    );
    if (!updatedMedicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    res.status(200).json({ message: 'Medicine updated successfully', data: updatedMedicine });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Medicine already exists' });
    }
    res.status(400).json({ error: 'Failed to update medicine', details: error.message });
  }
});

module.exports = router;