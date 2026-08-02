const mongoose = require('mongoose');

const patientImageSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    images: [{
        data: {
            type: String,
            required: true
        },
        contentType: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

// Index for faster queries
patientImageSchema.index({ patientId: 1 });

module.exports = mongoose.model('PatientImage', patientImageSchema);