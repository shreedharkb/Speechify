const QuizEvent = require('../models/QuizEvent');
const QuizAttempt = require('../models/QuizAttempt');

// Create a new quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, subject, description, startTime, endTime, questions } = req.body;
    
    console.log('Creating quiz with data:', {
      title,
      subject,
      startTime,
      endTime,
      questions: questions?.length,
      userId: req.user.id
    });

    // Validate required fields
    if (!title || !subject || !startTime || !endTime || !questions || questions.length === 0) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    // Create quiz event with questions
    const quizEvent = await QuizEvent.create({
      title,
      subject,
      description,
      createdBy: req.user.id,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      questions: questions.map(q => ({
        questionText: q.questionText || q.question,
        correctAnswerText: q.correctAnswer || q.correctAnswerText,
        points: q.points || 10
      }))
    });

    console.log('Quiz created successfully:', quizEvent.id);
    
    res.json({ 
      msg: 'Quiz created successfully',
      quizEvent
    });
  } catch (err) {
    console.error('Error creating quiz:', err);
    res.status(500).json({ msg: 'Server error while creating quiz', error: err.message });
  }
};

// Get all active and upcoming quizzes for students
exports.getAllQuizzes = async (req, res) => {
  try {
    console.log('Fetching quizzes...');
    const now = new Date();
    
    // Get all quiz events
    const quizEvents = await QuizEvent.findAll();
    
    console.log(`Found ${quizEvents.length} quiz events`);

    // Add status and time information to each quiz event
    const updatedQuizEvents = await Promise.all(quizEvents.map(async (event) => {
      const startDate = new Date(event.startTime);
      const endDate = new Date(event.endTime);

      // Calculate total points
      const totalPoints = event.questions.reduce((sum, q) => sum + (q.points || 10), 0);

      // Format dates for display
      event.formattedStartTime = startDate.toLocaleString();
      event.formattedEndTime = endDate.toLocaleString();

      // Calculate quiz duration in minutes
      const durationMs = endDate - startDate;
      event.duration = Math.floor(durationMs / (1000 * 60));

      // Calculate status
      if (now >= startDate && now <= endDate) {
        event.status = 'active';
      } else if (now < startDate) {
        event.status = 'upcoming';
      } else {
        event.status = 'completed';
      }

      // Calculate time information
      if (event.status === 'upcoming') {
        const timeUntilStart = startDate - now;
        event.startsIn = {
          hours: Math.floor(timeUntilStart / (1000 * 60 * 60)),
          minutes: Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60))
        };
        event.timeRemaining = Math.floor(timeUntilStart / (1000 * 60));
      } else if (event.status === 'active') {
        const timeUntilEnd = endDate - now;
        event.timeRemaining = Math.floor(timeUntilEnd / (1000 * 60));
        event.startsIn = { hours: 0, minutes: 0 };
      }

      // Check if student has attempted this quiz
      if (req.user && req.user.id) {
        const attempt = await QuizAttempt.findByStudentAndQuiz(req.user.id, event.id);
        event.hasAttempted = !!attempt;
        event.attempts = attempt ? 1 : 0;
      } else {
        event.hasAttempted = false;
        event.attempts = 0;
      }

      // Add total points
      event.totalPoints = totalPoints;

      console.log(`Quiz ${event.id}: ${event.status}, Duration: ${event.duration} minutes, Questions: ${event.questions.length}, Points: ${totalPoints}`);
      return event;
    }));

    res.json({
      quizEvents: updatedQuizEvents,
      timestamp: now.toISOString()
    });
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ msg: 'Server error while fetching quizzes', error: err.message });
  }
};

// Get quizzes by teacher
exports.getTeacherQuizzes = async (req, res) => {
  try {
    const quizEvents = await QuizEvent.findByCreator(req.user.id);
    res.json(quizEvents);
  } catch (err) {
    console.error('Error fetching teacher quizzes:', err);
    res.status(500).send('Server error');
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await QuizEvent.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (err) {
    console.error('Error fetching quiz:', err);
    res.status(500).send('Server error');
  }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await QuizEvent.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }

    // Check if user is the creator
    if (quiz.created_by !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this quiz' });
    }

    await QuizEvent.delete(req.params.id);
    res.json({ msg: 'Quiz deleted successfully' });
  } catch (err) {
    console.error('Error deleting quiz:', err);
    res.status(500).send('Server error');
  }
};

// Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    const { title, subject, description, startTime, endTime } = req.body;
    const quiz = await QuizEvent.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }

    // Check if user is the creator
    if (quiz.created_by !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this quiz' });
    }

    const updatedQuiz = await QuizEvent.update(req.params.id, {
      title,
      subject,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime)
    });

    res.json({ msg: 'Quiz updated successfully', quiz: updatedQuiz });
  } catch (err) {
    console.error('Error updating quiz:', err);
    res.status(500).send('Server error');
  }
};
