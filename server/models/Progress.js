//server/models/Progress.js
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  sectionProgress: [
    {
      moduleIndex: { type: Number, required: true },
      sectionIndex: { type: Number, required: true },
      isCompleted: { type: Boolean, default: false },
      completionTime: { type: Date, default: null }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Progress', progressSchema);
