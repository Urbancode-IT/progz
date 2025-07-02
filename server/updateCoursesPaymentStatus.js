const mongoose = require('mongoose');
const Course = require('./models/Course'); // adjust path as necessary

// Replace with your connection string
const MONGO_URI = 'mongodb+srv://savithasaviy:CourseCurriculum@coursecurriculum.jheiv9t.mongodb.net/?retryWrites=true&w=majority&appName=CourseCurriculum';

async function updateCourses() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const courses = await Course.find();

    for (const course of courses) {
      let updated = false;

      course.enrolledStudents = course.enrolledStudents.map(student => {
        if (!student.paymentStatus) {
          student.paymentStatus = {
            isPaid: false,
            mode: null,
            transactionId: null,
            processedBy: null,
            paymentDate: null
          };
          updated = true;
        }
        return student;
      });

      if (updated) {
        await course.save();
        console.log(`Updated course: ${course.courseName}`);
      }
    }

    console.log('All courses updated.');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error updating courses:', err);
    mongoose.connection.close();
  }
}

updateCourses();
