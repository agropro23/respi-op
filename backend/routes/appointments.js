const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointments');

// GET all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find({}, '_id patientId date time purpose');
    // Transform patientId to { $oid: ... } and include _id for frontend logic
    const transformed = appointments.map(a => ({
      _id: a._id,
      patientId: { $oid: a.patientId.toString() },
      date: a.date,
      time: a.time,
      purpose: a.purpose
    }));
    res.json(transformed);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments', details: err.message });
  }
});

// POST create a new appointment
router.post('/', async (req, res) => {
  try {
    const { patientId, date, time, purpose } = req.body;
    // Check for existing appointment for this patient on the same date
    const existing = await Appointment.findOne({ patientId, date });
    if (existing) {
      return res.status(400).json({ error: 'This patient already has an appointment on this date.' });
    }
    const appointment = new Appointment({ patientId, date, time, purpose });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create appointment', details: err.message });
  }
});

// PATCH update an appointment
router.patch('/:id', async (req, res) => {
  try {
    const { date, time, purpose } = req.body;
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { date, time, purpose },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update appointment', details: err.message });
  }
});

// DELETE an appointment
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete appointment', details: err.message });
  }
});

module.exports = router;
