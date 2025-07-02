//server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { notFound, errorHandler } = require('./utils/errorHandler');
 // Import new user routes

const app = express();

// Middleware
app.use(express.json());

// app.use(cors({
//   origin: 'http://localhost:5173', // Your frontend origin
//   credentials: true
// }));
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//   next();
// });

// app.use(cors({
//   origin: 'https://progz.netlify.app', // Your frontend origin
//   credentials: true
// }));
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'https://progz.netlify.app');//https://course-tracker-xi.vercel.app
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//   next();
// });

https://progz.urbancode.tech/login

app.use(cors({
  origin: 'https://progz.urbancode.tech', // Your frontend origin
  credentials: true
}));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://progz.urbancode.tech');//https://course-tracker-xi.vercel.app
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Static folder for file uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));
app.use('/api', require('./routes/syncRoutes'));

require('./cron/syncCron');
// Routes
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const progressRoutes = require('./routes/progressRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const newUserRoutes = require('./routes/newUserRoutes');


// API Endpoints
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/newusers', newUserRoutes);


// Root endpoint
app.get('/', (req, res) => {
  res.send('Urbancode ProgZ -Curriculum and Tracking API');
});


app.use(notFound);
app.use(errorHandler);


// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB Connected');
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
});
