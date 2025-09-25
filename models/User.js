// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  age: { type: Number, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, default: 'patient' }
});

module.exports = mongoose.model('User', userSchema);
