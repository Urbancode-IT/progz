import React, { useEffect, useState } from 'react'; 
import API from '../../api/api';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../dashboards/AdminDashboard';
const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
const [showModal, setShowModal] = useState(false);
const [selectedCourse, setSelectedCourse] = useState(null); 
const [selectedInstructorId, setSelectedInstructorId] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/courses');
      setCourses(data);
      setFilteredCourses(data);
    } catch (err) {
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const { data } = await API.get('/users/role?role=instructor');
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
    filterCourses(term, selectedInstructor);
  };

  const handleInstructorFilter = (id) => {
    setSelectedInstructor(id);
    filterCourses(searchTerm, id);
  };

   const openManageModal = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedCourse(null);
    setSelectedInstructorId("");
    setShowModal(false);
  };

  const handleAddInstructor = async () => {
    if (!selectedInstructorId) return;
    await API.put(`/courses/${selectedCourse._id}/add-instructor`, {
      instructorId: selectedInstructorId,
    });
    fetchCourses();
    closeModal();
  };

  const handleRemoveInstructor = async (instructorId) => {
    await API.put(`/courses/${selectedCourse._id}/remove-instructor`, {
      instructorId,
    });
    fetchCourses();
  };

  const filterCourses = (term, instructorId) => {
    let result = [...courses];
    if (term) {
      result = result.filter(course =>
        course.courseName.toLowerCase().includes(term.toLowerCase()) ||
        course.courseId.toLowerCase().includes(term.toLowerCase()) ||
        course.instructor?.some(i => i.name?.toLowerCase().includes(term.toLowerCase()))
      );
    }
    if (instructorId) {
      result = result.filter(course =>
        course.instructor?.some(i => i._id === instructorId)
      );
    }
    setFilteredCourses(result);
    setCurrentPage(1);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await API.delete(`/courses/${courseId}`);
      const updated = courses.filter((c) => c._id !== courseId);
      setCourses(updated);
      filterCourses(searchTerm, selectedInstructor);
    } catch {
      setError('Delete failed.');
    }
  };

  const handleEdit = (id) => navigate(`/edit-course/${id}`);
  const handleView = (id) => navigate(`/view-course/${id}`);

  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <AdminDashboard>
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto bg-white border rounded shadow-sm">
        <div className="flex flex-wrap justify-between gap-4 items-center px-6 py-4 border-b">
          <h1 className="text-lg font-semibold text-gray-800">All Courses</h1>
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={selectedInstructor}
              onChange={(e) => handleInstructorFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">All Instructors</option>
              {instructors.map(i => (
                <option key={i._id} value={i._id}>{i.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <button
              onClick={() => navigate('/create-course')}
              className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
            >
              New Course
            </button>
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          {paginatedCourses.length > 0 ? (
            <>
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 font-medium">Course</th>
                    <th className="px-4 py-2 font-medium">Instructor</th>
                    <th className="px-4 py-2 font-medium">Enrolled</th>
                    <th className="px-4 py-2 font-medium">Modules</th>
                    <th className="px-4 py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedCourses.map((course) => (
                    <tr key={course._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <div className="font-medium text-gray-900">{course.courseName}</div>
                        <div className="text-sm text-gray-500">{course.courseId}</div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {course.instructor?.map(i => i.name).join(', ') || 'N/A'}
                      </td>
                      <td className="px-4 py-2">{course.enrolledStudents?.length || 0}</td>
                      <td className="px-4 py-2">{course.modules?.length || 0}</td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleView(course._id)} className="text-blue-600 text-sm">View</button>
                          <button onClick={() => handleEdit(course._id)} className="text-yellow-600 text-sm">Edit</button>
                          <button onClick={() => openManageModal(course)} className="text-green-600 text-sm">Manage Instructors</button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-6 flex justify-center gap-2 text-sm">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 border-gray-300'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-600 py-8">
              {searchTerm || selectedInstructor ? 'No matching courses.' : 'No courses found.'}
            </div>
          )}
        </div>
      </div>
       {/* Manage Instructor Modal */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-md w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-500"
              onClick={closeModal}
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-4">
              Manage Instructors for {selectedCourse.courseName}
            </h3>

            <label className="block mb-2 text-sm font-medium">
              Add Instructor:
            </label>
            <select
              className="w-full p-2 mb-4 border rounded"
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
              className="bg-green-600 text-white px-3 py-1 rounded mb-4 w-full"
              onClick={handleAddInstructor}
            >
              Add Instructor
            </button>

            <hr className="my-4" />

            <label className="block mb-2 text-sm font-medium">
              Current Instructors:
            </label>
            <ul>
              {selectedCourse.instructor?.map((ins) => (
                <li
                  key={ins._id}
                  className="flex justify-between items-center mb-2"
                >
                  {ins.name} ({ins.email})
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                    onClick={() => handleRemoveInstructor(ins._id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
    
    </AdminDashboard>
  );
};

export default AllCourses;
