import React, { useEffect, useState } from 'react';
import API from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import AdminDashboard from '../dashboards/AdminDashboard';
const AllInstructor = () => {
  const [instructors, setInstructors] = useState([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/users/role?role=instructor');
      setInstructors(data);
      setFilteredInstructors(data);
    } catch (err) {
      setError('Failed to load instructors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await API.get('/courses');
      setCourses(data);
    } catch {
      setCourses([]);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    filterInstructors(term, selectedCourse);
  };

  

  const filterInstructors = (term, courseId) => {
    let filtered = [...instructors];
    if (term) {
      filtered = filtered.filter((i) =>
        i.name.toLowerCase().includes(term.toLowerCase()) ||
        i.email.toLowerCase().includes(term.toLowerCase()) ||
        (i.instructorId && i.instructorId.toLowerCase().includes(term.toLowerCase()))
      );
    }
    if (courseId) {
      filtered = filtered.filter((i) => i.courses?.includes(courseId));
    }
    setFilteredInstructors(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this instructor?')) return;
    try {
      await API.delete(`/users/${id}`);
      const updated = instructors.filter((u) => u._id !== id);
      setInstructors(updated);
      filterInstructors(searchTerm, selectedCourse);
    } catch {
      setError('Failed to delete instructor.');
    }
  };

  const generateInstructorReport = (instructor) => {
    const doc = new jsPDF();
    doc.text(`Instructor Report: ${instructor.name}`, 10, 10);
    doc.text(`Email: ${instructor.email}`, 10, 20);
    doc.text(`Phone: ${instructor.phone || 'N/A'}`, 10, 30);
    doc.text(`Education: ${instructor.education || 'N/A'}`, 10, 40);
    doc.text(`Profession: ${instructor.profession || 'N/A'}`, 10, 50);
    doc.text(`Experience: ${instructor.experience || 'N/A'}`, 10, 60);
    doc.text(`Instructor ID: ${instructor.instructorId || 'N/A'}`, 10, 70);
    doc.save(`${instructor.name}_report.pdf`);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <AdminDashboard>
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto bg-white border rounded shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-4 border-b gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">All Instructors</h1>
            <p className="text-sm text-gray-500">Manage instructors</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Search instructors..."
              className="border border-gray-300 rounded px-3 py-2 text-sm"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <button
              onClick={() => navigate('/create-user')}
              className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
            >
              Add Instructor
            </button>
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          {paginatedInstructors.length > 0 ? (
            <>
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Contact</th>
                    <th className="px-4 py-2 font-medium">Qualifications</th>
                    <th className="px-4 py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedInstructors.map((instructor) => (
                    <tr key={instructor._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{instructor.name}</td>
                      <td className="px-4 py-2">
                        <div>{instructor.email}</div>
                        <div className="text-sm text-gray-500">{instructor.phone || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-2">
                        <div>{instructor.education || 'N/A'}</div>
                        <div className="text-sm text-gray-500">
                          {instructor.profession || 'N/A'} • {instructor.experience || 'N/A'} exp
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right space-x-2">
                        <button
                          onClick={() => navigate(`/edit-user/${instructor._id}`)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(instructor._id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => generateInstructorReport(instructor)}
                          className="text-gray-700 hover:underline"
                        >
                          Report
                        </button>
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
            <div className="text-center text-gray-500 py-8">No instructors found</div>
          )}
        </div>
      </div>
    </div>
    </AdminDashboard>
  );
};

export default AllInstructor;
