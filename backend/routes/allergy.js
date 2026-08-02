const express = require('express');
const router = express.Router();
const Allergy = require('../models/Allergy');
const multer = require('multer');
const sharp = require('sharp');
const upload = multer();

// DELETE route to remove an allergy
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Allergy ID is required'
            });
        }

        const deletedAllergy = await Allergy.findByIdAndDelete(id);

        if (!deletedAllergy) {
            return res.status(404).json({
                success: false,
                message: 'Allergy not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Allergy deleted successfully',
            data: deletedAllergy
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(400).json({
            success: false,
            message: 'Error deleting allergy',
            error: error.message
        });
    }
});

// GET route to fetch all allergies
router.get('/all', async (req, res) => {
    try {
        console.log('Fetching all allergies...');
        const allergies = await Allergy.find({})
            .sort({ category: 1, 'name.english': 1 });

        console.log(`Found ${allergies.length} allergies`);

        // Convert images to base64 and validate data
        const allergiesWithBase64 = allergies
            .filter(allergy => {
                // Ensure required fields exist
                if (!allergy.name || !allergy.category) {
                    console.warn('Skipping allergy with missing required fields:', allergy._id);
                    return false;
                }
                return true;
            })
            .map(allergy => {
                const allergyObj = allergy.toObject();
                if (allergyObj.image && allergyObj.image.data) {
                    allergyObj.image.data = allergyObj.image.data.toString('base64');
                    // Ensure contentType is always returned (fallback to image/jpeg if missing)
                    if (!allergyObj.image.contentType) {
                        allergyObj.image.contentType = 'image/jpeg';
                    }
                }
                return allergyObj;
            });

        console.log(`Sending ${allergiesWithBase64.length} valid allergies`);
        res.status(200).json({
            success: true,
            count: allergiesWithBase64.length,
            data: allergiesWithBase64
        });
    } catch (error) {
        console.error('Fetch all error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching all allergies',
            error: error.message
        });
    }
});

// POST route to add a new allergy with details
router.post('/', upload.single('image'), async (req, res) => {
    try {
        let { name, category, instructions, period, sourceof, foodCategory } = req.body;

        // Parse name as object
        if (typeof name === 'string') {
            try {
                name = JSON.parse(name);
            } catch {
                return res.status(400).json({
                    success: false,
                    message: 'Name must be an object with language fields.'
                });
            }
        }

        // Validate required fields
        if (!name || !name.english || !name.english.trim() || !category || !category.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Name (English) and category are required'
            });
        }

        // Parse instructions as array of objects
        if (typeof instructions === 'string') {
            try {
                instructions = JSON.parse(instructions);
            } catch {
                return res.status(400).json({
                    success: false,
                    message: 'Instructions must be an array of objects.'
                });
            }
        }

        // Check for duplicate allergy
        const existingAllergy = await Allergy.findOne({
            'name.english': name.english.trim(),
            category: category.trim().toLowerCase()
        });

        if (existingAllergy) {
            return res.status(409).json({
                success: false,
                message: 'This allergy already exists'
            });
        }

        // Create new allergy
        const allergy = new Allergy({
            name: {
                english: name.english.trim(),
                hindi: name.hindi || '',
                gujarati: name.gujarati || '',
                marathi: name.marathi || ''
            },
            category: category.trim().toLowerCase(),
            period: period || '',
            sourceof: ['fungi', 'mites', 'dusts', 'dander/epithelia'].includes(category.trim().toLowerCase()) ? (sourceof || '') : '',
            instructions: Array.isArray(instructions) ? instructions.map(i => ({
                english: i.english || '',
                hindi: i.hindi || '',
                gujarati: i.gujarati || '',
                marathi: i.marathi || ''
            })) : [],
            ...(foodCategory ? { foodCategory } : {})
        });

        // Add image if provided with comprehensive format conversion to JPEG for PDF compatibility
        if (req.file) {
            let base64Data = req.file.buffer.toString('base64');
            let mimeType = req.file.mimetype;
            let originalMimeType = req.file.mimetype;
            let conversionReason = '';
            let wasConverted = false;

            // Convert ALL image formats to JPEG for guaranteed PDF compatibility
            // This includes: PNG, WebP, GIF, BMP, TIFF, SVG, and any other format
            if (['image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/svg+xml', 'image/x-icon'].includes(req.file.mimetype)) {
                try {
                    const metadata = await sharp(req.file.buffer).metadata();
                    conversionReason = `${metadata.format || req.file.mimetype} (${metadata.width}x${metadata.height})`;

                    // Convert to JPEG for PDF compatibility
                    const jpegBuffer = await sharp(req.file.buffer)
                        .flatten({ background: '#FFFFFF' }) // White background for any transparency
                        .jpeg({ quality: 95, progressive: true }) // High quality, progressive JPEG
                        .toBuffer();

                    base64Data = jpegBuffer.toString('base64');
                    mimeType = 'image/jpeg';
                    wasConverted = true;

                    console.log(`[Allergy Image Conversion] File: ${req.file.originalname} (${conversionReason}) → JPEG (${jpegBuffer.length} bytes, quality:95) for PDF compatibility`);
                } catch (err) {
                    console.error(`[Allergy Image Conversion Error] Failed to convert ${req.file.mimetype} ${req.file.originalname}: ${err.message}. Keeping original format.`);
                    // If error, keep original format (fallback)
                }
            } else if (req.file.mimetype === 'image/jpeg') {
                try {
                    const metadata = await sharp(req.file.buffer).metadata();
                    conversionReason = `JPEG (${metadata.width}x${metadata.height}) - already optimal`;
                } catch (err) {
                    conversionReason = 'JPEG';
                }
            }

            allergy.image = {
                data: base64Data,
                contentType: mimeType
            };
            console.log(`[Allergy Image Upload] File: ${req.file.originalname}, Original Type: ${originalMimeType}, Final Type: ${mimeType}, Converted: ${wasConverted}, Size: ${(req.file.size / 1024).toFixed(2)}KB, Detail: ${conversionReason}`);
        }

        await allergy.save();

        // Return response with base64 image
        const allergyResponse = allergy.toObject();
        if (allergyResponse.image && allergyResponse.image.data && allergyResponse.image.data.length > 0) {
            // Already base64, no conversion needed
            if (!allergyResponse.image.contentType) {
                allergyResponse.image.contentType = 'image/jpeg';
            }
        }

        res.status(201).json({
            success: true,
            message: "Allergy added successfully",
            data: allergyResponse
        });
    } catch (error) {
        console.error('Create error:', error);
        res.status(400).json({
            success: false,
            message: 'Error adding allergy',
            error: error.message
        });
    }
});

// GET route to fetch allergies with optional category filter
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const query = category ? { category: category.toLowerCase() } : {};

        const allergies = await Allergy.find(query)
            .sort({ category: 1, 'name.english': 1 });

        // Convert images to base64 if needed
        const allergiesWithBase64 = allergies.map(allergy => {
            const allergyObj = allergy.toObject();
            if (allergyObj.image && allergyObj.image.data) {
                // Data is already base64, no conversion needed
                // Ensure contentType is always returned (fallback to image/jpeg if missing)
                if (!allergyObj.image.contentType) {
                    allergyObj.image.contentType = 'image/jpeg';
                }
            }
            return allergyObj;
        });

        res.status(200).json({
            success: true,
            count: allergies.length,
            data: allergiesWithBase64
        });
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching allergies',
            error: error.message
        });
    }
});

// PUT route to update an allergy
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        let { name, category, instructions, period, sourceof, foodCategory } = req.body;

        if (typeof name === 'string') {
            try {
                name = JSON.parse(name);
            } catch {
                return res.status(400).json({
                    success: false,
                    message: 'Name must be an object with language fields.'
                });
            }
        }

        if (!id || !name || !name.english || !name.english.trim() || !category || !category.trim()) {
            return res.status(400).json({
                success: false,
                message: 'ID, name (English), and category are required'
            });
        }

        if (typeof instructions === 'string') {
            try {
                instructions = JSON.parse(instructions);
            } catch {
                return res.status(400).json({
                    success: false,
                    message: 'Instructions must be an array of objects.'
                });
            }
        }

        // Check for duplicate allergy excluding current one
        const existingAllergy = await Allergy.findOne({
            _id: { $ne: id },
            'name.english': name.english.trim(),
            category: category.trim().toLowerCase()
        });

        if (existingAllergy) {
            return res.status(409).json({
                success: false,
                message: 'This allergy already exists'
            });
        }

        // Prepare update object
        const updateData = {
            name: {
                english: name.english.trim(),
                hindi: name.hindi || '',
                gujarati: name.gujarati || '',
                marathi: name.marathi || ''
            },
            category: category.trim().toLowerCase(),
            period: period || '',
            sourceof: ['fungi', 'mites', 'dusts', 'dander/epithelia'].includes(category.trim().toLowerCase()) ? (sourceof || '') : '',
            instructions: Array.isArray(instructions) ? instructions.map(i => ({
                english: i.english || '',
                hindi: i.hindi || '',
                gujarati: i.gujarati || '',
                marathi: i.marathi || ''
            })) : [],
            ...(foodCategory ? { foodCategory } : {})
        };

        // Add new image if provided with comprehensive format conversion to JPEG for PDF compatibility
        if (req.file) {
            let base64Data = req.file.buffer.toString('base64');
            let mimeType = req.file.mimetype;
            let originalMimeType = req.file.mimetype;
            let conversionReason = '';
            let wasConverted = false;

            // Convert ALL image formats to JPEG for guaranteed PDF compatibility
            // This includes: PNG, WebP, GIF, BMP, TIFF, SVG, and any other format
            if (['image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/svg+xml', 'image/x-icon'].includes(req.file.mimetype)) {
                try {
                    const metadata = await sharp(req.file.buffer).metadata();
                    conversionReason = `${metadata.format || req.file.mimetype} (${metadata.width}x${metadata.height})`;

                    // Convert to JPEG for PDF compatibility
                    const jpegBuffer = await sharp(req.file.buffer)
                        .flatten({ background: '#FFFFFF' }) // White background for any transparency
                        .jpeg({ quality: 95, progressive: true }) // High quality, progressive JPEG
                        .toBuffer();

                    base64Data = jpegBuffer.toString('base64');
                    mimeType = 'image/jpeg';
                    wasConverted = true;

                    console.log(`[Allergy Image Conversion] File: ${req.file.originalname} (${conversionReason}) → JPEG (${jpegBuffer.length} bytes, quality:95) for PDF compatibility`);
                } catch (err) {
                    console.error(`[Allergy Image Conversion Error] Failed to convert ${req.file.mimetype} ${req.file.originalname}: ${err.message}. Keeping original format.`);
                    // If error, keep original format (fallback)
                }
            } else if (req.file.mimetype === 'image/jpeg') {
                try {
                    const metadata = await sharp(req.file.buffer).metadata();
                    conversionReason = `JPEG (${metadata.width}x${metadata.height}) - already optimal`;
                } catch (err) {
                    conversionReason = 'JPEG';
                }
            }

            updateData.image = {
                data: base64Data,
                contentType: mimeType
            };
            console.log(`[Allergy Image Upload] File: ${req.file.originalname}, Original Type: ${originalMimeType}, Final Type: ${mimeType}, Converted: ${wasConverted}, Size: ${(req.file.size / 1024).toFixed(2)}KB, Detail: ${conversionReason}`);
        }

        const updatedAllergy = await Allergy.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedAllergy) {
            return res.status(404).json({
                success: false,
                message: 'Allergy not found'
            });
        }

        // Return response with base64 image
        const allergyResponse = updatedAllergy.toObject();
        if (allergyResponse.image && allergyResponse.image.data) {
            // Data is already base64, no conversion needed
            // Ensure contentType is always returned (fallback to image/jpeg if missing)
            if (!allergyResponse.image.contentType) {
                allergyResponse.image.contentType = 'image/jpeg';
            }
        }

        res.status(200).json({
            success: true,
            message: 'Allergy updated successfully',
            data: allergyResponse
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating allergy',
            error: error.message
        });
    }
});

// GET route to fetch allergy image by id
router.get('/image/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const allergy = await Allergy.findById(id);
        if (!allergy || !allergy.image || !allergy.image.data) {
            return res.status(404).json({
                success: false,
                message: 'Image not found for this allergy.'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Allergy image retrieved successfully',
            data: allergy.image.data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching allergy image',
            error: error.message
        });
    }
});

// GET route to fetch a single allergy by ID
router.get('/:id', async (req, res) => {
    try {
        const allergy = await Allergy.findById(req.params.id);
        if (!allergy) {
            return res.status(404).json({ success: false, message: 'Allergy not found' });
        }
        // Convert image to base64 if present
        const allergyObj = allergy.toObject();
        if (allergyObj.image && allergyObj.image.data) {
            // Data is already base64, no conversion needed
            // Ensure contentType is always returned (fallback to image/jpeg if missing)
            if (!allergyObj.image.contentType) {
                allergyObj.image.contentType = 'image/jpeg';
            }
        }
        res.status(200).json({ success: true, data: allergyObj });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching allergy', error: error.message });
    }
});



//newadded


module.exports = router;