const mongoose = require('mongoose');

// Replace with your MongoDB URI
const MONGO_URI = 'mongodb+srv://savithasaviy:CourseCurriculum@coursecurriculum.jheiv9t.mongodb.net/?retryWrites=true&w=majority&appName=CourseCurriculum';

// Models
const User = require('./models/User');
const Course = require('./models/Course');

async function cleanupEnrollments() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    const courses = await Course.find();

    for (const course of courses) {
      const validEnrollments = [];

      for (const entry of course.enrolledStudents) {
        // Check if student exists and is not null
        if (entry.student) {
          const exists = await User.exists({ _id: entry.student });
          if (exists) {
            validEnrollments.push(entry);
          } else {
            console.log(`Removed invalid student ID ${entry.student} from course ${course.courseName}`);
          }
        }
      }

      // Update only if changes were made
      if (validEnrollments.length !== course.enrolledStudents.length) {
        course.enrolledStudents = validEnrollments;
        await course.save();
        console.log(`Updated course: ${course.courseName}`);
      }
    }

    console.log('Cleanup complete.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error during cleanup:', err);
  }
}

cleanupEnrollments();
