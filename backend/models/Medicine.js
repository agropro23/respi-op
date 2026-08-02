const mongoose = require('mongoose');

const express = require('express');
const app = express();

app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Optional: ensures no duplicate medicine names
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);