const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const PatientImage = require('../models/PatientImage');
const sharp = require('sharp');

router.post('/', async (req, res) => {
    try {
        console.log('Received patient data:', JSON.stringify(req.body, null, 2));
            if (!req.body.basicInfo || !req.body.basicInfo.name || !req.body.basicInfo.age || !req.body.basicInfo.sex) {
            return res.status(400).json({ 
                error: "Missing required fields",
                details: "Name, age, and sex are required in basicInfo"
            });
        }
        const patient = new Patient(req.body);
        const savedPatient = await patient.save();
        if (!savedPatient) {
            console.error('Failed to save patient - no error but no saved document');
            return res.status(500).json({ error: "Failed to save patient" });
        }
        console.log('Successfully saved patient:', savedPatient.patientId);
        res.status(201).json({ 
            message: "Patient added successfully", 
            patient: savedPatient 
        });
    } catch (error) {
        console.error('Error saving patient:', error);
        res.status(400).json({ 
            error: "Failed to save patient",
            details: error.message 
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:patientId', async (req, res) => {
    try {
        const patient = await Patient.findOne({ patientId: req.params.patientId });
        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }
        res.json(patient);
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add PATCH endpoint for updating patient data
router.patch('/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        const updateData = req.body;

        const updatedPatient = await Patient.findOneAndUpdate(
            { patientId: patientId },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedPatient) {
            return res.status(404).json({ error: "Patient not found" });    
        }

        res.json({
            message: "Patient updated successfully",
            patient: updatedPatient
        });
    } catch (error) {
        console.error('Error updating patient:', error);
        res.status(400).json({
            error: "Failed to update patient",
            details: error.message
        });
    }
});

// Add DELETE endpoint for removing all patients
router.delete('/all', async (req, res) => {
    try {
        const result = await Patient.deleteMany({});
        res.json({
            message: "All patients deleted successfully",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error deleting patients:', error);
        res.status(500).json({
            error: "Failed to delete patients",
            details: error.message
        });
    }
});

// Update diagnosis
router.put('/:patientId/diagnosis', async (req, res) => {
    try {
        const { patientId } = req.params;
        const diagnosisData = req.body;

        const updatedPatient = await Patient.findOneAndUpdate(
            { patientId: patientId },
            { $set: { diagnosis: diagnosisData } },
            { new: true, runValidators: true }
        );

        if (!updatedPatient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        console.log('Successfully updated diagnosis for patient:', patientId);
        res.json({ 
            message: "Diagnosis updated successfully", 
            patient: updatedPatient 
        });
    } catch (error) {
        console.error('Error updating diagnosis:', error);
        res.status(400).json({ 
            error: "Failed to update diagnosis",
            details: error.message 
        });
    }
});

// Update examination
router.put('/:patientId/examination', async (req, res) => {
    try {
        const { patientId } = req.params;
        const examinationData = req.body;

        const updatedPatient = await Patient.findOneAndUpdate(
            { patientId: patientId },
            { $set: { examination: examinationData } },
            { new: true, runValidators: true }
        );

        if (!updatedPatient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        console.log('Successfully updated examination for patient:', patientId);
        res.json({ 
            message: "Examination updated successfully", 
            patient: updatedPatient 
        });
    } catch (error) {
        console.error('Error updating examination:', error);
        res.status(400).json({ 
            error: "Failed to update examination",
            details: error.message 
        });
    }
});

// Get diagnosis
router.get('/:patientId/diagnosis', async (req, res) => {
    try {
        const { patientId } = req.params;
        const patient = await Patient.findOne({ patientId: patientId }).select('diagnosis');

        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        res.json(patient.diagnosis);
    } catch (error) {
        console.error('Error fetching diagnosis:', error);
        res.status(400).json({ 
            error: "Failed to fetch diagnosis",
            details: error.message 
        });
    }
});

// Get examination
router.get('/:patientId/examination', async (req, res) => {
    try {
        const { patientId } = req.params;
        const patient = await Patient.findOne({ patientId: patientId }).select('examination');

        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        res.json(patient.examination);
    } catch (error) {
        console.error('Error fetching examination:', error);
        res.status(400).json({ 
            error: "Failed to fetch examination",
            details: error.message 
        });
    }
});
// Use memory storage for in-memory file handling
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
// Configure multer for memory storage

// GET route for images by patient ID 
router.get('/fori/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        // First check if patient exists
        const patient = await Patient.findOne({ patientId: patientId });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }
        const patientImage = await PatientImage.findOne({ patientId: patient._id });
        if (!patientImage || !patientImage.images || patientImage.images.length === 0) {
            return res.json({ 
                success: true,
                images: [] 
            });
        }
        const images = patientImage.images.map((img, idx) => {
            const base64String = img.data;
            const isValid = base64String && base64String.length > 0;
            console.log(`[Image Retrieval] Image #${idx + 1}: ContentType=${img.contentType}, Base64Length=${base64String ? base64String.length : 0} chars, Valid=${isValid}, First50Chars=${base64String ? base64String.substring(0, 50) : 'NULL'}`);
            return {
                _id: img._id,
                data: base64String,
                contentType: img.contentType || 'image/jpeg',
                uploadedAt: img.uploadedAt
            };
        });
        res.json({ 
            success: true,
            images 
        });
    } catch (err) {
        console.error('Error fetching patient images:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: err.message 
        });
    }
});

// POST endpoint to add images for a patient (fori)
router.post('/fori/:patientId', upload.array('images'), async (req, res) => {
    try {
        const { patientId } = req.params;
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No images provided'
            });
        }

        // Accept all common image formats
        // Note: PDF rendering works best with JPG, PNG, GIF. Other formats may have limited support
        const supportedFormats = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/bmp',
            'image/webp',
            'image/svg+xml',
            'image/tiff',
            'image/x-icon'
        ];

        const unsupportedFiles = req.files.filter(file => !supportedFormats.includes(file.mimetype));

        if (unsupportedFiles.length > 0) {
            const unsupportedMimes = [...new Set(unsupportedFiles.map(f => f.mimetype))];
            console.warn('Unsupported image formats attempted:', unsupportedMimes, 'Files:', unsupportedFiles.map(f => f.originalname));
            return res.status(400).json({
                success: false,
                message: `Unsupported image format(s): ${unsupportedMimes.join(', ')}. Supported formats: JPG, PNG, GIF, BMP, WebP, SVG, TIFF, ICO`
            });
        }

        // Validate file sizes (5MB limit per file)
        const maxFileSize = 5 * 1024 * 1024;
        const oversizedFiles = req.files.filter(file => file.size > maxFileSize);

        if (oversizedFiles.length > 0) {
            const oversizedNames = oversizedFiles.map(f => `${f.originalname} (${(f.size / 1024 / 1024).toFixed(2)}MB)`);
            console.warn('Oversized files attempted:', oversizedNames);
            return res.status(400).json({
                success: false,
                message: `File size exceeds 5MB limit. Oversized files: ${oversizedNames.join(', ')}`
            });
        }

        // Validate patient exists
        const patient = await Patient.findOne({ patientId: patientId });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        let patientImage = await PatientImage.findOne({ patientId: patient._id });
        if (!patientImage) {
            patientImage = new PatientImage({ patientId: patient._id, images: [] });
        }

        // Check total images limit
        if (patientImage.images.length + req.files.length > 12) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 12 photos allowed'
            });
        }

        // Map files to images with format conversion to JPEG for PDF compatibility
        // ALL image formats are converted to JPEG to ensure perfect PDF rendering
        const newImages = await Promise.all(req.files.map(async (file) => {
            let base64Data = file.buffer.toString('base64');
            let mimeType = file.mimetype;
            let originalMimeType = file.mimetype;
            let conversionReason = '';
            let wasConverted = false;

            // Convert ALL image formats to JPEG for guaranteed PDF compatibility
            // This includes: PNG, WebP, GIF, BMP, TIFF, SVG, and any other format
            if (['image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/svg+xml', 'image/x-icon'].includes(file.mimetype)) {
                try {
                    const metadata = await sharp(file.buffer).metadata();
                    conversionReason = `${metadata.format || file.mimetype} (${metadata.width}x${metadata.height})`;

                    // Convert to JPEG for PDF compatibility
                    const jpegBuffer = await sharp(file.buffer)
                        .flatten({ background: '#FFFFFF' }) // White background for any transparency
                        .jpeg({ quality: 95, progressive: true }) // High quality, progressive JPEG
                        .toBuffer();

                    base64Data = jpegBuffer.toString('base64');
                    mimeType = 'image/jpeg';
                    wasConverted = true;

                    console.log(`[Image Conversion] File: ${file.originalname} (${conversionReason}) → JPEG (${jpegBuffer.length} bytes, quality:95) for PDF compatibility`);
                } catch (err) {
                    console.error(`[Image Conversion Error] Failed to convert ${file.mimetype} ${file.originalname}: ${err.message}. Keeping original format.`);
                    // If error, keep original format (fallback)
                }
            } else if (file.mimetype === 'image/jpeg') {
                try {
                    const metadata = await sharp(file.buffer).metadata();
                    conversionReason = `JPEG (${metadata.width}x${metadata.height}) - already optimal`;
                } catch (err) {
                    conversionReason = 'JPEG';
                }
            }

            const imageData = {
                data: base64Data,
                contentType: mimeType,
                uploadedAt: new Date()
            };

            console.log(`[Image Upload] File: ${file.originalname}, Original Type: ${originalMimeType}, Final Type: ${mimeType}, Converted: ${wasConverted}, Size: ${(file.size / 1024).toFixed(2)}KB, Detail: ${conversionReason}`);
            return imageData;
        }));

        patientImage.images.push(...newImages);
        await patientImage.save();

        console.log(`[Image Upload Success] Patient: ${patientId}, Uploaded: ${req.files.length} image(s), Total: ${patientImage.images.length}`);

        res.status(201).json({
            success: true,
            message: `Successfully uploaded ${req.files.length} image(s)`,
            imageCount: patientImage.images.length,
            uploadedFiles: req.files.map(f => ({
                name: f.originalname,
                type: f.mimetype,
                size: `${(f.size / 1024).toFixed(2)}KB`
            }))
        });
    } catch (error) {
        console.error('[Image Upload Error]', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload images',
            error: error.message
        });
    }
});

// DELETE endpoint to remove specific images (fori)
router.delete('/fori/:patientId/:imageId', async (req, res) => {
    try {
        const { patientId, imageId } = req.params;
        // Validate patient exists
        const patient = await Patient.findOne({ patientId: patientId });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }
        const result = await PatientImage.updateOne(
            { patientId: patient._id },
            { $pull: { images: { _id: imageId } } }
        );
        if (result.modifiedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Image successfully deleted'
        });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete image',
            error: error.message
        });
    }
});

// POST endpoint to add images for a patient
router.post('/:patientId', upload.array('images', 12), async (req, res) => {
    try {
        const { patientId } = req.params;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No images provided'
            });
        }

        // Validate patient exists
        const patient = await Patient.findOne({ patientId: patientId });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        let patientImage = await PatientImage.findOne({ patientId: patient._id });
        if (!patientImage) {
            patientImage = new PatientImage({ patientId: patient._id, images: [] });
        }

        // Check total images limit
        if (patientImage.images.length + req.files.length > 12) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 12 photos allowed'
            });
        }

        const newImages = await Promise.all(req.files.map(async (file) => {
            let base64Data = file.buffer.toString('base64');
            let mimeType = file.mimetype;
            let originalMimeType = file.mimetype;
            let conversionReason = '';
            let wasConverted = false;

            // Convert ALL image formats to JPEG for guaranteed PDF compatibility
            // This includes: PNG, WebP, GIF, BMP, TIFF, SVG, and any other format
            if (['image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/svg+xml', 'image/x-icon'].includes(file.mimetype)) {
                try {
                    const metadata = await sharp(file.buffer).metadata();
                    conversionReason = `${metadata.format || file.mimetype} (${metadata.width}x${metadata.height})`;

                    // Convert to JPEG for PDF compatibility
                    const jpegBuffer = await sharp(file.buffer)
                        .flatten({ background: '#FFFFFF' }) // White background for any transparency
                        .jpeg({ quality: 95, progressive: true }) // High quality, progressive JPEG
                        .toBuffer();

                    base64Data = jpegBuffer.toString('base64');
                    mimeType = 'image/jpeg';
                    wasConverted = true;

                    console.log(`[Image Conversion] File: ${file.originalname} (${conversionReason}) → JPEG (${jpegBuffer.length} bytes, quality:95) for PDF compatibility`);
                } catch (err) {
                    console.error(`[Image Conversion Error] Failed to convert ${file.mimetype} ${file.originalname}: ${err.message}. Keeping original format.`);
                    // If error, keep original format (fallback)
                }
            } else if (file.mimetype === 'image/jpeg') {
                try {
                    const metadata = await sharp(file.buffer).metadata();
                    conversionReason = `JPEG (${metadata.width}x${metadata.height}) - already optimal`;
                } catch (err) {
                    conversionReason = 'JPEG';
                }
            }

            console.log(`[Image Upload] File: ${file.originalname}, Original Type: ${originalMimeType}, Final Type: ${mimeType}, Converted: ${wasConverted}, Size: ${(file.size / 1024).toFixed(2)}KB, Detail: ${conversionReason}`);
            return {
                data: base64Data,
                contentType: mimeType,
                uploadedAt: new Date()
            };
        }));

        patientImage.images.push(...newImages);
        await patientImage.save();

        res.status(201).json({
            success: true,
            message: `Successfully uploaded ${req.files.length} images`,
            imageCount: patientImage.images.length
        });

    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload images',
            error: error.message
        });
    }
});

// DELETE endpoint to remove a patient and all related data
router.delete('/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        // Find patient by patientId
        const patient = await Patient.findOne({ patientId });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        // Remove related PatchTesting
        await require('../models/PatchTesting').deleteMany({ patientId: patient._id });
        // Remove related PatientPatchTest
        await require('../models/PatientPatchTest').deleteMany({ patientId: patient._id });
        // Remove related Prescriptions
        await require('../models/Prescription').deleteMany({ patientId: patient._id });
        // Remove related SaveInstruction (history report)
        await require('../models/SaveInstruction').deleteMany({ patient: patient._id });
        // Remove related FollowUp
        await require('../models/FollowUp').deleteMany({ patientId: patient._id });
        // Remove related PatientImage
        await require('../models/PatientImage').deleteMany({ patientId: patient._id });
        // Remove the patient
        await Patient.deleteOne({ _id: patient._id });
        res.json({ message: 'Patient and all related data deleted successfully' });
    } catch (error) {
        console.error('Error deleting patient and related data:', error);
        res.status(500).json({ error: 'Failed to delete patient and related data', details: error.message });
    }
});

module.exports = router;