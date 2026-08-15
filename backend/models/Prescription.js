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
    quantity: {
        type: String,
        default: '',
        required: false
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
    },
    isBelow: { type: Boolean, default: false }
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
    doctorRemarks: String,
    commonBelowInstruction: String,
    selectedDoctor: { type: String, default: 'DR. VIPUL SHAH' },
    paperSize: { type: String, default: 'A4' },
    useOwnLetterhead: { type: Boolean, default: false }
}, { timestamps: true });

// Add index for efficient queries
prescriptionSchema.index({ patientId: 1, prescriptionDate: -1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);