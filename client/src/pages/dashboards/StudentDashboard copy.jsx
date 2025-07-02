import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/api';

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState('');
  const navigate = useNavigate();

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
    // Set random quote
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    
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
  console.log("student", student);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 to-gray-400 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-purple-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-gray-400 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white font-serif">Welcome, {student?.name}</h1>
                <p className="text-purple-100 mt-1 font-light">Student Dashboard</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="text-white hover:text-purple-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Motivational Quote */}
          <div className="p-6 bg-purple-50 border-b border-purple-100">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-purple-800 italic">"{quote}"</p>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {student?.enrolledCourses?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {student.enrolledCourses.map((course) => (
              <div key={course._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{course.courseName}</h2>
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>ID: {course.courseId}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Instructor: {course.instructor?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Modules: {course.modules?.length || 0}</span>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <Link
                    to={`/student-progress/${student._id}/${course._id}`}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    View Progress
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-xl p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-purple-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No Courses Enrolled</h3>
            <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
            <button
              // onClick={() => navigate('/courses')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              Browse Courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;