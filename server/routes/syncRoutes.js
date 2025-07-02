const express = require('express');
const router = express.Router();
const { syncInstructors } = require('../controllers/sync/instructorController');
const { syncCourses } = require('../controllers/sync/courseController');
const { syncStudents } = require('../controllers/sync/studentController');
// Sync routes for instructors, courses, and students
// These routes can be triggered manually or via a cron job
router.get('/sync/instructors', async (req, res) => {
  await syncCourses();
  await syncInstructors();
  await syncStudents();
  res.send('Instructors synced');
});

router.get('/sync/courses', async (req, res) => {
  await syncCourses();
  await syncInstructors();
  await syncStudents();
  res.json({ message: 'Courses synced successfully' });
});

router.get('/sync/students', async (req, res) => {
  await syncCourses();
  await syncInstructors();
  await syncStudents();
  res.json({ message: 'Students synced successfully' });
});

module.exports = router;
