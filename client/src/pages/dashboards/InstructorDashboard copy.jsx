import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [instructor, setInstructor] = useState(null);
  const [quote, setQuote] = useState("");
  const [batches, setBatches] = useState([]);
  const navigate = useNavigate();

  // Motivational quotes
  const quotes = [
    "Teaching is the greatest act of optimism. - Colleen Wilcox",
    "The art of teaching is the art of assisting discovery. - Mark Van Doren",
    "Education is not the filling of a pail, but the lighting of a fire. - W.B. Yeats",
    "A good teacher can inspire hope, ignite the imagination, and instill a love of learning. - Brad Henry",
    "Teachers have three loves: love of learning, love of learners, and the love of bringing the first two loves together. - Scott Hayden",
  ];
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const userString = localStorage.getItem("user");
        if (!userString) {
          navigate("/");
          return;
        }

        const user = JSON.parse(userString);
        const token = localStorage.getItem("token");
        const res = await API.get(`/progress/batches/instructor/${user._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Batches fetched:", res.data.batches);
        setBatches(res.data.batches || []);
      } catch (err) {
        console.error("Error fetching batches:", err);
        setBatches([]);
      }
    };
    fetchBatches();
  }, [navigate]);

  useEffect(() => {
    // Set random quote
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const userString = localStorage.getItem("user");
        if (!userString) {
          navigate("/");
          return;
        }

        const user = JSON.parse(userString);
        const token = localStorage.getItem("token");

        setInstructor(user.name);
        const response = await API.get(`/courses/instructor/${user._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCourses(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch courses");
        console.error("Error fetching courses:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto">
          <div className="text-red-600 font-medium">{error}</div>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-gray text-black rounded-lg  transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }
  console.log(batches);
  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="bg-white px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-black font-serif">
                  Welcome, {instructor || "Instructor"}
                </h1>
                <p className="text-gray-700 mt-1 font-light">
                  Instructor Dashboard
                </p>
              </div>
              <button
                onClick={() => navigate("/")}
                className="text-black hover:text-gray-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="p-6 bg-white border-b border-black">
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <p className="text-gray-700 italic">"{quote}"</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="border border-black rounded-xl shadow-lg p-6 text-black">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-50 rounded-full p-3 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Total Courses</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
            </div>
          </div>

          <div className=" border border-black rounded-xl shadow-lg p-6 text-black">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-50 rounded-full p-3 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Total Students</p>
                <p className="text-2xl font-bold">
                  {courses.reduce(
                    (acc, course) =>
                      acc + (course.enrolledStudents?.length || 0),
                    0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="border border-black rounded-xl shadow-lg p-6 text-black">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-50 rounded-full p-3 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Total Modules</p>
                <p className="text-2xl font-bold">
                  {courses.reduce(
                    (acc, course) => acc + (course.modules?.length || 0),
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">My Courses</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <svg
                className="animate-spin h-12 w-12 text-[#C3F5EB]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className=" border-l-2 border-black rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {course.courseName}
                      </h3>
                      <span className="bg-white text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {course.enrolledStudents?.length || 0} students
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{course.modules?.length || 0} modules</span>
                      <span>{course.courseId}</span>
                    </div>

                    <button
                      onClick={() => navigate(`/view-course/${course._id}`)}
                      className="w-full flex items-center justify-center px-4 py-2 border border-black text-black rounded-lg transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Manage Course
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No courses yet
              </h3>
              <p className="mt-1 text-gray-500 mb-6">
                Get started by creating your first course.
              </p>
              <button
                onClick={() => navigate("/admin/create-course")}
                className="px-4 py-2  text-black rounded-lg hover:bg-[#a8e6d9] transition-colors"
              >
                Create Course
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => navigate("/admin/create-course")}
              className="flex items-center px-4 py-2 bg-white border text-black rounded-lg shadow  transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              New Course
            </button>
          </div>
        </div>
      </div>
      {/*Batches*/}
      <div className="p-4">
        {Array.isArray(batches) && batches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-300 rounded-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2 border-b">Batch Name</th>
                  <th className="text-left p-2 border-b">Course</th>
                  <th className="text-left p-2 border-b">Class Timing</th>
                  <th className="text-left p-2 border-b">Start Date</th>
                  <th className="text-left p-2 border-b">Days</th>
                  <th className="text-left p-2 border-b">Status</th>
                  <th className="text-left p-2 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch._id} className="hover:bg-gray-50">
                    <td className="p-2 border-b font-medium text-blue-600">
                      {batch.name}
                    </td>
                    <td className="p-2 border-b">
                      {batch.course?.courseName || "N/A"}
                    </td>
                    <td className="p-2 border-b">{batch.classTiming}</td>
                    <td className="p-2 border-b">
                      {new Date(batch.startDate).toLocaleDateString()}
                    </td>
                    <td className="p-2 border-b">
                      {batch.daysOfWeek.join(", ")}
                    </td>
                    <td
                      className={`p-2 border-b font-semibold ${
                        batch.status === "active"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {batch.status}
                    </td>
                    <td className="p-2 border-b">
                      <a
                        href={`/view-batch/${batch._id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        View Details
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-6">
            No batches found for this instructor.
          </p>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
