const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    medicineName: {
        type: String,
        required: true
    },
    dosage: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    timings: {
        morning: { type: Boolean, default: false },
        afternoon: { type: Boolean, default: false },
        evening: { type: Boolean, default: false },
        night: { type: Boolean, default: false }
    },
    instructions: {
        beforeFood: { type: Boolean, default: false, required: false },
        afterFood: { type: Boolean, default: false, required: false },
        withFood: { type: Boolean, default: false, required: false },
        other: { type: String, required: false }
    }
});

const prescriptionSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    patientName: {
        type: String,
        required: true
    },
    prescriptionDate: {
        type: Date,
        default: Date.now
    },
    followUp: {
        duration: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            enum: ['days', 'weeks', 'months'],
            required: true
        }
    },
    medicines: [medicineSchema],
    additionalNotes: String,
    doctorRemarks: String
}, { timestamps: true });

// Add index for efficient queries
prescriptionSchema.index({ patientId: 1, prescriptionDate: -1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);