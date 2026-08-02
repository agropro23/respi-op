const mongoose = require('mongoose');

const saveSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store hashed password
});

module.exports = mongoose.model('Save', saveSchema); 