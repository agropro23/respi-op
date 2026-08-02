const express = require('express');
const router = express.Router();
const PatchTesting = require('../models/PatchTesting');
const Patient = require('../models/Patient');

// GET all patch tests
router.get('/', async (req, res) => {
    try {
        const patchTests = await PatchTesting.find()
            .populate('patientId', 'basicInfo.name basicInfo.age basicInfo.sex')
            .sort({ createdAt: -1 });
        res.json(patchTests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET patch test by ID

router.get('/:id', async (req, res) => {
    try {
        const patchTest = await PatchTesting.findById(req.params.id)
            .populate('patientId', 'basicInfo.name basicInfo.age basicInfo.sex');
        if (!patchTest) {
            return res.status(404).json({ message: 'Patch test not found' });
        }
        res.json(patchTest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET patch tests by patient ID
router.get('/patient/:patientId', async (req, res) => {
    try {
        // First find the patient by patientId to get the ObjectId
        const patient = await Patient.findOne({ patientId: req.params.patientId });
        if (!patient) {
            return res.status(404).json({
                message: 'Patient not found'
            });
        }

        const patchTests = await PatchTesting.find({ patientId: patient._id })
        .populate('allergens.Pollens.allergenId', 'name period')
        .populate('allergens.Fungi.allergenId', 'name period')
        .populate('allergens.Mites.allergenId', 'name period')
        .populate('allergens.Dusts.allergenId', 'name period')
        .populate('allergens.Insects.allergenId', 'name period')
        .populate('allergens.Dander/Epithelia.allergenId', 'name period')
        .populate('allergens.Foods.allergenId', 'name period')
        .populate('allergens.Miscellaneous.allergenId', 'name period')
            .sort({ createdAt: -1 });
        res.json(patchTests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new patch test
router.post('/', async (req, res) => {
    try {
        // Validate required fields
        const { patientId, reportType, positive, negative, allergens, specialAdvices } = req.body;
        
        if (!patientId) {
            return res.status(400).json({ message: 'Patient ID is required' });
        }
        if (!reportType) {
            return res.status(400).json({ message: 'Report type is required' });
        }
        if (positive === undefined || positive === null) {
            return res.status(400).json({ message: 'Positive control value is required' });
        }
        if (negative === undefined || negative === null) {
            return res.status(400).json({ message: 'Negative control value is required' });
        }
        if (!allergens) {
            return res.status(400).json({ message: 'Allergens data is required' });
        }

        // Check if a report already exists for this patient
        const existingReport = await PatchTesting.findOne({ patientId });
        if (existingReport) {
            return res.status(409).json({ 
                message: 'A patch test report already exists for this patient.', 
                existingReportId: existingReport._id 
            });
        }

        // Filter out empty allergen values
        const filteredAllergens = {};
        Object.keys(allergens).forEach(category => {
            const categoryResults = allergens[category].filter(item => 
                item.val > 0 || item.isChecked
            );
            if (categoryResults.length > 0) {
                filteredAllergens[category] = categoryResults;
            }
        });

        // Create new patch test
        const patchTest = new PatchTesting({
            patientId,
            reportType,
            positive: parseInt(positive),
            negative: parseInt(negative),
            allergens: filteredAllergens,
            specialAdvices: specialAdvices || {
                immunotherapy: false,
                oralSublingual: false,
                srsInjections: false,
                oralSrsSublingual: false
            }
        });

        // Save to database
        const newPatchTest = await patchTest.save();
        console.log('Successfully saved patch test:', newPatchTest);
        res.status(201).json(newPatchTest);
    } catch (error) {
        console.error('Error saving patch test:', error);
        res.status(400).json({ 
            message: 'Error saving patch test',
            error: error.message,
            details: error.errors // Mongoose validation errors
        });
    }
});

// DELETE all patch tests
router.delete('/all', async (req, res) => {
    try {
        const result = await PatchTesting.deleteMany({});
        res.json({ 
            message: `Successfully deleted ${result.deletedCount} patch test records`,
            deletedCount: result.deletedCount 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE patch test by ID
router.delete('/:id', async (req, res) => {
    try {
        const result = await PatchTesting.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Patch test not found' });
        }
        res.json({ message: 'Patch test deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 