// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    symptoms: { type: [String], required: true },
    diagnosis: { type: [{ disease: String, percentage: Number }], default: [] },
    predicted: { type: String }, // disease with highest probability
    date: { type: String }, // YYYY-MM-DD
    time: { type: String }, // HH:MM:SS
    status: { type: Boolean, default: false } // shared/unshared
  },
  { timestamps: true } // createdAt, updatedAt
);

module.exports = mongoose.model('Report', reportSchema);
