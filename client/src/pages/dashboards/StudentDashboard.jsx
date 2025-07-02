import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/api';
import logo from "../../assets/icon.png";
const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

   useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Motivational quotes
  const quotes = [
    "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
    "The expert in anything was once a beginner. - Helen Hayes",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Don't stop when you're tired. Stop when you're done.",
    "Wake up with determination. Go to bed with satisfaction.",
    "The secret of getting ahead is getting started. - Mark Twain",

"Don't watch the clock; do what it does. Keep going. - Sam Levenson",

"Success is the sum of small efforts, repeated day in and day out. - Robert Collier",

"The only way to do great work is to love what you do. - Steve Jobs",

"Believe you can and you're halfway there. - Theodore Roosevelt",

"You are never too old to set another goal or to dream a new dream. - C.S. Lewis",

"The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",

"It always seems impossible until it's done. - Nelson Mandela",

"Start where you are. Use what you have. Do what you can. - Arthur Ashe",

"You don't have to be great to start, but you have to start to be great. - Zig Ziglar",

"The expert in anything was once a beginner. - Helen Hayes",

"Opportunities don't happen. You create them.- Chris Grosser",

"The only limit to our realization of tomorrow is our doubts of today. - Franklin D. Roosevelt",

"What you get by achieving your goals is not as important as what you become by achieving your goals. - Zig Ziglar",

"Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",

"The harder you work for something, the greater you'll feel when you achieve it.",

"Don't stop when you're tired. Stop when you're done.",

"Wake up with determination. Go to bed with satisfaction.",

"You don't want to look back and know you could have done better.",

"The pain you feel today will be the strength you feel tomorrow."
  ];

  useEffect(() => {
    
    const fetchStudent = async () => {
      try {
        const { data } = await API.get('/users/me');
        setStudent(data);
      } catch (error) {
        console.error('Failed to load student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-gray-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('/Login.jpg')] bg-cover bg-center font-sans">
      <header className="bg-gradient-to-b from-indigo-300 to-gray-100 border-t  mb-10 pb-5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-3 sm:gap-0">
                  <div className="flex items-center gap-4">
                    <img
                      src={logo}
                      alt="Logo"
                      className="h-10 w-10 rounded-lg object-contain"
                    />
                    <div> 
                      <h1 className="text-2xl font-bold text-gray-700">
                        UrbanCode — ProgZ
                      </h1>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <span>Student Dashboard</span>
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
             <div className="text-center rounded-lg">
             
              <p className="text-black/80 italic">"{quote}"</p>
            </div>
                
              
            </header>

            
                  <div className="max-w-7xl mx-auto  flex justify-center items-center mb-5">
                    <p className="text-center text-sm text-gray-700 font-sans">
 
                      <h1 className="bg-white/80 text-2xl md:text-2xl  px-12 text-gray-880 rounded-xl p-2">
                        Welcome back, {student?.name}! Glad to see you here.!
                      </h1>

                    </p>
                  </div>
         
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Courses Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
            <h2 className="text-xl font-semibold text-gray-800">My Courses</h2>
          </div>
          <div className="p-6">
            {student?.enrolledCourses?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {student.enrolledCourses.map((course) => (
                  <div key={course._id} className="bg-gray-50 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border border-gray-200">
                    <div className="p-5">
                      <h3 className="text-lg font-medium text-sky-600 mb-2">{course.courseName}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-sm">ID: {course.courseId}</span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm">Modules: {course.modules?.length || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="px-5 py-3 bg-white border-t border-gray-200">
                      <Link
                        to={`/student-progress/${student._id}/${course._id}`}
                        className="w-full flex items-center justify-center px-3 py-2 bg-gray-800 text-white rounded-md hover:bg-blue-800 transition-colors text-sm"
                      >
                        View Progress
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Courses Enrolled</h3>
                <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
                <button
                  // onClick={() => navigate('/courses')}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  Browse Courses
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
            <h2 className="text-xl font-semibold text-gray-800">My Profile</h2>
          </div>
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue={student.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      defaultValue={student.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input 
                      type="tel" 
                      defaultValue={student.phone}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input 
                      type="text" 
                      defaultValue={student.address}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                    <input 
                      type="text" 
                      defaultValue={student.education}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <input 
                      type="text" 
                      defaultValue={student.experience}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button 
                    onClick={handleEditToggle}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="text-gray-900">{student.name}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="text-gray-900">{student.email}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="text-gray-900">{student.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="text-gray-900">{student.address}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Education</h3>
                    <p className="text-gray-900">{student.education}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Experience</h3>
                    <p className="text-gray-900">{student.experience}</p>
                  </div>
                </div>
                {/* <div className="pt-4">
                  <button 
                    onClick={handleEditToggle}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Edit Profile
                  </button>
                </div> */}
              </div>
            )}
          </div>
        </div>
        <button
        onClick={handleLogout}
          className="px-4 py-2 m-5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >Logout</button>
      </div>
    </div>
  );
};

export default StudentDashboard;