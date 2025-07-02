import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import AdminDashboard from "../dashboards/AdminDashboard";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Select from "react-select";

const AllInstructor = () => {
  const [instructors, setInstructors] = useState([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");

  const handleSync = async () => {
    setSyncLoading(true);
    setSyncStatus("");
    try {
      const res = await API.get("/sync/instructors");
      setSyncStatus(res.data.message || "Sync successful");
    } catch (err) {
      setSyncStatus("Sync failed");
      console.error(err);
    } finally {
      setSyncLoading(false);
    }
  };

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/users/role?role=instructor");
      setInstructors(data);
      setFilteredInstructors(data);
    } catch (err) {
      toast.error("Failed to load instructors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await API.get("/courses");
      setCourses(
        data.map((course) => ({ value: course._id, label: course.name }))
      );
    } catch {
      toast.error("Failed to load courses");
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    filterInstructors(term, selectedCourse?.value);
  };

  const filterInstructors = (term, courseId) => {
    let filtered = [...instructors];
    if (term) {
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(term.toLowerCase()) ||
          i.email.toLowerCase().includes(term.toLowerCase()) ||
          (i.instructorId &&
            i.instructorId.toLowerCase().includes(term.toLowerCase()))
      );
    }
    if (courseId) {
      filtered = filtered.filter((i) => i.courses?.includes(courseId));
    }
    setFilteredInstructors(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this instructor?"))
      return;
    try {
      setDeletingId(id);
      await API.delete(`/users/${id}`);
      const updated = instructors.filter((u) => u._id !== id);
      setInstructors(updated);
      filterInstructors(searchTerm, selectedCourse?.value);
      toast.success("Instructor deleted successfully");
    } catch {
      toast.error("Failed to delete instructor");
    } finally {
      setDeletingId(null);
    }
  };

  const generateInstructorReport = (instructor) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text(`Instructor Report: ${instructor.name}`, 15, 20);

    // Basic Info
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 30);
    doc.line(15, 35, 195, 35);

    // Details Section
    doc.setFontSize(14);
    doc.text("Personal Information", 15, 45);

    const personalData = [
      ["Email:", instructor.email || "N/A"],
      ["Phone:", instructor.phone || "N/A"],
      ["Instructor ID:", instructor.instructorId || "N/A"],
    ];

    doc.autoTable({
      startY: 50,
      head: [["Field", "Value"]],
      body: personalData,
      theme: "grid",
      headStyles: { fillColor: [40, 40, 40] },
      margin: { left: 15 },
    });

    // Qualifications Section
    doc.setFontSize(14);
    doc.text("Qualifications", 15, doc.autoTable.previous.finalY + 15);

    const qualData = [
      ["Education:", instructor.education || "N/A"],
      ["Profession:", instructor.profession || "N/A"],
      ["Experience:", instructor.experience || "N/A"],
    ];

    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 20,
      head: [["Field", "Value"]],
      body: qualData,
      theme: "grid",
      headStyles: { fillColor: [40, 40, 40] },
      margin: { left: 15 },
    });

    doc.save(`${instructor.name.replace(/\s+/g, "_")}_report.pdf`);
  };

  useEffect(() => {
    fetchInstructors();
    fetchCourses();
  }, []);

  const paginatedInstructors = filteredInstructors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredInstructors.length / itemsPerPage);

  return (
    <AdminDashboard>
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Instructor Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {filteredInstructors.length} instructor
                {filteredInstructors.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <button
              onClick={() => navigate("/create-user")}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
            >
              <FiPlus className="mr-2" size={16} />
              Add Instructor
            </button>
            <button
              onClick={handleSync}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={syncLoading}
            >
              {syncLoading ? "Syncing..." : "Sync Instructors"}
            </button>
            {syncStatus && (
              <p className="mt-2 text-sm text-gray-700">{syncStatus}</p>
            )}
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, email or ID..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-64">
                  <Select
                    options={courses}
                    placeholder="Filter by course..."
                    isClearable
                    value={selectedCourse}
                    onChange={(option) => {
                      setSelectedCourse(option);
                      filterInstructors(searchTerm, option?.value);
                    }}
                    classNamePrefix="select"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredInstructors.length === 0 ? (
              <div className="text-center p-12">
                <div className="mx-auto h-24 w-24 text-gray-400">
                  <FiUser className="w-full h-full" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No instructors found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedCourse
                    ? "Try adjusting your search or filter"
                    : "Get started by adding a new instructor"}
                </p>
                {!searchTerm && !selectedCourse && (
                  <div className="mt-6">
                    <button
                      onClick={() => navigate("/create-user")}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
                    >
                      <FiPlus className="mr-2" size={16} />
                      Add Instructor
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Instructor
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Contact
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Qualifications
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
                      {paginatedInstructors.map((instructor) => (
                        <tr
                          key={instructor._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                {instructor.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {instructor.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {instructor.instructor_id || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {instructor.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {instructor.phone || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {instructor.education || "Not specified"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {instructor.profession || "N/A"} •{" "}
                              {instructor.experience || "0"} years
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() =>
                                  navigate(`/edit-user/${instructor._id}`)
                                }
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Edit"
                              >
                                <FiEdit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(instructor._id)}
                                disabled={deletingId === instructor._id}
                                className={`text-red-600 hover:text-red-900 transition-colors ${
                                  deletingId === instructor._id
                                    ? "opacity-50"
                                    : ""
                                }`}
                                title="Delete"
                              >
                                {deletingId === instructor._id ? (
                                  <svg
                                    className="animate-spin h-4 w-4 text-red-600"
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
                                ) : (
                                  <FiTrash2 size={18} />
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  generateInstructorReport(instructor)
                                }
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                                title="Generate Report"
                              >
                                <FiFileText size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {(currentPage - 1) * itemsPerPage + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(
                            currentPage * itemsPerPage,
                            filteredInstructors.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {filteredInstructors.length}
                        </span>{" "}
                        results
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <FiChevronLeft
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </button>
                        {Array.from(
                          { length: Math.min(5, totalPages) },
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
                                key={i}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === pageNum
                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <FiChevronRight
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminDashboard>
  );
};

export default AllInstructor;
