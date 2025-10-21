const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getAllQuizzes,
  getTeacherQuizzes,
  getQuizById
} = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');
const teacherMiddleware = require('../middleware/teacherMiddleware');

// Protected routes - require authentication
router.use(authMiddleware);

// Routes for both teachers and students
router.get('/', getAllQuizzes);
router.get('/:id', getQuizById);

// Teacher-only routes
router.post('/create', teacherMiddleware, createQuiz);
router.get('/teacher/quizzes', teacherMiddleware, getTeacherQuizzes);

// Add verify route
router.get('/verify', authMiddleware, (req, res) => {
    res.status(200).json({ msg: 'Token is valid' });
});

module.exports = router;