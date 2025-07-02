const Course = require('../../models/Course');
const apiClient = require('../../services/apiClient');

exports.syncCourses = async () => {
  try {
    const { data } = await apiClient.get('/courses/progz');

    if (Array.isArray(data)) {
      for (const item of data) {
        const existingCourse = await Course.findOne({ courseId: item.course_id });

        if (!existingCourse) {
          await Course.create({
            courseName: item.course_name,
            courseId: item.course_id,
            courseDescription: item.course_type || '', // Mapping type to description
            courseDuration: 0, // You can update this later if duration info is available
            modules: [],
            enrolledStudents: []
          });
        }
      }
      console.log('✅ Courses synced successfully');
    } else {
      console.warn('⚠️ No valid course data found');
    }
  } catch (error) {
    console.error('❌ Error syncing courses:', error.message);
  }
};
