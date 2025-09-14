const express = require('express');
const router = express.Router();
const { createQuestion, getAllQuestions } = require('../controllers/questionController');
// Route for students and teachers to fetch all questions
router.get('/', getAllQuestions);
const authMiddleware = require('../middleware/authMiddleware');
const teacherMiddleware = require('../middleware/teacherMiddleware');

// This route is protected by two layers of security.
// A request must first pass authMiddleware (be logged in),
// then it must pass teacherMiddleware (be a teacher),
// before it can finally run createQuestion.
router.post('/create', [authMiddleware, teacherMiddleware], createQuestion);

module.exports = router;
