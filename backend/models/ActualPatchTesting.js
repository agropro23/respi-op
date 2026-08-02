const mongoose = require('mongoose');

const actualPatchTestingSchema = new mongoose.Schema({
  allergen: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('ActualPatchTesting', actualPatchTestingSchema);
