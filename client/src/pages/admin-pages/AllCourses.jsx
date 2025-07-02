import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "../dashboards/AdminDashboard";
import {
  Search,
  PlusCircle,
  Users,
  Edit2,
  Eye,
  Trash2,
  X,
} from "react-feather";

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedInstructorId, setSelectedInstructorId] = useState("");
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [sortOption, setSortOption] = useState(""); // "" | "name-asc" | "name-desc" | "enrolled-asc" | "enrolled-desc"
  const [onlyWithEnrollments, setOnlyWithEnrollments] = useState(false);


  const handleSync = async () => {
    setSyncLoading(true);
    setSyncStatus("");
    try {
      const res = await API.get("/sync/courses");
      setSyncStatus(res.data.message || "Courses synced");
    } catch (err) {
      setSyncStatus("Sync failed");
      console.error(err);
    } finally {
      setSyncLoading(false);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/courses");
      setCourses(data);
      setFilteredCourses(data);
    } catch (err) {
      setError("Failed to load courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const { data } = await API.get("/users/role?role=instructor");
      setInstructors(data);
    } catch {
      setInstructors([]);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

  const handleSearch = (term) => {
  setSearchTerm(term);
  filterCourses(term, selectedInstructor, onlyWithEnrollments);
};

const handleInstructorFilter = (id) => {
  setSelectedInstructor(id);
  filterCourses(searchTerm, id, onlyWithEnrollments);
};

  const openManageModal = (course) => {
  setSelectedCourse(course);
  setSelectedInstructorId(""); // ✅ reset instructor dropdown
  setShowModal(true);
};

  const closeModal = () => {
  setSelectedCourse(null);
  setSelectedInstructorId("");
  setShowModal(false);

  // Reapply filters and sorting
  filterCourses(searchTerm, selectedInstructor, onlyWithEnrollments);
};

  const handleAddInstructor = async () => {
  if (!selectedInstructorId) return;
  try {
    await API.put(`/courses/${selectedCourse._id}/add-instructor`, {
      instructorId: selectedInstructorId,
    });
    const updated = await API.get(`/courses/${selectedCourse._id}`);
    setSelectedCourse(updated.data); // ✅ update modal data
    fetchCourses(); // ✅ update list
    setSelectedInstructorId(""); // ✅ clear dropdown
  } catch (err) {
    setError("Failed to add instructor. Please try again.");
  }
};

  const handleRemoveInstructor = async (instructorId) => {
  try {
    await API.put(`/courses/${selectedCourse._id}/remove-instructor`, {
      instructorId,
    });
    const updated = await API.get(`/courses/${selectedCourse._id}`);
    setSelectedCourse(updated.data);
    fetchCourses();
  } catch (err) {
    setError("Failed to remove instructor. Please try again.");
  }
};


 const filterCourses = (term, instructorId, withEnrollments = onlyWithEnrollments) => {
  let result = [...courses];

  if (term) {
    result = result.filter(
      (course) =>
        course.courseName.toLowerCase().includes(term.toLowerCase()) ||
        course.courseId.toLowerCase().includes(term.toLowerCase()) ||
        course.instructor?.some((i) =>
          i.name?.toLowerCase().includes(term.toLowerCase())
        )
    );
  }

  if (instructorId) {
    result = result.filter((course) =>
      course.instructor?.some((i) => i._id === instructorId)
    );
  }

  if (withEnrollments) {
    result = result.filter((course) => course.enrolledStudents?.length > 0);
  }

  setFilteredCourses(result);
  setCurrentPage(1);
};


  const handleSort = (option) => {
  setSortOption(option);
  let sorted = [...filteredCourses];

  switch (option) {
    case "name-asc":
      sorted.sort((a, b) => a.courseName.localeCompare(b.courseName));
      break;
    case "name-desc":
      sorted.sort((a, b) => b.courseName.localeCompare(a.courseName));
      break;
    case "enrolled-asc":
      sorted.sort((a, b) => (a.enrolledStudents?.length || 0) - (b.enrolledStudents?.length || 0));
      break;
    case "enrolled-desc":
      sorted.sort((a, b) => (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0));
      break;
    default:
      break;
  }

  setFilteredCourses(sorted);
  setCurrentPage(1);
};


  // const handleDelete = async (courseId) => {
  //   if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
  //   try {
  //     await API.delete(`/courses/${courseId}`);
  //     const updated = courses.filter((c) => c._id !== courseId);
  //     setCourses(updated);
  //     filterCourses(searchTerm, selectedInstructor);
  //   } catch {
  //     setError('Failed to delete course. Please try again.');
  //   }
  // };

  const handleEdit = (id) => navigate(`/edit-course/${id}`);
  const handleView = (id) => navigate(`/view-course/${id}`);

  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  if (loading)
    return (
      <AdminDashboard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200"></div>
            <div className="text-gray-600">Loading courses...</div>
          </div>
        </div>
      </AdminDashboard>
    );

  if (error)
    return (
      <AdminDashboard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-md max-w-md text-center">
            <div className="text-red-500 font-medium mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </AdminDashboard>
    );

  return (
    <AdminDashboard>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Course Management
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredCourses.length}{" "}
                {filteredCourses.length === 1 ? "course" : "courses"} found
              </p>
            </div>
            <button
              onClick={() => navigate("/create-course")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <PlusCircle size={18} />
              Create New Course
            </button>
            <button
              onClick={handleSync}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={syncLoading}
            >
              {syncLoading ? "Syncing..." : "Sync Courses"}
            </button>
            {syncStatus && (
              <p className="mt-2 text-sm text-gray-700">{syncStatus}</p>
            )}
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
  <input
    type="checkbox"
    checked={onlyWithEnrollments}
    onChange={(e) => {
      setOnlyWithEnrollments(e.target.checked);
      filterCourses(searchTerm, selectedInstructor, e.target.checked);
    }}
    className="form-checkbox h-4 w-4 text-blue-600"
  />
  <span> Live Courses</span>
</label>

              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              

              <select
                value={selectedInstructor}
                onChange={(e) => handleInstructorFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Instructors</option>
                {instructors.map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.name}
                  </option>
                ))}
              </select>
              <select
  value={sortOption}
  onChange={(e) => handleSort(e.target.value)}
  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
>
  <option value="">Sort By</option>
  <option value="name-asc">Name A-Z</option>
  <option value="name-desc">Name Z-A</option>
  <option value="enrolled-asc">Enrolled: Low to High</option>
  <option value="enrolled-desc">Enrolled: High to Low</option>
</select>

            </div>
          </div>

          {/* Courses Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {paginatedCourses.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Course
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Instructor(s)
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Enrolled
                        </th>

                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedCourses.map((course) => (
                        <tr
                          key={course._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                                {course.courseName.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {course.courseName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {course.courseId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {course.instructor
                                ?.map((i) => i.name)
                                .join(", ") || "Not assigned"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                course.enrolledStudents?.length > 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {course.enrolledStudents?.length || 0}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => handleView(course._id)}
                                className="text-blue-500 hover:text-blue-900"
                                title="View"
                              >
                                <Eye size={18} />
                                View
                              </button>
                              <button
                                onClick={() => handleEdit(course._id)}
                                className="text-yellow-400 hover:text-yellow-900"
                                title="Edit"
                              >
                                <Edit2 size={18} />
                                Edit
                              </button>
                              <button
                                onClick={() => openManageModal(course)}
                                className="text-purple-500 hover:text-purple-700"
                                title="Manage Instructors"
                              >
                                <Users size={18} />
                                Manage Instructor
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredCourses.length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {filteredCourses.length}
                      </span>{" "}
                      courses
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 border rounded-md text-sm font-medium ${
                                currentPage === pageNum
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white text-gray-700"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-400">
                  <BookOpen size={24} className="mx-auto" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No courses found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedInstructor
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by creating a new course."}
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => navigate("/create-course")}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                    New Course
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Manage Instructor Modal */}
        {showModal && selectedCourse && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto">
            <div className="fixed inset-0 bg-gray-500 opacity-75"></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-[100000]">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Manage Instructors
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedCourse.courseName}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add New Instructor
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={selectedInstructorId}
                      onChange={(e) => setSelectedInstructorId(e.target.value)}
                    >
                      <option value="">Select an instructor</option>
                      {instructors.map((ins) => (
                        <option key={ins._id} value={ins._id}>
                          {ins.name} ({ins.email})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddInstructor}
                      disabled={!selectedInstructorId}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Instructors
                  </label>
                  {selectedCourse.instructor?.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {selectedCourse.instructor?.map((ins) => (
                        <li
                          key={ins._id}
                          className="py-3 flex justify-between items-center"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {ins.name}
                            </p>
                            <p className="text-sm text-gray-500">{ins.email}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveInstructor(ins._id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No instructors assigned to this course.
                    </p>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboard>
  );
};

export default AllCourses;
