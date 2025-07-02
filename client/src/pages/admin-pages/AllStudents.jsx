import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/api';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import AdminDashboard from "../dashboards/AdminDashboard";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiFileText, FiChevronLeft, FiChevronRight, FiUser, FiMail, FiPhone, FiBook } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Select from 'react-select';

const AllStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [deletingId, setDeletingId] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);
    const [syncStatus, setSyncStatus] = useState("");

      const handleSync = async () => {
    setSyncLoading(true);
    setSyncStatus("");
    try {
      const res = await API.get("/sync/students");
      setSyncStatus(res.data.message || "Courses synced");
    } catch (err) {
      setSyncStatus("Sync failed");
      console.error(err);
    } finally {
      setSyncLoading(false);
    }
  };
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/users/role?role=student');
      setStudents(data);
      setFilteredStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await API.get('/courses');
      setCourses(data.map(course => ({ value: course._id, label: course.courseName })));
    } catch (err) {
      toast.error('Failed to load courses');
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    filterStudents(term, selectedCourse?.value);
  };

  const filterStudents = (term, courseId) => {
    let filtered = [...students];
    
    if (term) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(term.toLowerCase()) ||
        student.email.toLowerCase().includes(term.toLowerCase()) ||
        (student.phone && student.phone.includes(term))
      );
    }
    
    if (courseId) {
      filtered = filtered.filter(student => 
        student.enrolledCourses?.includes(courseId)
      );
    }
    
    setFilteredStudents(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      setDeletingId(id);
      await API.delete(`/users/${id}`);
      setStudents(prev => prev.filter(s => s._id !== id));
      setFilteredStudents(prev => prev.filter(s => s._id !== id));
      toast.success('Student deleted successfully');
    } catch (err) {
      console.error('Error deleting student:', err);
      toast.error('Failed to delete student. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const generateStudentReport = (student) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text(`Student Report: ${student.name}`, 15, 20);
    
    // Basic Info
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 30);
    doc.line(15, 35, 195, 35);
    
    // Personal Information Section
    doc.setFontSize(14);
    doc.text('Personal Information', 15, 45);
    
    const personalData = [
      ['Email:', student.email || 'N/A'],
      ['Phone:', student.phone || 'N/A'],
      ['Student ID:', student.studentId || 'N/A']
    ];
    
    doc.autoTable({
      startY: 50,
      head: [['Field', 'Value']],
      body: personalData,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] },
      margin: { left: 15 }
    });
    
    // Background Section
    doc.setFontSize(14);
    doc.text('Educational Background', 15, doc.autoTable.previous.finalY + 15);
    
    const backgroundData = [
      ['Education:', student.education || 'N/A'],
      ['Profession:', student.profession || 'N/A'],
      ['Experience:', student.experience || 'N/A']
    ];
    
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 20,
      head: [['Field', 'Value']],
      body: backgroundData,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] },
      margin: { left: 15 }
    });
    
    doc.save(`${student.name.replace(/\s+/g, '_')}_report.pdf`);
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  return (
    <AdminDashboard>
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
              <p className="text-sm text-gray-500 mt-1">
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <button
              onClick={() => navigate('/create-user')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
            >
              <FiPlus className="mr-2" size={16} />
              Add Student
            </button>
            <button
              onClick={handleSync}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={syncLoading}
            >
              {syncLoading ? "Syncing..." : "Sync Students"}
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
                    placeholder="Search by name, email or phone..."
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
                      filterStudents(searchTerm, option?.value);
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
            ) : filteredStudents.length === 0 ? (
              <div className="text-center p-12">
                <div className="mx-auto h-24 w-24 text-gray-400">
                  <FiUser className="w-full h-full" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedCourse ? 'Try adjusting your search or filter' : 'Get started by adding a new student'}
                </p>
                {!searchTerm && !selectedCourse && (
                  <div className="mt-6">
                    <button
                      onClick={() => navigate('/create-user')}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
                    >
                      <FiPlus className="mr-2" size={16} />
                      Add Student
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
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Background
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedStudents.map((student) => (
                        <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">
                                  ID: {student.studentId || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <FiMail className="mr-2 text-gray-400" size={14} />
                              {student.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <FiPhone className="mr-2 text-gray-400" size={14} />
                              {student.phone || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-gray-900">
                              <FiBook className="mr-2 text-gray-400" size={14} />
                              {student.education || 'Not specified'}
                            </div>
                            <div className="text-sm text-gray-500 mt-1 pl-6">
                              {student.profession || 'N/A'} • {student.experience || '0'} years
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => navigate(`/edit-user/${student._id}`)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Edit"
                              >
                                <FiEdit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(student._id)}
                                disabled={deletingId === student._id}
                                className={`text-red-600 hover:text-red-900 transition-colors ${deletingId === student._id ? 'opacity-50' : ''}`}
                                title="Delete"
                              >
                                {deletingId === student._id ? (
                                  <svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <FiTrash2 size={18} />
                                )}
                              </button>
                              <button
                                onClick={() => generateStudentReport(student)}
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
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, filteredStudents.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredStudents.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                          <span className="sr-only">Previous</span>
                          <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                          <span className="sr-only">Next</span>
                          <FiChevronRight className="h-5 w-5" aria-hidden="true" />
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

export default AllStudents;