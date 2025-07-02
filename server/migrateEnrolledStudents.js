const mongoose = require("mongoose");
const Course = require("./models/Course"); // Adjust path as needed

const MONGO_URI = "mongodb+srv://savithasaviy:CourseCurriculum@coursecurriculum.jheiv9t.mongodb.net/?retryWrites=true&w=majority&appName=CourseCurriculum"; // Update this

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const courses = await Course.find();

  for (const course of courses) {
    let updated = false;
    const newEnrolledStudents = course.enrolledStudents.map((entry) => {
      // If entry is a plain ObjectId (i.e. not an object)
      if (mongoose.Types.ObjectId.isValid(entry) && typeof entry === "object" && !entry.student) {
        updated = true;
        return {
          student: entry,
          courseFee: 0,
          instructorCommission: 0,
          enrolledDate: new Date()
        };
      }
      return entry; // already in correct format
    });

    if (updated) {
      course.enrolledStudents = newEnrolledStudents;
      await course.save();
      console.log(`Updated course: ${course._id}`);
    }
  }

  console.log("Migration complete.");
  mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  mongoose.disconnect();
});
