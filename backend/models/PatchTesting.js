const mongoose = require('mongoose');

const allergenResultSchema = new mongoose.Schema({
  allergenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Allergy', required: true },
  name: { type: String, required: true },
  val: { type: Number, required: true },
  isChecked: { type: Boolean, default: false }
});

const patchTestingSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  reportType: { type: String, required: true },
  positive: { type: Number, required: true },
  negative: { type: Number, required: true },
  allergens: {
    Pollens: [allergenResultSchema],
    Fungi: [allergenResultSchema],
    Mites: [allergenResultSchema],
    Dusts: [allergenResultSchema],
    Insects: [allergenResultSchema],
    'Dander/Epithelia': [allergenResultSchema],
    Foods: [allergenResultSchema],
    Miscellaneous: [allergenResultSchema]
  },
  specialAdvices: {
    immunotherapy: { type: Boolean, default: false },
    oralSublingual: { type: Boolean, default: false },
    srsInjections: { type: Boolean, default: false },
    oralSrsSublingual: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PatchTesting', patchTestingSchema);
