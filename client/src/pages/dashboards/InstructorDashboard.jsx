import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import logo from "../../assets/icon.png";
const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [instructor, setInstructor] = useState(null);
  const [quote, setQuote] = useState("");
  const [batches, setBatches] = useState([]);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showBatchForm, setShowBatchForm] = useState(false);
const [newBatch, setNewBatch] = useState({
  name: "",
  courseId: "",
  classTiming: "",
  startDate: "",
  daysOfWeek: [],
});


  // Motivational quotes
  const quotes = [
    "Teaching is the greatest act of optimism. - Colleen Wilcox",
    "The art of teaching is the art of assisting discovery. - Mark Van Doren",
    "Education is not the filling of a pail, but the lighting of a fire. - W.B. Yeats",
    "A good teacher can inspire hope, ignite the imagination, and instill a love of learning. - Brad Henry",
    "Teachers have three loves: love of learning, love of learners, and the love of bringing the first two loves together. - Scott Hayden",
  ];
 useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
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
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  }

  if (error) {
    return (
      <div className="min-h-screen border-t bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-gray-200">
          <div className="text-red-600 font-medium text-lg mb-4">{error}</div>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

 

  return (
    <div className="min-h-screen bg-[url('/cover2.jpg')] bg-cover bg-center bg-gray-50 font-sans">
      <header className="bg-gradient-to-b from-indigo-300 to-gray-100 border-t mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-3 sm:gap-0">
            <div className="flex items-center gap-4 cursor-pointer" >
              <img
                src={logo}
                alt="Logo"
                className="h-10 w-10 rounded-lg object-contain"
                onClick={() => navigate("/instructor")}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  ProgZ
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span>Instructor Dashboard</span>
                  <span className="hidden md:inline">•</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block px-3 py-1.5 text-gray-600 rounded-full text-sm font-medium">
                <span className="hidden md:inline">
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <br />
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
       
          <div className="">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <p className="text-center text-sm text-gray-500 ">
                <h1 className="text-2xl md:text-2xl ">
                  Welcome back, {instructor || "Instructor"}
                </h1>
                <p className="text-gray-800 mt-1 italic text-black/90">
                  Here's what's happening with your courses today
                </p>
              </p>
            </div>
          </div>
        
      </header>
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats Section - Softer colors with better blending */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/80 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center">
              <div className="bg-emerald-50/80 rounded-lg p-3 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-emerald-600"
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
                <p className="text-sm font-medium text-gray-600">
                  Total Courses
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {courses.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/80 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center">
              <div className="bg-sky-50/80 rounded-lg p-3 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-sky-600"
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
                <p className="text-sm font-medium text-gray-600">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {courses.reduce(
                    (acc, course) =>
                      acc + (course.enrolledStudents?.length || 0),
                    0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/80 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center">
              <div className="bg-violet-50/80 rounded-lg p-3 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-violet-600"
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
                <p className="text-sm font-medium text-gray-600">
                  Total Modules
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {courses.reduce(
                    (acc, course) => acc + (course.modules?.length || 0),
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section - Muted colors with better contrast */}
        <div className="bg-white/40 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/80 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-indigo-50/80">
            <h2 className="text-xl font-bold text-gray-800">My Courses</h2>
            <span className="text-sm text-gray-600">
              Showing {courses.length} course{courses.length !== 1 ? "s" : ""}
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300/80"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">
                        {course.courseName}
                      </h3>
                      <span className="bg-gray-100/80 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {course.enrolledStudents?.length || 0} students
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
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
                        {course.modules?.length || 0} modules
                      </span>
                      <span className="bg-gray-100/80 px-2 py-1 rounded text-xs">
                        {course.courseId}
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/view-course/${course._id}`)}
                      className="w-full flex items-center justify-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
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
              <h3 className="mt-2 text-lg font-medium text-gray-800">
                No courses yet
              </h3>
              <p className="mt-1 text-gray-600 mb-6">
                Get started by creating your first course.
              </p>
              <button
                onClick={() => navigate("/create-course")}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Create Course
              </button>
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 p-6">
            <button
              onClick={() => navigate("/create-course")}
              className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
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
              Add New Course
            </button>
          </div>
        </div>

        {/* Batches Section - Consistent styling */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/80 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-indigo-50/80">
            <h2 className="text-xl font-bold text-gray-800">My Batches</h2>
            <button
              onClick={() => setShowBatchForm(true)}
              className="mt-2 px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              + Create New Batch
            </button>
            <button
              onClick = {() => navigate('/admin/create-enrollment')}
              className="mt-2 px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Enroll a student
            </button>
          </div>  

          {batches.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                    >
                      Batch Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                    >
                      Course
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                    >
                      Timing
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                    >
                      Start Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                    >
                      Days
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {batches.map((batch) => (
                    <tr key={batch._id} className="hover:bg-gray-50/80">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-800">
                          {batch.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {batch.course?.courseName || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {batch.classTiming}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {new Date(batch.startDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {batch.daysOfWeek.join(", ")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            batch.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {batch.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a
                          href={`/view-batch/${batch._id}`}
                          className="text-sky-600 hover:text-sky-800 hover:underline"
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-800">
                No batches assigned
              </h3>
              <p className="mt-1 text-gray-600">
                You don't have any batches assigned to you yet.
              </p>
            </div>
          )}
        </div>
        
        <button
          onClick={handleLogout}
          className="my-6 px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors w-full sm:w-auto"
          title="Go to Home"
        >
          Logout
        </button>
      </div>
      
      {/* Batch form modal remains unchanged */}
    </div>
  );
};

export default InstructorDashboard;
