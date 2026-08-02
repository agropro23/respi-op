const mongoose = require('mongoose');

const allergyResultSchema = new mongoose.Schema({
  allergy: { type: String, required: true },
  result: { type: String, required: true },
  check: { type: Boolean, required: true, default: false }
});

const patientPatchTestSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true,
    index: true // Add index for better query performance
  },
  date: { type: Date, required: true },
  allergies: [allergyResultSchema],
  advice: { type: String, required: false },
}, {
  timestamps: true // Add timestamps for better tracking
});

// Ensure only one patch test per patient - this will prevent duplicates at the database level
patientPatchTestSchema.index({ patientId: 1 }, { unique: true });

// Add a pre-save middleware to double-check for duplicates
patientPatchTestSchema.pre('save', async function(next) {
  try {
    // Check if another patch test exists for this patient
    const existingPatchTest = await this.constructor.findOne({ 
      patientId: this.patientId,
      _id: { $ne: this._id } // Exclude current document if updating
    });
    
    if (existingPatchTest) {
      const error = new Error('A patch test already exists for this patient');
      error.name = 'DuplicateError';
      return next(error);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('PatientPatchTest', patientPatchTestSchema);
