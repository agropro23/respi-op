const express = require('express');
const router = express.Router();
const FollowUp = require('../models/FollowUp');
const Patient = require('../models/Patient');

// GET all follow-ups
router.get('/', async (req, res) => {
    try {
        const followUps = await FollowUp.find()
            .populate('patientId', 'basicInfo.name')
            .sort({ visitDate: -1 });
        res.status(200).json({
            success: true,
            data: followUps
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching follow-ups',
            error: error.message
        });
    }
});

// POST create or update follow-up for a patient
router.post('/', async (req, res) => {
    try {
        const { patientId, followUpInstructions, visitDate } = req.body;

        // Validate required fields
        if (!patientId || !followUpInstructions || !visitDate) {
            return res.status(400).json({
                success: false,
                message: 'Patient ID, follow-up instructions, and visit date are required'
            });
        }

        // Try to find existing follow-up document for this patient
        let followUp = await FollowUp.findOne({ patientId });
        
        if (followUp) {
            // Check if this visit date already exists
            const existingVisitIndex = followUp.visitDate.findIndex(date => date === visitDate);
            
            if (existingVisitIndex !== -1) {
                // Update existing visit
                followUp.followUpInstructions[existingVisitIndex] = followUpInstructions;
            } else {
                // Add new visit
                followUp.followUpInstructions.push(followUpInstructions);
                followUp.visitDate.push(visitDate);
                followUp.visitCount += 1; // Increment visit count only for new visits
            }
            
            await followUp.save();
            return res.status(200).json({
                success: true,
                message: 'Follow-up updated successfully',
                data: followUp
            });
        } else {
            // Create new document
            const newFollowUp = new FollowUp({
                patientId,
                followUpInstructions: [followUpInstructions],
                visitDate: [visitDate],
                visitCount: 1
            });
            const savedFollowUp = await newFollowUp.save();
            return res.status(201).json({
                success: true,
                message: 'Follow-up created successfully',
                data: savedFollowUp
            });
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating/updating follow-up',
            error: error.message
        });
    }
});

// GET follow-ups by patient ID (return single document with arrays)
router.get('/patient/:patientId', async (req, res) => {
    try {
        // First find the patient by patientId to get the ObjectId
        const patient = await Patient.findOne({ patientId: req.params.patientId });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        const followUp = await FollowUp.findOne({ patientId: patient._id })
            .populate('patientId', 'basicInfo.name');
        if (!followUp) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: null
            });
        }
        res.status(200).json({
            success: true,
            count: 1,
            data: followUp
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching follow-ups for patient',
            error: error.message
        });
    }
});

// PATCH update follow-up
router.patch('/:id', async (req, res) => {
    try {
        const { followUpInstructions, visitDate, visitCount } = req.body;
        
        const updatedFollowUp = await FollowUp.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    followUpInstructions,
                    visitDate,
                    visitCount
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedFollowUp) {
            return res.status(404).json({
                success: false,
                message: 'Follow-up not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Follow-up updated successfully',
            data: updatedFollowUp
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating follow-up',
            error: error.message
        });
    }
});

// DELETE follow-up
router.delete('/:id', async (req, res) => {
    try {
        const deletedFollowUp = await FollowUp.findByIdAndDelete(req.params.id);

        if (!deletedFollowUp) {
            return res.status(404).json({
                success: false,
                message: 'Follow-up not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Follow-up deleted successfully',
            data: deletedFollowUp
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting follow-up',
            error: error.message
        });
    }
});

module.exports = router;