require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const fileManager = require('./Utils/fileManager');
const errorHandler = require('./Middleware/errorHandler');

// Import routes
const authRoutes = require('./Routes/auth.routes');
const roleRoutes = require('./Routes/role.routes');
const trustyRoutes = require('./Routes/trusty.routes');
const chatRoutes = require('./Routes/chat.routes');
const lessonPlanRoutes = require('./Routes/lessonPlan.routes');

// Initialize Express app
const app = express();

// Define port
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
fileManager.ensureDirectoryExists('uploads');

// Schedule cleanup of uploaded files (every hour, files older than 1 hour)
fileManager.scheduleFileCleanup('uploads', 60 * 60 * 1000, 60 * 60 * 1000);

// Middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/role', roleRoutes);
app.use('/api', trustyRoutes); // Keeping original path for backward compatibility
app.use('/api/chat', chatRoutes);
app.use('/api/lesson-plans', lessonPlanRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Not Found - ${req.originalUrl}`
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log("Server is running on port 5000")
  // console.log(`✅ Server running at http://localhost:${PORT}`);
  // console.log(`📝 API Documentation available at http://localhost:${PORT}/api-docs`);
  // console.log('Available API endpoints:');
  // console.log('  Authentication:');
  // console.log('    - POST /api/auth/signup - Create a new user account');
  // console.log('    - POST /api/auth/signin - Sign in to an existing account');
  // console.log('    - POST /api/auth/signout - Sign out of current session');
  // console.log('    - POST /api/auth/reset-password - Request password reset');
  // console.log('    - POST /api/auth/update-password - Update password');
  // console.log('    - POST /api/auth/google-signin - Sign in with Google');
  // console.log('    - POST /api/auth/verify-pin - Verify security PIN');
  // console.log('  Chat:');
  // console.log('    - POST /api/chat/student - Send student chat message');
  // console.log('    - GET /api/chat/student/history - Get student chat history');
  // console.log('    - DELETE /api/chat/student/history - Clear student chat history');
  // console.log('    - POST /api/chat/teacher - Send teacher chat message');
  // console.log('    - GET /api/chat/teacher/history - Get teacher chat history');
  // console.log('    - DELETE /api/chat/teacher/history - Clear teacher chat history');
  // console.log('  Lesson Plans:');
  // console.log('    - POST /api/lesson-plans - Create a new lesson plan');
  // console.log('    - GET /api/lesson-plans/teacher/:teacherId - Get all lesson plans for a teacher');
  // console.log('    - GET /api/lesson-plans/:planId - Get a specific lesson plan');
  // console.log('    - PUT /api/lesson-plans/:planId - Update a lesson plan');
  // console.log('    - DELETE /api/lesson-plans/:planId - Delete a lesson plan');
  // console.log('    - POST /api/lesson-plans/generate - Generate a lesson plan with AI');

  // console.log('  Admin:');
  // console.log('    - GET /api/trusty/gethods - Get all HODs');
  // console.log('    - PUT /api/trusty/updatehod/:id - Update a HOD');
  // console.log('    - DELETE /api/trusty/deletehod/:id - Delete a HOD');
  // console.log('    - GET /api/trusty/getstudents - Get all students');
  // console.log('    - PUT /api/trusty/updatestudent/:id - Update a student');
  // console.log('    - DELETE /api/trusty/deletestudent/:id - Delete a student');
  // console.log('    - GET /api/trusty/getteachers - Get all teachers');
  // console.log('    - PUT /api/trusty/updateteacher/:id - Update a teacher');
  // console.log('    - DELETE /api/trusty/deleteteacher/:id - Delete a teacher');
  // console.log('    - GET /api/trusty/getadmins - Get all admins');
  // console.log('    - PUT /api/trusty/updateadmin/:id - Update an admin');
  // console.log('    - DELETE /api/trusty/deleteadmin/:id - Delete an admin');
});
