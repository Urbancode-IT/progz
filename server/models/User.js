//server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  address: String,
  education: String,
  profession: String,
  experience: String,
  instructor_id: Number, 
  role: { type: String, enum: ['admin', 'instructor', 'student'], required: true },
  enrolledCourses:[{type: mongoose.Schema.Types.ObjectId, ref: 'Course'}],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
