const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define the registration route
// POST /api/auth/register
router.post('/register', authController.register);

// Define the login route
// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;

