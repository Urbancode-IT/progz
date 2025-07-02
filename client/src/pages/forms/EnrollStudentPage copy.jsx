import React, { useEffect, useState } from "react";
import API from "../../api/api";
import AdminDashboard from "../dashboards/AdminDashboard";

const EnrollStudentPage = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [enrollments, setEnrollments] = useState([
    {
      courseId: "",
      instructors: [],
      instructorId: "",
      batches: [],
      batchId: "",
      createNewBatch: false,
      batchName: "",
      classTiming: "",
      startDate: "",
      daysOfWeek:[]
    },
  ]);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    const res = await API.get("/users/role/student");
    setStudents(res.data);
  };

  const fetchCourses = async () => {
    const res = await API.get("/courses");
    setCourses(res.data);
  };

  const handleCourseChange = async (index, courseId) => {
    const updated = [...enrollments];
    updated[index].courseId = courseId;

    const courseRes = await API.get(`/courses/${courseId}`);
    const course = courseRes.data;

    updated[index].instructors = course.instructor || [];
    

    const batchRes = await API.get(`/progress/batches/by-course/${courseId}`);
    updated[index].allBatches = batchRes.data; // Store all batches
    updated[index].batches = []; // Reset filtered batches for now
    updated[index].instructorId = ""; // Reset instructor selection

    setEnrollments(updated);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...enrollments];
    updated[index][field] = value;

    // If instructor is changed, filter batches
    if (field === "instructorId") {
      const allBatches = updated[index].allBatches || [];
      // updated[index].batches = allBatches.filter((b) => b.instructor === value);
      updated[index].batches = allBatches.filter(
        (b) => b.instructor?._id === value || b.instructor === value
      );

      updated[index].batchId = ""; // Clear previously selected batch
    }

    setEnrollments(updated);
  };

  const addCourseEnrollment = () => {
    setEnrollments([
      ...enrollments,
      {
        courseId: "",
        instructors: [],
        instructorId: "",
        batches: [],
        batchId: "",
        createNewBatch: false,
        batchName: "",
        classTiming: "",
        startDate: "",
        daysOfWeek: [],
      },
    ]);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    for (const e of enrollments) {
      let finalBatchId = e.batchId;

      // 1. If creating a new batch
      if (e.createNewBatch) {
        console.log("Submitting enrollment:", {
          studentId,
          courseId: e.courseId,
          batchId: finalBatchId,
        });
        const batchRes = await API.post(
          "/progress/batch",
          {
            name: e.batchName,
            courseId: e.courseId,
            instructor: e.instructorId,
            classTiming: e.classTiming,
            startDate: e.startDate,
            daysOfWeek: e.daysOfWeek,
            studentIds: [studentId],
            status: "active",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        finalBatchId = batchRes.data.batch._id;
      }
      else{
        console.log("Submitting enrollment:", studentId, finalBatchId, e.courseId);
      await API.put(
        `/progress/batch/${finalBatchId}/${e.courseId}`,
        {
          add: [studentId],
          remove: [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
    

      // 2. Enroll student
      await API.post(
        "/courses/enroll",
        {
          studentId,
          courseId: e.courseId,
          batchId: finalBatchId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    alert("Student enrolled successfully!");
    setEnrollments([
      {
        courseId: "",
        instructors: [],
        instructorId: "",
        batches: [],
        batchId: "",
        createNewBatch: false,
        batchName: "",
        classTiming: "",
        startDate: "",
        daysOfWeek: [],
      },
    ]);
  };

  return (
    <AdminDashboard>
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Enroll a Student</h1>

      {/* Select Student */}
      <div>
        <label className="block font-medium mb-1">Select Student</label>
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">-- Select Student --</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.email})
            </option>
          ))}
        </select>
      </div>

      {/* Enroll in Courses */}
      {enrollments.map((enroll, idx) => (
        <div key={idx} className="border p-4 rounded-lg bg-gray-50 space-y-4">
          <h2 className="text-lg font-semibold">Course #{idx + 1}</h2>

          {/* Course */}
          <div>
            <label className="block">Select Course</label>
            <select
              value={enroll.courseId}
              onChange={(e) => handleCourseChange(idx, e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">-- Select Course --</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseName}
                </option>
              ))}
            </select>
          </div>

          {/* Instructor Selection */}
          <div>
            <label className="block">Select Instructor</label>
            <select
              value={enroll.instructorId}
              onChange={(e) =>
                handleInputChange(idx, "instructorId", e.target.value)
              }
              className="w-full border p-2 rounded"
            >
              <option value="">-- Select Instructor --</option>
              {enroll.instructors.map((ins) => (
                <option key={ins._id} value={ins._id}>
                  {ins.name} ({ins.email})
                </option>
              ))}
            </select>
          </div>

          {/* Existing Batch */}
          <div>
            <label className="block">Assign to Batch</label>
            <select
              value={enroll.batchId}
              onChange={(e) =>
                handleInputChange(idx, "batchId", e.target.value)
              }
              className="w-full border p-2 rounded"
              disabled={enroll.createNewBatch}
            >
              <option value="">-- Select Batch --</option>
              {enroll.batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
            <label className="mt-2 block">
              <input
                type="checkbox"
                checked={enroll.createNewBatch}
                onChange={(e) =>
                  handleInputChange(idx, "createNewBatch", e.target.checked)
                }
              />{" "}
              Create new batch
            </label>
          </div>

          {/* New Batch Fields */}
          {enroll.createNewBatch && (
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Batch Name"
                className="border p-2 rounded"
                value={enroll.batchName}
                onChange={(e) =>
                  handleInputChange(idx, "batchName", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Class Timing (e.g. 10:00 AM - 12:00 PM)"
                className="border p-2 rounded"
                value={enroll.classTiming}
                onChange={(e) =>
                  handleInputChange(idx, "classTiming", e.target.value)
                }
              />
              <input
                type="date"
                placeholder="Start Date"
                className="border p-2 rounded"
                value={enroll.startDate}
                onChange={(e) =>
                  handleInputChange(idx, "startDate", e.target.value)
                }
              />
              <input
                type="date"
                placeholder="End Date (optional)"
                className="border p-2 rounded"
                value={enroll.endDate || ""}
                onChange={(e) =>
                  handleInputChange(idx, "endDate", e.target.value)
                }
              />
              <div className="col-span-2">
  <label className="block font-medium mb-1">Days of Week</label>
  <div className="grid grid-cols-4 gap-2">
    {[
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ].map((day) => (
      <label key={day} className="flex items-center space-x-1">
       <input
  type="checkbox"
  checked={enroll.daysOfWeek?.includes(day)}
  onChange={(e) => {
    const updated = [...enrollments];
    const currentDays = updated[idx].daysOfWeek || [];

    if (e.target.checked) {
      // Add the day if not already in the array
      if (!currentDays.includes(day)) {
        updated[idx].daysOfWeek = [...currentDays, day];
      }
    } else {
      // Remove the day
      updated[idx].daysOfWeek = currentDays.filter((d) => d !== day);
    }

    setEnrollments(updated);
  }}
/>

        <span>{day}</span>
      </label>
    ))}
  </div>
</div>

            </div>
          )}
        </div>
      ))}

      <button
        className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        onClick={addCourseEnrollment}
      >
        + Add Another Course
      </button>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
      >
        Enroll Student
      </button>
    </div>
    </AdminDashboard>
  );
};

export default EnrollStudentPage;
