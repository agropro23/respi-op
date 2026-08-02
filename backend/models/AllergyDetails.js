const mongoose = require('mongoose');

const allergyDetailsSchema = new mongoose.Schema({
  allergenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Allergy',
    required: true
  },
  
}, {
  timestamps: true
});

module.exports = mongoose.model('AllergyDetails', allergyDetailsSchema);


