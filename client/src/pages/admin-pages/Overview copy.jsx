import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/api';
import { jsPDF } from 'jspdf';
import AdminDashboard from '../dashboards/AdminDashboard';

const Overview = () => {
  const [stats, setStats] = useState({
    courses: 0,
    instructors: 0,
    students: 0,
    enrollments: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentInstructors, setRecentInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  // Motivational quotes for education
  const quotes = [
    "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
    "The beautiful thing about learning is that no one can take it away from you. - B.B. King",
    "Education is not preparation for life; education is life itself. - John Dewey",
    "The expert in anything was once a beginner. - Helen Hayes",
    "Learning is a treasure that will follow its owner everywhere. - Chinese Proverb"
  ];
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Set random quote on load
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all stats in parallel
        const [coursesRes, instructorsRes, studentsRes] = await Promise.all([
          API.get('/courses'),
          API.get('/users/role/?role=instructor'),
          API.get('/users/role/?role=student')
        ]);

        // Calculate total enrollments
        const totalEnrollments = coursesRes.data.reduce(
          (acc, course) => acc + (course.enrolledStudents?.length || 0), 0
        );

        setStats({
          courses: coursesRes.data.length,
          instructors: instructorsRes.data.length,
          students: studentsRes.data.length,
          enrollments: totalEnrollments
        });

        // Get 5 most recent courses (sorted by creation date)
        const sortedCourses = [...coursesRes.data]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentCourses(sortedCourses);

        // Get 5 most recent students
        const sortedStudents = [...studentsRes.data]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentStudents(sortedStudents);
        // Get 5 most recent instructors
        const sortedInstructors = [...instructorsRes.data]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setRecentInstructors(sortedInstructors);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
   const generateQuickReport = () => {
    const doc = new jsPDF();
    doc.text('Admin Dashboard Report', 10, 10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 20);
    doc.text(`Total Courses: ${stats.courses}`, 10, 30);
    doc.text(`Total Instructors: ${stats.instructors}`, 10, 40);
    doc.text(`Total Students: ${stats.students}`, 10, 50);
    doc.text(`Total Enrollments: ${stats.enrollments}`, 10, 60);
    doc.save('admin_dashboard_report.pdf');
  };

  if (loading) {
    return (
        
      <div className="min-h-screen bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-gray-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto">
          <div className="text-red-600 font-medium">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard>
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
          
        

        {/* Overview Tab */}
        
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-black">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Courses</p>
                    <p className="text-2xl font-bold">{stats.courses}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-black">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Instructors</p>
                    <p className="text-2xl font-bold">{stats.instructors}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-black rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Students</p>
                    <p className="text-2xl font-bold">{stats.students}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-black rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Enrollments</p>
                    <p className="text-2xl font-bold">{stats.enrollments}</p>
                  </div>
                </div>
              </div>
            </div>

          
            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

              
              {/* Recent Courses */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Courses</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentCourses.length > 0 ? (
                    recentCourses.map(course => (
                      <div key={course._id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/view-course/${course._id}`)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{course.courseName}</h3>
                            <p className="text-sm text-gray-500">{course.instructor?.name || 'No instructor'}</p>
                          </div>
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {course.enrolledStudents?.length || 0} students
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No recent courses
                    </div>
                  )}
                </div>
                <div className="px-6 py-3 bg-gray-50 text-right">
                  <button
                    onClick={() => navigate('/admin/all-courses')}
                    className="text-sm font-medium text-gray-600 hover:text-gray-500"
                  >
                    View All Courses →
                  </button>
                </div>
              </div>

              {/* Recent Students */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Students</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentStudents.length > 0 ? (
                    recentStudents.map(student => (
                      <div key={student._id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/edit-student/${student._id}`)}>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h3 className="font-medium text-gray-900">{student.name}</h3>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No recent students
                    </div>
                  )}
                </div>
                <div className="px-6 py-3 bg-gray-50 text-right">
                  <button
                    onClick={() => navigate('/admin/all-students')}
                    className="text-sm font-medium text-gray-600 hover:text-gray-500"
                  >
                    View All Students →
                  </button>
                </div>
              </div>
            </div>

           
          


      </div>
    </div>
    </div>
    </AdminDashboard>
  );
};

export default Overview;