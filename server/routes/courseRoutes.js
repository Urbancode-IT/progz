//server/routes/courseRoutes.js
const { protect } = require('../middlewares/authMiddleware');
const allowRoles = require('../middlewares/roleMiddleware');

const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getInstructorCourses,
  updateCourse,
  enrollStudent,
  deleteCourse,
  getCourse,
  addInstructor,
  removeInstructor
} = require('../controllers/courseController');

router.post('/', protect, allowRoles('admin', 'instructor'), createCourse);
router.get('/', getAllCourses);
router.get('/instructor/:id', getInstructorCourses);
router.put('/:id', updateCourse);
router.get('/:id', getCourse);
router.post('/enroll', enrollStudent);
router.delete('/:id', protect, deleteCourse);
// Add an instructor to a course
router.put('/:courseId/add-instructor', addInstructor);

// Remove an instructor from a course
router.put('/:courseId/remove-instructor', removeInstructor);
module.exports = router;
