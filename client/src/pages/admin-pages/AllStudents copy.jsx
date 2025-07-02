import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/api';
import { jsPDF } from 'jspdf';
import AdminDashboard from "../dashboards/AdminDashboard";
const AllStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
const [selectedCourse, setSelectedCourse] = useState('');
const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/users/role?role=student');
      setStudents(data);
      setFilteredStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const fetchCourses = async () => {
  const { data } = await API.get('/courses');
  setCourses(data);
};
const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(term.toLowerCase()) ||
        student.email.toLowerCase().includes(term.toLowerCase()) ||
        (student.phone && student.phone.includes(term))
      );
      setFilteredStudents(filtered);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      await API.delete(`/users/${id}`);
      setStudents(prev => prev.filter(s => s._id !== id));
      setFilteredStudents(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      console.error('Error deleting student:', err);
      setError('Failed to delete student. Please try again.');
    }
  };

  const generateStudentReport = (student) => {
    const doc = new jsPDF();
    doc.text(`Student Report: ${student.name}`, 10, 10);
    doc.text(`Email: ${student.email}`, 10, 20);
    doc.text(`Phone: ${student.phone || 'N/A'}`, 10, 30);
    doc.text(`Education: ${student.education || 'N/A'}`, 10, 40);
    doc.text(`Profession: ${student.profession || 'N/A'}`, 10, 50);
    doc.text(`Experience: ${student.experience || 'N/A'}`, 10, 60);
    doc.save(`${student.name}_report.pdf`);
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-600">
        Loading students...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow max-w-md text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchStudents}
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard>
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white border rounded shadow-sm">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-4 border-b">
          <div>
  <h1 className="text-xl font-semibold text-gray-800">All Students</h1>
  <p className="text-sm text-gray-500">Manage your institution's students</p>
  <p className="text-sm text-gray-500 mt-1">
    Showing <span className="font-semibold">{filteredStudents.length}</span> students
  </p>
</div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search students..."
              className="w-full sm:w-64 border border-gray-300 rounded px-3 py-2 text-sm text-gray-800"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <select
  value={selectedCourse}
  onChange={(e) => {
    setSelectedCourse(e.target.value);
    if (e.target.value === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter((s) =>
        s.enrolledCourses?.includes(e.target.value)
      );
      setFilteredStudents(filtered);
    }
  }}
  className="w-full sm:w-auto border border-gray-300 rounded px-3 py-2 text-sm text-gray-800"
>
  <option value="">All Courses</option>
  {courses.map((course) => (
    <option key={course._id} value={course._id}>
      {course.courseName}
    </option>
  ))}
</select>

            <button
              onClick={() => navigate('/create-user')}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
            >
              Add Student
            </button>

          </div>
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          {paginatedStudents.length > 0 ? (
            <>
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Contact</th>
                  <th className="px-4 py-2 font-medium">Background</th>
                  <th className="px-4 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{student.name}</td>
                    <td className="px-4 py-2">
                      <div>{student.email}</div>
                      <div className="text-sm text-gray-500">{student.phone || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-2">
                      <div>{student.education || 'N/A'}</div>
                      <div className="text-sm text-gray-500">
                        {student.profession || 'N/A'} • {student.experience || 'N/A'} exp
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/edit-user/${student._id}`)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => generateStudentReport(student)}
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
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No matching students found." : "No students found."}
            </div>
          )}
        </div>
      </div>
    </div>
    </AdminDashboard>
  );
};

export default AllStudents;
