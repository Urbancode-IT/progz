const mongoose = require('mongoose');

const newUserSchema = new mongoose.Schema({
  name: String,
  role: { type: String, enum: ['instructor', 'student'], required: true },
  email: { type: String, required: true, unique: true },
  password: String,
  phone: String,
  address: String,
  education: String,
  profession: String,
  experience: String,
}, { timestamps: true });

module.exports = mongoose.model('NewUser', newUserSchema);
