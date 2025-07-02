//server/controllers/courseController.js


const Course = require('../models/Course');
const User = require('../models/User');
const Batch = require('../models/Batch');

exports.createCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllCourses = async (req, res) => {
  const courses = await Course.find()
  .populate('instructor', 'name email')
  .populate('enrolledStudents'); // Optional if only count is needed
res.json(courses);
};

exports.getInstructorCourses = async (req, res) => {
  const courses = await Course.find({ instructor: req.params.id });
  res.json(courses);
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Manually assign updates
    course.courseName = req.body.courseName || course.courseName;
    course.courseId = req.body.courseId || course.courseId;
    course.modules = req.body.modules || course.modules;

    const updated = await course.save();
    res.json(updated);
  } catch (err) {
    console.error('Update failed:', err);
    res.status(500).json({ message: 'Failed to update course', error: err.message });
  }
};

exports.enrollStudent = async (req, res) => {

  try {
    const { studentId, courseId, batchId} = req.body;
    console.log("Enrolling student:", { studentId, courseId, batchId });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (!Array.isArray(course.enrolledStudents)) course.enrolledStudents = [];

    const alreadyEnrolled = course.enrolledStudents.some(
      (entry) => entry.student?.toString?.() === studentId
    );

    if (!alreadyEnrolled) {
      course.enrolledStudents.push({
        student: studentId,
        batchId,
        enrolledDate: new Date()
      });
      await course.save();
    }

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (!student.enrolledCourses.includes(courseId)) {
      student.enrolledCourses.push(courseId);
      await student.save();
    }
    if (batchId) {
      const batch = await Batch.findById(batchId);
      if (!batch) return res.status(404).json({ message: 'Batch not found' });

      const isInBatch = batch.students.some(
        (sId) => sId.toString() === studentId
      );

      if (!isInBatch) {
        batch.students.push(studentId);
        await batch.save();
      }
    }

    res.json({ message: 'Student enrolled successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('enrolledStudents.student').lean();
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.addInstructor = async (req, res) => {
  const { courseId } = req.params;
  const { instructorId } = req.body;

  try {
    console.log("Course ID:", courseId);
    console.log("Instructor ID:", instructorId);

    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== 'instructor') {
      return res.status(404).json({ message: 'Instructor not found or invalid role' });
    }

    const course = await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { instructor: instructorId } }, // avoid duplicates
      { new: true }
    ).populate('instructor', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json({ message: 'Instructor added to course', course });
  } catch (err) {
    console.error("Error in addInstructor:", err); // 🛑 log the actual error
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

exports.removeInstructor = async (req, res) => {
  const { courseId } = req.params;
  const { instructorId } = req.body;

  try {
    const course = await Course.findByIdAndUpdate(
      courseId,
      { $pull: { instructor: instructorId } },
      { new: true }
    ).populate('instructor', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json({ message: 'Instructor removed from course', course });
  } catch (err) {
    console.error('Error removing instructor:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
