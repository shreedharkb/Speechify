const QuizEvent = require('../models/QuizEvent');
const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz.prisma');
const { saveBase64Image, isDataUri } = require('../utils/imageUtils');

// Create a new quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, subject, courseCode, description, startTime, endTime, questions, correctAnswers } = req.body;
    
    console.log('Creating quiz with data:', {
      title,
      subject,
      courseCode,
      startTime,
      endTime,
      questions: questions?.length,
      teacherId: req.user.id
    });

    // Validate required fields
    if (!title || !subject || !courseCode || !startTime || !endTime || !questions || questions.length === 0) {
      return res.status(400).json({ msg: 'Please provide all required fields including courseCode' });
    }

    // Log incoming questions to debug image issue
    console.log('Incoming questions:', JSON.stringify(questions, null, 2));

    // Format questions to include points field (default 10 if not provided)
    // Process images asynchronously to convert base64 to files
    const formattedQuestions = await Promise.all(questions.map(async (q, index) => {
      // Handle image field properly - check both 'image' and 'imageUrl' properties
      let imageData = null;
      const imageSource = q.image || q.imageUrl;
      
      if (imageSource) {
        // If image is already an object with type and value, use it
        if (typeof imageSource === 'object' && imageSource.type && imageSource.value) {
          imageData = imageSource;
        }
        // If image is a string (URL or data URI), format it properly
        else if (typeof imageSource === 'string' && imageSource.trim() !== '') {
          // Check if it's a data URI (base64 encoded image)
          if (imageSource.startsWith('data:image/')) {
            try {
              // Convert base64 to file and get the URL
              const savedImageUrl = await saveBase64Image(imageSource, `quiz-q${index + 1}`);
              imageData = {
                type: 'url',
                value: savedImageUrl
              };
              console.log(`✅ Converted base64 image to file: ${savedImageUrl}`);
            } catch (error) {
              console.error(`❌ Failed to save base64 image for question ${index + 1}:`, error);
              // Fallback: store as base64 in database (not recommended for large images)
              imageData = {
                type: 'base64',
                value: imageSource
              };
            }
          } else {
            // Regular URL
            imageData = {
              type: 'url',
              value: imageSource
            };
          }
        }
        // If image has url property, use it
        else if (imageSource.url) {
          imageData = {
            type: 'url',
            value: imageSource.url
          };
        }
      }

      return {
        id: q.id || index + 1,
        text: q.text || q.questionText || q.question,
        points: q.points || 10,
        image: imageData
      };
    }));

    console.log('Formatted questions:', JSON.stringify(formattedQuestions, null, 2));

    // Format correct answers
    const formattedAnswers = correctAnswers ? correctAnswers : questions.map((q, index) => ({
      questionId: q.id || index + 1,
      answer: q.correctAnswer || q.correctAnswerText || ''
    }));

    // Create quiz using Prisma model with JSONB questions
    const quiz = await Quiz.create({
      teacherId: req.user.id,
      title,
      subject,
      courseCode,
      description: description || '',
      questions: formattedQuestions,
      correctAnswers: formattedAnswers,
      startTime: new Date(startTime),
      endTime: new Date(endTime)
    });

    console.log('Quiz created successfully:', quiz.id);
    
    res.json({ 
      msg: 'Quiz created successfully',
      quiz: {
        id: quiz.id,
        title: quiz.title,
        subject: quiz.subject,
        courseCode: quiz.courseCode,
        description: quiz.description,
        startTime: quiz.startTime,
        endTime: quiz.endTime,
        questions: quiz.questions,
        questionCount: quiz.questions.length,
        totalPoints: quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0)
      }
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
    
    // Get all quizzes from Prisma
    const quizzes = await Quiz.findAll();
    
    console.log(`Found ${quizzes.length} quizzes`);

    // Add status and time information to each quiz
    const updatedQuizzes = quizzes.map(quiz => {
      const startDate = new Date(quiz.startTime);
      const endDate = new Date(quiz.endTime);

      // Calculate total points
      const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 10), 0);

      // Format dates for display
      const formattedStartTime = startDate.toLocaleString();
      const formattedEndTime = endDate.toLocaleString();

      // Calculate quiz duration in minutes
      const durationMs = endDate - startDate;
      const duration = Math.floor(durationMs / (1000 * 60));

      // Calculate status
      let status;
      if (now >= startDate && now <= endDate) {
        status = 'active';
      } else if (now < startDate) {
        status = 'upcoming';
      } else {
        status = 'completed';
      }

      // Calculate time information
      let timeInfo = {};
      if (status === 'upcoming') {
        const timeUntilStart = startDate - now;
        timeInfo.startsIn = {
          hours: Math.floor(timeUntilStart / (1000 * 60 * 60)),
          minutes: Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60))
        };
        timeInfo.timeRemaining = Math.floor(timeUntilStart / (1000 * 60));
      } else if (status === 'active') {
        const timeUntilEnd = endDate - now;
        timeInfo.timeRemaining = Math.floor(timeUntilEnd / (1000 * 60));
        timeInfo.startsIn = { hours: 0, minutes: 0 };
      }

      console.log(`Quiz ${quiz.id}: ${status}, Duration: ${duration} minutes, Questions: ${quiz.questions.length}, Points: ${totalPoints}`);
      
      // Transform questions to match frontend expectations
      const transformedQuestions = quiz.questions.map(q => ({
        id: q.id,
        questionText: q.text,  // Convert 'text' to 'questionText'
        points: q.points || 10,
        imageUrl: q.image && q.image.value ? q.image.value : null  // Extract image URL if exists
      }));
      
      return {
        id: quiz.id,
        title: quiz.title,
        subject: quiz.subject,
        courseCode: quiz.courseCode,
        description: quiz.description,
        startTime: quiz.startTime,
        endTime: quiz.endTime,
        formattedStartTime,
        formattedEndTime,
        duration,
        status,
        questions: transformedQuestions,  // Include transformed questions
        questionCount: quiz.questions.length,
        totalPoints,
        hasAttempted: false,
        attempts: 0,
        ...timeInfo
      };
    });

    res.json({
      quizEvents: updatedQuizzes,  // Changed from 'quizzes' to 'quizEvents' to match frontend expectation
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
    const quizzes = await Quiz.findByTeacherId(req.user.id);
    
    // Add calculated fields
    const enrichedQuizzes = quizzes.map(quiz => ({
      ...quiz,
      questionCount: quiz.questions.length,
      totalPoints: quiz.questions.reduce((sum, q) => sum + (q.points || 10), 0),
      status: new Date() >= new Date(quiz.startTime) && new Date() <= new Date(quiz.endTime) 
        ? 'active' 
        : new Date() < new Date(quiz.startTime) 
        ? 'upcoming' 
        : 'completed'
    }));
    
    res.json(enrichedQuizzes);
  } catch (err) {
    console.error('Error fetching teacher quizzes:', err);
    res.status(500).send('Server error');
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(parseInt(req.params.id));
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Transform questions to match frontend expectations
    const transformedQuestions = quiz.questions.map(q => ({
      id: q.id,
      questionText: q.text,  // Convert 'text' to 'questionText'
      points: q.points || 10,
      imageUrl: q.image && q.image.value ? q.image.value : null  // Extract image URL if exists
    }));
    
    // Add calculated fields
    const enrichedQuiz = {
      ...quiz,
      questions: transformedQuestions,  // Use transformed questions
      questionCount: quiz.questions.length,
      totalPoints: quiz.questions.reduce((sum, q) => sum + (q.points || 10), 0)
    };
    
    res.json(enrichedQuiz);
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
