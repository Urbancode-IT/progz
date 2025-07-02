const cron = require('node-cron');
const { syncInstructors } = require('../controllers/sync/instructorController');
const { syncCourses } = require('../controllers/sync/courseController');
const { syncStudents } = require('../controllers/sync/studentController');
cron.schedule('*/30 * * * *', () => {
  console.log('🔄 Syncing instructors...');
  syncInstructors();
  console.log('📚 Syncing courses...');
  syncCourses();
  console.log('🔁 Syncing students...');
  syncStudents();
});
