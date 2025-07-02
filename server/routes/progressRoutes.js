//server/routes/progressRoutes.js
const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const allowRoles = require('../middlewares/roleMiddleware');
const router = express.Router();
const {
  getStudentProgress,
  updateSectionProgress,
  getCourseProgress,
  getStudentCourseProgress,
  updateSectionCompletion,
  createBatch,
  updateBatchStudents,
  getInstructorBatches,
  getBatches,
  getBatchesByCourse,
  removeStudentFromBatch,
  addStudentToBatch,
  getBatchById
} = require('../controllers/progressController');

router.get('/:studentId/:courseId', getStudentProgress);
router.post('/update', updateSectionProgress);
router.get('/course/:courseId', protect, allowRoles('instructor', 'admin'), getCourseProgress);
router.get('/:courseId/student-progress', protect, allowRoles('student'), getStudentCourseProgress);
router.put('/:studentId/:courseId', updateSectionCompletion);
router.post('/batch', protect, allowRoles('instructor', 'admin'), createBatch);
router.put('/batch/:batchId/:courseId', protect, allowRoles('instructor', 'admin'), updateBatchStudents);
router.get('/batches/instructor/:instructorId', protect, allowRoles('instructor', 'admin'),getInstructorBatches);
router.get('/batch', protect, allowRoles('instructor', 'admin'), getBatches);
router.get('/batches/by-course/:courseId', getBatchesByCourse);
router.post('/batch/:batchId/remove-student', removeStudentFromBatch);
router.post('/batch/:batchId/add-student', addStudentToBatch);
router.get('/batch/view/:batchId', getBatchById);


module.exports = router;
