// import API from 'api.js'; // Adjust the path if needed

// const { data: studentData } = await API.get('/users/me');


import axios from 'axios';

const API = axios.create({
  baseURL: 'https://progz.onrender.com/api',//'http://localhost:5000/api',//https://uc-progz.onrender.com//'https://coursetracker.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Enhanced request interceptor
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem('token');
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found');
      // You might want to redirect to login here
    }
    return req;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('API Request Error:', error.request);
    } else {
      console.error('API Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default API;