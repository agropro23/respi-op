const express = require('express');
const router = express.Router();
const AllergyDetails = require('../models/AllergyDetails');
const multer = require('multer');
const upload = multer();

// POST route to add allergy details with image and instructions
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { allergenId } = req.body;
        let { instructions } = req.body;
        // instructions can be sent as a JSON string or as an array (form-data)
        if (typeof instructions === 'string') {
            try {
                instructions = JSON.parse(instructions);
            } catch {
                // fallback: comma separated string
                instructions = instructions.split(',').map(i => i.trim()).filter(Boolean);
            }
        }
        if (!Array.isArray(instructions)) {
            instructions = [instructions];
        }
        if (!allergenId || !req.file || !instructions.length) {
            return res.status(400).json({
                success: false,
                message: 'allergenId, image, and at least one instruction are required.'
            });
        }
        const allergyDetails = new AllergyDetails({
            allergenId,
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            },
            instructions
        });
        await allergyDetails.save();
        res.status(201).json({
            success: true,
            message: 'Allergy details added successfully',
            data: allergyDetails._id
        });
    } catch (error) {
        console.error('Error adding allergy details:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding allergy details',
            error: error.message
        });
    }
});

// GET route to fetch all allergy details with images
router.get('/', async (req, res) => {
    try {
        const allergyDetails = await AllergyDetails.find()
            .populate('allergenId');
        
        // Convert all images to base64
        const detailsWithBase64Images = allergyDetails.map(detail => {
            const detailObj = detail.toObject();
            if (detailObj.image && detailObj.image.data) {
                detailObj.image.data = detailObj.image.data.toString('base64');
            }
            return detailObj;
        });

        res.status(200).json({
            success: true,
            data: detailsWithBase64Images
        });
    } catch (error) {
        console.error('Error fetching allergy details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching allergy details',
            error: error.message
        });
    }
});

// GET route to fetch a specific allergy detail with image
router.get('/:id', async (req, res) => {
    try {
        const allergyDetail = await AllergyDetails.findById(req.params.id)
            .populate('allergenId');
        
        if (!allergyDetail) {
            return res.status(404).json({
                success: false,
                message: 'Allergy detail not found'
            });
        }

        // If image exists, convert it to base64
        if (allergyDetail.image && allergyDetail.image.data) {
            const base64Image = allergyDetail.image.data.toString('base64');
            allergyDetail.image = {
                data: base64Image,
                contentType: allergyDetail.image.contentType
            };
        }

        res.status(200).json({
            success: true,
            data: allergyDetail
        });
    } catch (error) {
        console.error('Error fetching allergy detail:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching allergy detail',
            error: error.message
        });
    }
});

module.exports = router;
