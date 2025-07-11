import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import API from '../../api/api';
import logo from '../../assets/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().required('Required'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError('');
      try {
        const response = await API.post('/users/login', values);
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        switch (response.data.user.role) {
          case 'admin':
            navigate('/admin/overview');
            break;
          case 'instructor':
            navigate('/instructor');
            break;
          case 'student':
            navigate('/student');
            break;
          default:
            setError('Unknown user role');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen  md:bg-[url('/Login.jpg')] md:bg-cover md:bg-center bg-gradient-to-br from-indigo-300 to-gray-100 flex flex-col justify-center my-auto sm:px-6 lg:px-8">

      {/* Background bubbles for glass morphism effect */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gray-600 opacity-20 blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-blue-600 opacity-20 blur-3xl animate-float-delay"></div>
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="text-center">
          <h2 className="mt-6 text-center text-4xl font-bold bg-white/50 rounded-full font-sans">
            <span className=" text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-gray-800  to-blue-400">ProgZ</span>
          </h2>
          <p className="mt-2 text-sm text-gray-800">
            Sign in to access your dashboard
          </p>
        </div>
      </div>

      <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 py-8 px-6 rounded-2xl shadow-2xl sm:px-10 transition-all duration-500 hover:bg-white/15 hover:border-white/30">
          {error && (
            <div className="mb-4 bg-red-400/10 border-l-4 border-red-400 p-4 rounded-lg backdrop-blur-sm animate-[shake_0.5s_ease-in-out]">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={formik.handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  className={`block w-full pl-10 pr-3 py-3 bg-white/5 backdrop-blur-sm rounded-md border ${formik.touched.email && formik.errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-white/30 focus:ring-gray-500 focus:border-gray-500'}  placeholder-gray-300 shadow-sm focus:outline-none sm:text-sm transition duration-150`}
                  placeholder="you@example.com"
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="mt-2 text-sm text-red-300 animate-[fadeIn_0.3s_ease-in-out]">{formik.errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  className={`block w-full pl-10 pr-3 py-3 bg-white/5 backdrop-blur-sm rounded-md border ${formik.touched.password && formik.errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-white/30 focus:ring-gray-500 focus:border-gray-500'} placeholder-gray-300 shadow-sm focus:outline-none sm:text-sm transition duration-150`}
                  placeholder="••••••••"
                />
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-2 text-sm text-red-300 animate-[fadeIn_0.3s_ease-in-out]">{formik.errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-white/30 rounded bg-white/10"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  Remember me
                </label>
              </div>

              
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-gray-600 to-blue-600 hover:from-gray-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-gray-300 group-hover:text-gray-200 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Sign in
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-md">
                <span className="px-2 bg-transparent text-gray-900">
                  New to Urbancode-ProgZ? {' '}
                  <a href="/register" className="font-medium border-b text-green-900 hover:text-blue=900">  
                    Register Now
                  </a>
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <img 
                src={logo} 
                alt="Logo" 
                className="h-12 w-auto filter drop-shadow-lg" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;