const mongoose = require('mongoose');

const saveInstructionSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    allergiesImage: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Allergy',
        required: false // Array to support multiple images
    }],
    instructions: [{
        type: mongoose.Schema.Types.Mixed // allow object or string for backward compatibility
    }],
    foods: [{
        type: mongoose.Schema.Types.Mixed // allow object or string for backward compatibility
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Update the updatedAt timestamp before saving
saveInstructionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const SaveInstruction = mongoose.model('SaveInstruction', saveInstructionSchema);

module.exports = SaveInstruction;

