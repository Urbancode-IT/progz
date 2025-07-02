//server/controllers/progressController.js
// controllers/progressController.js
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Batch = require('../models/Batch');
const mongoose = require('mongoose');

exports.updateCourseCompletionStatus = async (courseId) => {
  try {
    const course = await Course.findById(courseId).lean();
    if (!course) throw new Error('Course not found');

    const updatedStatuses = [];

    for (const enrollment of course.enrolledStudents) {
      const progress = await Progress.findOne({
        course: courseId,
        student: enrollment.student
      });

      const isComplete = progress?.sectionProgress?.length > 0 &&
        progress.sectionProgress.every(sec => sec.isCompleted);

      updatedStatuses.push({
        studentId: enrollment.student.toString(),
        courseCompleted: isComplete
      });
    }

    // Update course document using bulk update on embedded array
    const courseDoc = await Course.findById(courseId);
    for (let status of updatedStatuses) {
      const index = courseDoc.enrolledStudents.findIndex(enr =>
        enr.student.toString() === status.studentId
      );
      if (index !== -1) {
        courseDoc.enrolledStudents[index].courseCompleted = status.courseCompleted;
      }
    }

    await courseDoc.save();
    return { success: true, updatedCount: updatedStatuses.length };
  } catch (err) {
    console.error('Error updating course completion:', err.message);
    throw err;
  }
};

exports.updateSectionCompletion = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { moduleIndex, sectionIndex, isCompleted } = req.body;

    let progress = await Progress.findOne({ student: studentId, course: courseId });

    if (!progress) {
      // Create new record if not exists
      progress = new Progress({
        student: studentId,
        course: courseId,
        sectionProgress: [{ moduleIndex, sectionIndex, isCompleted, completionTime: isCompleted ? new Date() : null }],
      });
    } else {
      // Update existing entry or push new one
      const existing = progress.sectionProgress.find(
        (sp) => sp.moduleIndex === moduleIndex && sp.sectionIndex === sectionIndex
      );

      if (existing) {
        existing.isCompleted = isCompleted;
        existing.completionTime = isCompleted ? new Date() : null;
      } else {
        progress.sectionProgress.push({ moduleIndex, sectionIndex, isCompleted, completionTime: isCompleted ? new Date() : null });
      }
    }

    await progress.save();
    // Update course completion status for this student
    await exports.updateCourseCompletionStatus(courseId);
    res.json({ message: "Progress updated", progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update progress" });
  }
};

exports.getStudentProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    console.log("Fetching progress for student:", studentId, "course:", courseId);

    const course = await Course.findById(courseId)
      .populate('instructor', 'name')
      .lean();

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    let progress = await Progress.findOne({ student: studentId, course: courseId })
      .populate('student', 'name email')
      .lean();

    if (!progress) {
      const sectionProgress = [];

      course.modules.forEach((mod, modIdx) => {
        mod.sections.forEach((sec, secIdx) => {
          sectionProgress.push({
            moduleIndex: modIdx,
            sectionIndex: secIdx,
            isCompleted: false,
            completionTime: null
          });
        });
      });

      const newProgress = new Progress({
        student: studentId,
        course: courseId,
        sectionProgress
      });

      await newProgress.save();

      progress = await Progress.findOne({ student: studentId, course: courseId })
        .populate('student', 'name email')
        .lean();
    }

    const studentName = progress.student.name;
    const studentEmail = progress.student.email;

    const modulesWithProgress = course.modules.map((module, modIdx) => ({
      title: module.title,
      description: module.description,
      sections: module.sections.map((section, secIdx) => {
        const completedSection = progress.sectionProgress.find(
          (sp) => sp.moduleIndex === modIdx && sp.sectionIndex === secIdx
        );
        return {
          sectionName: section.sectionName,
          learningMaterialNotes: section.learningMaterialNotes || '',
          learningMaterialUrls: section.learningMaterialUrls || [],
          codeChallengeInstructions: section.codeChallengeInstructions || '',
          codeChallengeUrls: section.codeChallengeUrls || [],
          videoReferences: section.videoReferences || [],
          isCompleted: completedSection?.isCompleted || false,
          completionTime: completedSection?.completionTime || null
        };
      }),
    }));

    res.json({
      courseName: course.courseName,
      instructor: course.instructor.name,
      student: {
        name: studentName,
        email: studentEmail,
      },
      modules: modulesWithProgress,
    });

  } catch (err) {
    console.error('Error in getStudentProgress:', err);
    res.status(500).json({ message: 'Failed to fetch student progress' });
  }
};


// exports.getStudentProgress = async (req, res) => {
//   try {
//     const { studentId, courseId } = req.params;
//     console.log("Fetching progress for student:", studentId, "course:", courseId);

//     const course = await Course.findById(courseId).populate('instructor', 'name').lean();
//     if (!course) {
//       console.log("Course not found");
//       return res.status(404).json({ message: 'Course not found' });
//     }

//     // Populate student name and email when fetching progress
//     const progress = await Progress.findOne({ student: studentId, course: courseId })
//       .populate('student', 'name email')
//       .lean();

//     if (!progress) {
//         const sectionProgress = [];

//         course.modules.forEach((mod, modIdx) => {
//           mod.sections.forEach((sec, secIdx) => {
//             sectionProgress.push({
//               moduleIndex: modIdx,
//               sectionIndex: secIdx,
//               isCompleted: false
//             });
//           });
//         });

//         const newProgress = new Progress({
//           student: studentId,
//           course: courseId,
//           sectionProgress
//         });

//         await newProgress.save();
//         const progress = await Progress.findOne({ student: studentId, course: courseId })
//       .populate('student', 'name email')
//       .lean();
      
//       }
//       console.log("Progress data:", progress);
//     const studentName =  progress.student.name;
//     const studentEmail = progress.student.email;

//     // Reconstruct modules with progress status
//     const modulesWithProgress = course.modules.map((module, modIdx) => ({
//       title: module.title,
//       description: module.description,
//       sections: module.sections.map((section, secIdx) => {
//         const completedSection = progress.sectionProgress.find(
//           (sp) => sp.moduleIndex === modIdx && sp.sectionIndex === secIdx
//         );
//         return {
//           sectionName: section.sectionName,
//           notes: section.notes,
//           task: section.task,
//           isCompleted: completedSection?.isCompleted || false,
//         };
//       }),
//     }));

//     res.json({
//       courseName: course.courseName,
//       instructor: course.instructor.name,
//       student: {
//         name: studentName,
//         email: studentEmail,
//       },
//       modules: modulesWithProgress,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to fetch student progress' });
//   }
// };
exports.getCourseProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    console.log("Fetching course progress for", studentId, courseId);

    const course = await Course.findById(courseId)
      .populate('instructor', 'name')
      .populate('enrolledStudents', 'name email');

    if (!course) return res.status(404).json({ message: "Course not found" });

    const totalSections = course.modules.reduce(
      (total, mod) => total + mod.sections.length,
      0
    );

    // Ensure every enrolled student has a Progress entry
    for (const student of course.enrolledStudents) {
      const existing = await Progress.findOne({ student: student._id, course: courseId });

      if (!existing) {
        const sectionProgress = [];

        course.modules.forEach((mod, modIdx) => {
          mod.sections.forEach((sec, secIdx) => {
            sectionProgress.push({
              moduleIndex: modIdx,
              sectionIndex: secIdx,
              isCompleted: false
            });
          });
        });

        const newProgress = new Progress({
          student: student._id,
          course: courseId,
          sectionProgress
        });
        await newProgress.save();
      }
    }

    // Fetch updated progress list
    const progressData = await Progress.find({ course: courseId }).populate('student', 'name email');

    res.json({
      courseInfo: {
        name: course.courseName,
        instructor: course.instructor.name,
        totalStudents: course.enrolledStudents.length
      },
      progress: progressData.map(p => ({
        student: p.student,
        completedSections: p.sectionProgress.filter(sp => sp.isCompleted).length,
        totalSections,
        lastActivity: p.updatedAt
      }))
    });
  } catch (err) {
    console.error("Error in getCourseProgress:", err);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.updateSectionProgress = async (req, res) => {
  try {
    const { studentId, courseId, moduleIndex, sectionIndex, isCompleted } = req.body;

    const progress = await Progress.findOne({ student: studentId, course: courseId });
    if (!progress) {
      return res.status(404).json({ message: "Progress record not found" });
    }

    // Ensure indexes exist
    if (
      !progress.modules[moduleIndex] ||
      !progress.modules[moduleIndex].sections[sectionIndex]
    ) {
      return res.status(400).json({ message: "Invalid module or section index" });
    }

    // Update isCompleted status as passed in request
    progress.modules[moduleIndex].sections[sectionIndex].isCompleted = isCompleted;

    await progress.save();

    res.status(200).json({ message: "Section progress updated", isCompleted });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




exports.getStudentCourseProgress = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate('instructor', 'name');
    
    const progress = await Progress.findOne({
      student: req.params.studentId,
      course: req.params.courseId
    });

    const enhancedModules = course.modules.map((module, moduleIndex) => ({
      ...module.toObject(),
      sections: module.sections.map((section, sectionIndex) => {
        const isCompleted = progress?.sectionProgress.some(
          sp => sp.moduleIndex === moduleIndex && 
                sp.sectionIndex === sectionIndex && 
                sp.isCompleted
        );
        return {
          ...section.toObject(),
          isCompleted,
          moduleIndex,
          sectionIndex
        };
      })
    }));

    res.json({
      courseName: course.courseName,
      instructor: course.instructor.name,
      modules: enhancedModules,
      overallProgress: progress ? 
        (progress.sectionProgress.filter(sp => sp.isCompleted).length / 
         course.modules.reduce((total, m) => total + m.sections.length, 0)) * 100 : 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.getBatchesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const batches = await Batch.find({ course: courseId })
      .populate('instructor', 'name email') // populate instructor info
      .populate('students', 'name email')   // populate student info
      .populate('course', 'courseName');    // optional: include course name

    res.status(200).json(batches);
  } catch (error) {
    console.error("Error fetching batches by course:", error);
    res.status(500).json({ message: "Failed to fetch batches for course" });
  }
};


// body: { add: [ids], remove: [ids] }
exports.updateBatchStudents = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { add = [], remove = [] } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    // Add students
    for (const studentId of add) {
      if (!batch.students.includes(studentId)) {
        batch.students.push(studentId);
      }
    }

    // Remove students
    batch.students = batch.students.filter((id) => !remove.includes(id.toString()));

    await batch.save();

    const updatedBatch = await Batch.findById(batchId).populate('students', 'name email');
    res.json({ message: 'Batch updated', batch: updatedBatch });
  } catch (err) {
    console.error('Error updating batch students:', err);
    res.status(500).json({ message: 'Failed to update batch' });
  }
};

exports.getInstructorBatches = async (req, res) => {
  try {
    const { instructorId } = req.params;

    const batches = await Batch.find({ instructor: { $in: [instructorId] } })
      .populate('course', 'courseName')
      .populate('students', 'name email');

    res.json({ batches });
  } catch (err) {
    console.error("Error fetching instructor's batches:", err);
    res.status(500).json({ message: 'Failed to fetch batches' });
  }
};

 exports.getBatches =  async (req,res) =>{
  try {
    const batches = await Batch.find()
      .populate('course', 'courseName')
      .populate('instructor', 'name email')
      .populate('students', 'name email');
    res.json(batches);
    console.log("Fetched batches:", batches);
  } catch (err) {
    console.error('Error fetching batches:', err);
    res.status(500).json({ message: 'Server error fetching batches' });
  }
 };
exports.createBatch = async (req, res) => {
  console.log("Incoming batch create request:", req.body);
  try {
    const {
      name,
      courseId,
      studentIds,
      instructor,
      classTiming,
      startDate,
      daysOfWeek,
      status
    } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ message: 'Missing batch name' });
    }
    if (!courseId) {
      return res.status(400).json({ message: 'Missing courseId' });
    }
    if (!instructor || (Array.isArray(instructor) && instructor.length === 0)) {
      return res.status(400).json({ message: 'Missing instructor(s)' });
    }
    if (!classTiming) {
      return res.status(400).json({ message: 'Missing class timing' });
    }
    if (!startDate ) {
      return res.status(400).json({ message: 'Missing start or end date' });
    }
    if (!daysOfWeek || !Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
      return res.status(400).json({ message: 'Missing or invalid days of week' });
    }
    const instructorArray = Array.isArray(instructor) ? instructor : [instructor];

    const batch = new Batch({
      name,
      course: courseId,
      students: studentIds,
      instructor: instructorArray,
      classTiming,
      startDate,
      daysOfWeek,
      status: status || 'active'
    });

    await batch.save();
    res.status(201).json({ message: 'Batch created', batch });
  } catch (err) {
    console.error('Error creating batch:', err);
    res.status(500).json({ message: 'Failed to create batch' });
  }
};

exports.getBatchById = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await Batch.findById(batchId)
      .populate('students', 'name email')        // include student names and emails
      .populate('instructor', 'name email')      // instructor info
      .populate('course');                       // full course details including modules/sections

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    res.status(200).json(batch);
  } catch (error) {
    console.error("Error fetching batch:", error);
    res.status(500).json({ message: "Failed to fetch batch" });
  }
};

exports.addStudentToBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { studentId } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    if (batch.students.includes(studentId)) {
      return res.status(400).json({ message: "Student already in batch" });
    }

    batch.students.push(studentId);
    await batch.save();

    res.status(200).json({ message: "Student added to batch", batch });
  } catch (error) {
    console.error("Error adding student to batch:", error);
    res.status(500).json({ message: "Failed to add student to batch" });
  }
};

exports.removeStudentFromBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { studentId } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    batch.students = batch.students.filter(id => id.toString() !== studentId);
    await batch.save();

    res.status(200).json({ message: "Student removed from batch", batch });
  } catch (error) {
    console.error("Error removing student from batch:", error);
    res.status(500).json({ message: "Failed to remove student from batch" });
  }
};
