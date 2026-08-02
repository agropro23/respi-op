const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  date: { type: String, required: true }, // Store as YYYY-MM-DD
  time: { 
    type: String, 
    required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/ // Enforce 24-hour format HH:mm
  },
  purpose: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
