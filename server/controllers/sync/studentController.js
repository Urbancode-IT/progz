const User = require('../../models/User');
const Course = require('../../models/Course');
const apiClient = require('../../services/apiClient');
const { hashPassword } = require('../../utils/passwordUtils');

exports.syncStudents = async () => {
  try {
    const { data } = await apiClient.get('/leads/trainingprogress');

    if (Array.isArray(data)) {
      for (const student of data) {
        const name = student.name || 'Unknown';
        const email = student.email || `${name.toLowerCase().replace(/\s+/g, '')}@progz.tech`;
        const phone = student.mobile_number || '';
        const address = student.location || '';
        const instructor_id = student.trainer_id;

        // 🔍 Match course by courseId
        let course = null;
        if (student.course_id) {
          course = await Course.findOne({ courseId: student.course_id });
          if (!course) {
            console.warn(`⚠️ Course not found for: ${student.course_id}`);
          }
        }

        // 🔁 Check if user already exists
        let existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        let studentId;

        if (!existingUser) {
          const password = await hashPassword('student123');
          const newUser = await User.create({
            name,
            email,
            phone,
            password,
            address,
            role: 'student',
            instructor_id,
            enrolledCourses: course ? [course._id] : []
          });

          console.log(`✅ Created student: ${email}`);
          studentId = newUser._id;
        } else {
          console.log(`⏭️ Skipped existing student: ${email}`);
          studentId = existingUser._id;

          // 🔄 If course exists and student not yet enrolled, add course to enrolledCourses
          if (course && !existingUser.enrolledCourses.includes(course._id)) {
            await User.updateOne(
              { _id: existingUser._id },
              { $addToSet: { enrolledCourses: course._id } }
            );
          }
        }

        // 🔄 Add to course.enrolledStudents[]
        if (course) {
          const alreadyEnrolled = course.enrolledStudents.some((enroll) =>
            enroll.student.toString() === studentId.toString()
          );

          if (!alreadyEnrolled) {
            course.enrolledStudents.push({
              student: studentId,
              enrolledDate: new Date(),
              batchId: null,
              courseCompleted: false
            });
            await course.save();
            console.log(`📚 Student ${email} added to Course ${course.courseName}`);
          } else {
            console.log(`📝 Student already enrolled in Course ${course.courseName}`);
          }
        }
      }

      console.log('🎓 Student sync complete');
    } else {
      console.warn('⚠️ Invalid response from API');
    }
  } catch (error) {
    console.error('❌ Error syncing students:', error.message);
  }
};
