const express = require('express');
const router = express.Router();
const ActualPatchTesting = require('../models/ActualPatchTesting');

// GET all allergens
router.get('/', async (req, res) => {
  try {
    const allergens = await ActualPatchTesting.find();
    res.json(allergens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new allergen
router.post('/', async (req, res) => {
  const { allergen } = req.body;
  if (!allergen) {
    return res.status(400).json({ message: 'Allergen name is required' });
  }
  try {
    const newAllergen = new ActualPatchTesting({ allergen });
    await newAllergen.save();
    res.status(201).json(newAllergen);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE allergen by id
router.delete('/:id', async (req, res) => {
  try {
    const allergen = await ActualPatchTesting.findByIdAndDelete(req.params.id);
    if (!allergen) {
      return res.status(404).json({ message: 'Allergen not found' });
    }
    res.json({ message: 'Allergen deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update allergen by id
router.put('/:id', async (req, res) => {
  const { allergen } = req.body;
  if (!allergen) {
    return res.status(400).json({ message: 'Allergen name is required' });
  }
  try {
    const updated = await ActualPatchTesting.findByIdAndUpdate(
      req.params.id,
      { allergen },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Allergen not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
