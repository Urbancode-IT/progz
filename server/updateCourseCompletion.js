const mongoose = require('mongoose');
const Course = require('./models/Course'); // adjust path as needed
const Progress = require('./models/Progress'); // adjust path as needed

// Replace with your connection string
const MONGO_URI = 'mongodb+srv://savithasaviy:CourseCurriculum@coursecurriculum.jheiv9t.mongodb.net/?retryWrites=true&w=majority&appName=CourseCurriculum';

async function updateCourseCompletion() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const courses = await Course.find();

    for (const course of courses) {
      let updated = false;

      for (let studentEntry of course.enrolledStudents) {
        if (!studentEntry.student) continue;

        const progress = await Progress.findOne({
          student: studentEntry.student,
          course: course._id
        });

        if (progress && progress.sectionProgress.length > 0) {
          const allCompleted = progress.sectionProgress.every(sec => sec.isCompleted);

          if (studentEntry.courseCompleted !== allCompleted) {
            studentEntry.courseCompleted = allCompleted;
            updated = true;
          }
        }
      }

      if (updated) {
        await course.save();
        console.log(`Updated course completions: ${course.courseName}`);
      }
    }

    console.log('Course completion updates finished.');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error updating course completions:', err);
    mongoose.connection.close();
  }
}

updateCourseCompletion();
