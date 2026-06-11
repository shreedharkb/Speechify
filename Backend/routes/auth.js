const express = require('express');
const router = express.Router();
// Import all three functions from the controller
const { register, login, makeTeacher, googleAuth, forgotPassword, resetPassword } = require('../controllers/authController');

// Define the registration route
router.post('/register', register);

// Define the login route
router.post('/login', login);

// Define the google auth route
router.post('/google', googleAuth);

// Define the forgot password route
router.post('/forgot-password', forgotPassword);

// Define the reset password route
router.post('/reset-password', resetPassword);

// --- NEW ROUTE ---
// Define the route to make a user a teacher
router.post('/make-teacher', makeTeacher);

module.exports = router;
