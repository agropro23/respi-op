const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    followUpInstructions: [{
        type: String,
        required: true
    }],
    visitCount: {
        type: Number,
        required: true,
        default: 1
    },
    visitDate: [{
        type: String,
        required: true
    }]
}, { timestamps: true });

// Add index for faster queries
followUpSchema.index({ patientId: 1, visitDate: 1 });

module.exports = mongoose.model('FollowUp', followUpSchema); 