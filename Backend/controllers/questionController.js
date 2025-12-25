const QuizEvent = require('../models/QuizEvent');

// @desc    Get all quiz events (with questions)
// @route   GET /api/questions
// @access  Public (students and teachers)
exports.getAllQuestions = async (req, res) => {
  try {
    const quizEvents = await QuizEvent.findAll();
    res.json(quizEvents);
  } catch (err) {
    console.error('Error fetching questions:', err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Add a question to a quiz event (or create a new quiz event)
// @route   POST /api/questions/create
// @access  Private (Teachers only)
exports.createQuestion = async (req, res) => {
  try {
    const { quizEventId, questionText, correctAnswerText, points } = req.body;
    
    if (quizEventId) {
      // Adding questions to existing quiz event not yet implemented in PostgreSQL
      return res.status(501).json({ msg: 'Adding questions to existing quiz not yet implemented. Please create a new quiz with all questions.' });
    } else {
      // Create a new quiz event with this question
      const quizEvent = await QuizEvent.create({
        title: 'Untitled Quiz',
        subject: 'General',
        createdBy: req.user.id,
        startTime: new Date(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        questions: [{ questionText, correctAnswerText, points: points || 10 }]
      });
      res.status(201).json(quizEvent);
    }
  } catch (err) {
    console.error('Error creating question:', err.message);
    res.status(500).send('Server Error');
  }
};
