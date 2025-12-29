const express = require('express');
const router = express.Router();
const { submitQuizAttempt, checkQuizAttempt, getStudentQuizHistory, getAllQuizAttempts, getQuizAttemptsByQuizId } = require('../controllers/quizAttemptController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all quiz attempts (for teachers)
router.get('/all', authMiddleware, getAllQuizAttempts);

// Get attempts for a specific quiz (for teachers)
router.get('/quiz/:quizEventId', authMiddleware, getQuizAttemptsByQuizId);

// Check if student has already attempted a quiz
router.get('/check/:quizEventId', authMiddleware, checkQuizAttempt);

// Get student's quiz history
router.get('/history', authMiddleware, getStudentQuizHistory);

// Submit a quiz attempt
router.post('/submit', authMiddleware, submitQuizAttempt);

module.exports = router;