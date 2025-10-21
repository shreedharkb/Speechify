const Quiz = require('../models/Quiz');
const QuizEvent = require('../models/QuizEvent');

// Create a new quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, subject, startTime, endTime, questions } = req.body;
    
    // Debug log
    console.log('Creating quiz with data:', {
      title,
      subject,
      startTime,
      endTime,
      questions,
      userId: req.user.id
    });

    // Validate required fields
    if (!title || !subject || !startTime || !endTime || !questions || questions.length === 0) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    // Create new quiz
    const quiz = new Quiz({
      title,
      subject,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      questions,
      createdBy: req.user.id, // from auth middleware
      status: 'upcoming'
    });

    // Create corresponding quiz event
    const quizEvent = new QuizEvent({
      title,
      subject,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      questions: questions.map(q => ({
        questionText: q.questionText,
        correctAnswerText: q.correctAnswer,
        points: q.points
      })),
      createdBy: req.user.id
    });

    // Update status based on current time
    const now = new Date();
    if (now >= quiz.startTime && now <= quiz.endTime) {
      quiz.status = 'active';
    } else if (now > quiz.endTime) {
      quiz.status = 'completed';
    }

    // Save both quiz and quiz event
    const [savedQuiz, savedQuizEvent] = await Promise.all([
      quiz.save(),
      quizEvent.save()
    ]);

    console.log('Quiz saved successfully:', savedQuiz);
    console.log('QuizEvent saved successfully:', savedQuizEvent);
    
    res.json({ 
      msg: 'Quiz created successfully',
      quiz: savedQuiz,
      quizEvent: savedQuizEvent
    });
  } catch (err) {
    console.error('Error creating quiz:', err);
    res.status(500).json({ msg: 'Server error while creating quiz' });
  }
};

// Get all active and upcoming quizzes for students
exports.getAllQuizzes = async (req, res) => {
  try {
    console.log('Fetching quizzes...');
    const now = new Date();
    console.log('Current date:', now.toISOString());
    
    // First, let's see if there are any quiz events at all
    const allQuizEvents = await QuizEvent.find({});
    console.log('Total quiz events in database:', allQuizEvents.length);
    
    if (allQuizEvents.length > 0) {
      console.log('Sample quiz event dates:');
      allQuizEvents.forEach(event => {
        console.log(`Quiz ${event._id}:`, {
          startTime: event.startTime,
          endTime: event.endTime
        });
      });
    }
    
    // Get all events for debugging
    const quizEvents = await QuizEvent.find({})
      .populate('createdBy', 'name')
      .sort({ startTime: 1 });
    
    console.log('All quiz events:', quizEvents.map(event => ({
      id: event._id,
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      createdBy: event.createdBy
    })));

    console.log(`Found ${quizEvents.length} quiz events`);

    // Add status and time information to each quiz event
    const updatedQuizEvents = quizEvents.map(event => {
      const eventData = event.toObject();
      const startDate = new Date(event.startTime);
      const endDate = new Date(event.endTime);

      // Format dates for display
      eventData.formattedStartTime = startDate.toLocaleString();
      eventData.formattedEndTime = endDate.toLocaleString();

      // Calculate status
      if (now >= startDate && now <= endDate) {
        eventData.status = 'active';
      } else if (now < startDate) {
        eventData.status = 'upcoming';
      }

      // Calculate time information
      if (eventData.status === 'upcoming') {
        const timeUntilStart = startDate - now;
        eventData.startsIn = {
          hours: Math.floor(timeUntilStart / (1000 * 60 * 60)),
          minutes: Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60))
        };
        eventData.timeRemaining = Math.floor(timeUntilStart / (1000 * 60)); // in minutes
      } else if (eventData.status === 'active') {
        const timeUntilEnd = endDate - now;
        eventData.timeRemaining = Math.floor(timeUntilEnd / (1000 * 60)); // in minutes
        eventData.startsIn = { hours: 0, minutes: 0 };
      }

      console.log(`Quiz ${event._id}: ${eventData.status}, Time remaining: ${eventData.timeRemaining} minutes`);
      return eventData;
    });

    res.json({
      quizEvents: updatedQuizEvents,
      timestamp: now.toISOString()
    });
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ msg: 'Server error while fetching quizzes' });
  }
};

// Get quizzes by teacher
exports.getTeacherQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user.id });
    res.json(quizzes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    res.status(500).send('Server error');
  }
};