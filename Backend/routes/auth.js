const express = require('express');
const router = express.Router();
// Import all three functions from the controller
const { register, login, makeTeacher } = require('../controllers/authController');

// Define the registration route
router.post('/register', register);

// Define the login route
router.post('/login', login);

// --- NEW ROUTE ---
// Define the route to make a user a teacher
router.post('/make-teacher', makeTeacher);

module.exports = router;
