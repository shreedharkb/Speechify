// @desc    Get all questions
// @route   GET /api/questions
// @access  Public (students and teachers)
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().populate('createdBy', 'name email role');
    res.json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
const Question = require('../models/Question');

// @desc    Create a new question
// @route   POST /api/questions/create
// @access  Private (Teachers only)
exports.createQuestion = async (req, res) => {
  try {
    const { questionText, correctAnswerText } = req.body;

    const newQuestion = new Question({
      questionText,
      correctAnswerText,
      createdBy: req.user.id, // The user ID comes from the authMiddleware
    });

    const question = await newQuestion.save();
    res.status(201).json(question);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
