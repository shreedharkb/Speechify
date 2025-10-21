
const QuizEvent = require('../models/QuizEvent');

// @desc    Get all quiz events (with questions)
// @route   GET /api/questions
// @access  Public (students and teachers)
exports.getAllQuestions = async (req, res) => {
  try {
    const quizEvents = await QuizEvent.find().populate('createdBy', 'name email role');
    res.json(quizEvents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Add a question to a quiz event (or create a new quiz event)
// @route   POST /api/questions/create
// @access  Private (Teachers only)
exports.createQuestion = async (req, res) => {
  try {
    const { quizEventId, questionText, correctAnswerText, points } = req.body;
    let quizEvent;

    if (quizEventId) {
      // Add question to existing quiz event
      quizEvent = await QuizEvent.findById(quizEventId);
      if (!quizEvent) return res.status(404).json({ msg: 'Quiz event not found' });
      quizEvent.questions.push({ questionText, correctAnswerText, points: points || 10 });
      await quizEvent.save();
    } else {
      // Create a new quiz event with this question
      quizEvent = new QuizEvent({
        title: 'Untitled Quiz',
        subject: 'General',
        createdBy: req.user.id,
        startTime: new Date(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        questions: [{ questionText, correctAnswerText, points: points || 10 }],
      });
      await quizEvent.save();
    }
    res.status(201).json(quizEvent);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
