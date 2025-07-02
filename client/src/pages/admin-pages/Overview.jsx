import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/api';
import { jsPDF } from 'jspdf';
import AdminDashboard from '../dashboards/AdminDashboard';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

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

  // Chart data state
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [userDistributionData, setUserDistributionData] = useState(null);
  const [monthlyEnrollmentData, setMonthlyEnrollmentData] = useState(null);

  const quotes = [
    "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
    "The beautiful thing about learning is that no one can take it away from you. - B.B. King",
    "Education is not preparation for life; education is life itself. - John Dewey",
    "The expert in anything was once a beginner. - Helen Hayes",
    "Learning is a treasure that will follow its owner everywhere. - Chinese Proverb"
  ];
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [coursesRes, instructorsRes, studentsRes] = await Promise.all([
          API.get('/courses'),
          API.get('/users/role/?role=instructor'),
          API.get('/users/role/?role=student')
        ]);

        const totalEnrollments = coursesRes.data.reduce(
          (acc, course) => acc + (course.enrolledStudents?.length || 0), 0
        );

        // Prepare data for charts
        prepareChartData(coursesRes.data, instructorsRes.data.length, studentsRes.data.length);

        setStats({
          courses: coursesRes.data.length,
          instructors: instructorsRes.data.length,
          students: studentsRes.data.length,
          enrollments: totalEnrollments
        });

        const sortedCourses = [...coursesRes.data]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentCourses(sortedCourses);

        const sortedStudents = [...studentsRes.data]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentStudents(sortedStudents);

        const sortedInstructors = [...instructorsRes.data]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
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

  const prepareChartData = (courses, instructorCount, studentCount) => {
    // Prepare enrollment data for bar chart (top 5 courses by enrollment)
    const sortedByEnrollment = [...courses]
      .sort((a, b) => (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0))
      .slice(0, 5);

    setEnrollmentData({
      labels: sortedByEnrollment.map(course => course.courseName),
      datasets: [{
        label: 'Number of Students',
        data: sortedByEnrollment.map(course => course.enrolledStudents?.length || 0),
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    });

    // Prepare user distribution data for pie chart
    setUserDistributionData({
      labels: ['Instructors', 'Students'],
      datasets: [{
        data: [instructorCount, studentCount],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 1
      }]
    });

    // Prepare monthly enrollment data
    prepareMonthlyEnrollmentData(courses);
  };

  const prepareMonthlyEnrollmentData = (courses) => {
    // Group enrollments by month
    const monthlyEnrollments = {};
    
    courses.forEach(course => {
      if (course.enrolledStudents && course.enrolledStudents.length > 0) {
        course.enrolledStudents.forEach(student => {
          const enrollmentDate = new Date(student.enrolledAt || course.createdAt);
          const monthYearKey = `${enrollmentDate.getFullYear()}-${enrollmentDate.getMonth() + 1}`;
          
          if (!monthlyEnrollments[monthYearKey]) {
            monthlyEnrollments[monthYearKey] = 0;
          }
          monthlyEnrollments[monthYearKey]++;
        });
      }
    });

    // Sort by date and get last 6 months
    const sortedMonths = Object.keys(monthlyEnrollments)
      .sort()
      .slice(-6);

    const monthNames = sortedMonths.map(monthYear => {
      const [year, monthNum] = monthYear.split('-');
      return new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });

    setMonthlyEnrollmentData({
      labels: monthNames,
      datasets: [{
        label: 'Enrollments',
        data: sortedMonths.map(month => monthlyEnrollments[month]),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
        fill: true
      }]
    });
  };

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
          {/* Header with quick actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening with your platform.</p>
            </div>
            <button
              onClick={generateQuickReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Generate Report
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { 
                title: "Total Courses", 
                value: stats.courses,
                color: "bg-indigo-100 text-indigo-600"
              },
              { 
                title: "Total Instructors", 
                value: stats.instructors,
                color: "bg-purple-100 text-purple-600"
              },
              { 
                title: "Total Students", 
                value: stats.students,
                color: "bg-blue-100 text-blue-600"
              },
              { 
                title: "Total Enrollments", 
                value: stats.enrollments,
                color: "bg-green-100 text-green-600"
              }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${stat.color} mr-4`}>
                    <div className="h-6 w-6"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Enrollment Bar Chart */}
            <div className="bg-white rounded-xl shadow-md p-6 h-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Courses by Enrollment</h2>
              {enrollmentData ? (
                <Bar 
                  data={enrollmentData}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.dataset.label}: ${context.raw}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="text-center text-gray-500 py-8">Loading chart data...</div>
              )}
            </div>

            {/* User Distribution Pie Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">User Distribution</h2>
              {userDistributionData ? (
                <div className="h-64">
                  <Pie 
                    data={userDistributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const value = context.raw || 0;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = Math.round((value / total) * 100);
                              return `${label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">Loading chart data...</div>
              )}
            </div>
          </div>

          {/* Monthly Enrollment Trends Line Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Enrollment Trends</h2>
            {monthlyEnrollmentData ? (
              <Line 
                data={monthlyEnrollmentData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.dataset.label}: ${context.raw}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="text-center text-gray-500 py-8">Loading chart data...</div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Courses */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Recent Courses</h2>
                <span className="text-sm text-gray-500">{recentCourses.length} added</span>
              </div>
              <div className="divide-y divide-gray-200">
                {recentCourses.length > 0 ? (
                  recentCourses.map(course => (
                    <div key={course._id} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => navigate(`/view-course/${course._id}`)}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{course.courseName}</h3>
                          <p className="text-sm text-gray-500">{course.instructor?.name || 'No instructor'}</p>
                        </div>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {course.enrolledStudents?.length || 0} students
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Created: {new Date(course.createdAt).toLocaleDateString()}
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
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  View All Courses →
                </button>
              </div>
            </div>

            {/* Recent Students */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Recent Students</h2>
                <span className="text-sm text-gray-500">{recentStudents.length} joined</span>
              </div>
              <div className="divide-y divide-gray-200">
                {recentStudents.length > 0 ? (
                  recentStudents.map(student => (
                    <div key={student._id} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => navigate(`/admin/edit-student/${student._id}`)}>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600">S</span>
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium text-gray-900">{student.name}</h3>
                          <p className="text-sm text-gray-500">{student.email}</p>
                          <div className="mt-1 text-xs text-gray-400">
                            Joined: {new Date(student.createdAt).toLocaleDateString()}
                          </div>
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
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  View All Students →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboard>
  );
};

export default Overview;