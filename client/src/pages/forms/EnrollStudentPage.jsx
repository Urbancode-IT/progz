import React, { useEffect, useState } from "react";
import API from "../../api/api";
import AdminDashboard from "../dashboards/AdminDashboard";
import { User, Book, Users, PlusCircle, ChevronDown, Check, X } from "react-feather";

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
      daysOfWeek: []
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
    updated[index].allBatches = batchRes.data;
    updated[index].batches = [];
    updated[index].instructorId = "";

    setEnrollments(updated);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...enrollments];
    updated[index][field] = value;

    if (field === "instructorId") {
      const allBatches = updated[index].allBatches || [];
      updated[index].batches = allBatches.filter(
        (b) => b.instructor?._id === value || b.instructor === value
      );
      updated[index].batchId = "";
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

  const removeCourseEnrollment = (index) => {
    if (enrollments.length <= 1) return;
    const updated = [...enrollments];
    updated.splice(index, 1);
    setEnrollments(updated);
  };

  const handleSubmit = async () => {
    if (!studentId) {
      alert("Please select a student first");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      for (const e of enrollments) {
        if (!e.courseId) {
          alert("Please select a course for all enrollment sections");
          return;
        }

        let finalBatchId = e.batchId;

        if (e.createNewBatch) {
          if (!e.batchName || !e.classTiming || !e.startDate || e.daysOfWeek.length === 0) {
            alert("Please fill all required fields for new batch creation");
            return;
          }

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
        } else if (!finalBatchId) {
          alert("Please select a batch or create a new one");
          return;
        }

        await API.put(
          `/progress/batch/${finalBatchId}/${e.courseId}`,
          {
            add: [studentId],
            remove: [],
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

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
      setStudentId("");
    } catch (error) {
      alert("Error enrolling student: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <AdminDashboard>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={24} className="text-purple-600" />
            Enroll a Student
          </h1>
        </div>

        {/* Student Selection Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <User size={20} />
            </div>
            <h2 className="text-lg font-medium text-gray-800">Student Information</h2>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Select Student</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">-- Select Student --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Course Enrollment Sections */}
        {enrollments.map((enroll, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-6 space-y-6 border border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Book size={20} />
                </div>
                <h2 className="text-lg font-medium text-gray-800">Course Enrollment #{idx + 1}</h2>
              </div>
              {enrollments.length > 1 && (
                <button 
                  onClick={() => removeCourseEnrollment(idx)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Course Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Course</label>
                <select
                  value={enroll.courseId}
                  onChange={(e) => handleCourseChange(idx, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Instructor</label>
                <select
                  value={enroll.instructorId}
                  onChange={(e) =>
                    handleInputChange(idx, "instructorId", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!enroll.courseId}
                >
                  <option value="">-- Select Instructor --</option>
                  {enroll.instructors.map((ins) => (
                    <option key={ins._id} value={ins._id}>
                      {ins.name} ({ins.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Batch Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Batch Assignment</label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={enroll.createNewBatch}
                    onChange={(e) =>
                      handleInputChange(idx, "createNewBatch", e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Create new batch</span>
                </label>
              </div>

              {!enroll.createNewBatch ? (
                <select
                  value={enroll.batchId}
                  onChange={(e) =>
                    handleInputChange(idx, "batchId", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!enroll.instructorId}
                >
                  <option value="">-- Select Batch --</option>
                  {enroll.batches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({b.classTiming})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Batch Name*</label>
                    <input
                      type="text"
                      placeholder="e.g. Morning Batch"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={enroll.batchName}
                      onChange={(e) =>
                        handleInputChange(idx, "batchName", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Class Timing*</label>
                    <input
                      type="text"
                      placeholder="e.g. 10:00 AM - 12:00 PM"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={enroll.classTiming}
                      onChange={(e) =>
                        handleInputChange(idx, "classTiming", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Start Date*</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={enroll.startDate}
                      onChange={(e) =>
                        handleInputChange(idx, "startDate", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Days of Week*</label>
                    <div className="flex flex-wrap gap-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const updated = [...enrollments];
                            const currentDays = updated[idx].daysOfWeek || [];
                            const fullDayMap = {
                              "Mon": "Monday",
                              "Tue": "Tuesday",
                              "Wed": "Wednesday",
                              "Thu": "Thursday",
                              "Fri": "Friday",
                              "Sat": "Saturday",
                              "Sun": "Sunday"
                            };
                            const fullDay = fullDayMap[day];

                            if (currentDays.includes(fullDay)) {
                              updated[idx].daysOfWeek = currentDays.filter(d => d !== fullDay);
                            } else {
                              updated[idx].daysOfWeek = [...currentDays, fullDay];
                            }

                            setEnrollments(updated);
                          }}
                          className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                            enroll.daysOfWeek?.includes(day === "Mon" ? "Monday" : 
                              day === "Tue" ? "Tuesday" :
                              day === "Wed" ? "Wednesday" :
                              day === "Thu" ? "Thursday" :
                              day === "Fri" ? "Friday" :
                              day === "Sat" ? "Saturday" : "Sunday")
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {enroll.daysOfWeek?.includes(day === "Mon" ? "Monday" : 
                            day === "Tue" ? "Tuesday" :
                            day === "Wed" ? "Wednesday" :
                            day === "Thu" ? "Thursday" :
                            day === "Fri" ? "Friday" :
                            day === "Sat" ? "Saturday" : "Sunday") && (
                            <Check size={14} />
                          )}
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={addCourseEnrollment}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            <PlusCircle size={16} />
            Add Another Course
          </button>
          
          <button
            onClick={handleSubmit}
            className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium flex items-center justify-center gap-2"
            disabled={!studentId}
          >
            Enroll Student
          </button>
        </div>
      </div>
    </AdminDashboard>
  );
};

export default EnrollStudentPage;