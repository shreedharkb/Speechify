const express = require('express');
const router = express.Router();
const { submitQuizAttempt } = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

// Submit a quiz attempt
router.post('/:quizId/submit', authMiddleware, submitQuizAttempt);

module.exports = router;