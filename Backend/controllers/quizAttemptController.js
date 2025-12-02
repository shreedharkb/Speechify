const QuizEvent = require('../models/QuizEvent');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const { gradeAnswerWithAI } = require('./gradeController');

const submitQuizAttempt = async (req, res) => {
  try {
    const { quizEventId, answers } = req.body;
    const userId = req.user.id;

    console.log('Submitting quiz attempt:', { quizEventId, userId, answersCount: answers?.length });

    if (!quizEventId || !answers) {
      return res.status(400).json({ msg: 'Quiz event ID and answers are required' });
    }

    // Find the quiz event
    const quizEvent = await QuizEvent.findById(quizEventId);
    if (!quizEvent) {
      return res.status(404).json({ msg: 'Quiz event not found' });
    }

    // Check if student has already attempted this quiz
    const existingAttempt = await QuizAttempt.findOne({
      student: userId,
      quizEvent: quizEventId
    });

    if (existingAttempt) {
      return res.status(400).json({ 
        msg: 'You have already submitted this quiz',
        alreadyAttempted: true,
        attemptId: existingAttempt._id
      });
    }

    // Check if quiz is still active
    const now = new Date();
    if (now < quizEvent.startTime) {
      return res.status(400).json({ msg: 'Quiz has not started yet' });
    }
    if (now > quizEvent.endTime) {
      return res.status(400).json({ msg: 'Quiz has already ended' });
    }

    // Calculate score using AI semantic grading
    let totalPoints = 0;
    let correctAnswers = 0;
    
    // Grade all answers using AI
    const gradedAnswers = [];
    
    for (let index = 0; index < answers.length; index++) {
      const answerObj = answers[index];
      const question = quizEvent.questions[index];
      
      if (!question) {
        gradedAnswers.push({
          question: answerObj.question,
          studentAnswer: answerObj.studentAnswer,
          correctAnswer: '',
          isCorrect: false,
          pointsEarned: 0,
          similarityScore: 0,
          explanation: 'Question not found'
        });
        continue;
      }

      // Use AI grading - let Gemini decide the score based on semantic understanding
      const gradeResult = await gradeAnswerWithAI(
        question.questionText,
        answerObj.studentAnswer,
        question.correctAnswerText,
        0.70 // 70% threshold for correct answer
      );
      
      const maxPoints = question.points || 10;
      let pointsEarned = 0;
      let percentageEarned = 0;
      let isCorrect = false;
      
      // Use Gemini's similarity score directly - trust the AI's judgment
      percentageEarned = gradeResult.similarityScore;
      
      // Determine if correct based on threshold
      if (gradeResult.similarityScore >= 0.70) {
        isCorrect = true;
      }
      
      // Calculate points based on Gemini's similarity assessment
      pointsEarned = maxPoints * percentageEarned;
      
      // Round to 2 decimal places
      pointsEarned = Math.round(pointsEarned * 100) / 100;
      
      // Ensure we never exceed max points
      pointsEarned = Math.min(pointsEarned, maxPoints);
      
      totalPoints += pointsEarned;
      if (isCorrect) correctAnswers++;

      gradedAnswers.push({
        question: question.questionText,
        studentAnswer: answerObj.studentAnswer,
        correctAnswer: question.correctAnswerText,
        isCorrect: isCorrect,
        pointsEarned: pointsEarned,
        percentageEarned: percentageEarned,
        maxPoints: maxPoints,
        similarityScore: gradeResult.similarityScore,
        explanation: gradeResult.explanation
      });
      
      console.log(`Question ${index + 1}: ${isCorrect ? 'CORRECT' : 'INCORRECT'} - ${pointsEarned.toFixed(2)}/${maxPoints} pts (${Math.round(percentageEarned * 100)}%) - Similarity: ${Math.round(gradeResult.similarityScore * 100)}%`);
    }

    // Create quiz attempt record
    const quizAttempt = new QuizAttempt({
      student: userId,
      quizEvent: quizEventId,
      answers: gradedAnswers,
      score: totalPoints,
      startedAt: req.body.startedAt || now,
      submittedAt: now
    });

    await quizAttempt.save();
    console.log('Quiz attempt saved:', quizAttempt._id);

    // Update student's quizzesAttended array
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { quizzesAttended: quizAttempt._id } },
      { new: true }
    );
    console.log('Student record updated with quiz attempt');

    const totalPossible = quizEvent.questions.reduce((sum, q) => sum + (q.points || 10), 0);
    const percentage = totalPossible > 0 ? ((totalPoints / totalPossible) * 100).toFixed(2) : 0;

    res.json({
      msg: 'Quiz submitted successfully',
      score: totalPoints,
      totalPossible: totalPossible,
      percentage: percentage,
      correctAnswers: correctAnswers,
      totalQuestions: quizEvent.questions.length,
      answers: gradedAnswers,
      attemptId: quizAttempt._id
    });

  } catch (err) {
    console.error('Error submitting quiz:', err);
    res.status(500).json({ 
      msg: 'Server error while submitting quiz',
      error: err.message 
    });
  }
};

const checkQuizAttempt = async (req, res) => {
  try {
    const { quizEventId } = req.params;
    const userId = req.user.id;

    console.log('Checking quiz attempt:', { quizEventId, userId });

    const existingAttempt = await QuizAttempt.findOne({
      student: userId,
      quizEvent: quizEventId
    });

    if (existingAttempt) {
      return res.json({
        attempted: true,
        attemptId: existingAttempt._id,
        score: existingAttempt.score,
        submittedAt: existingAttempt.submittedAt
      });
    }

    return res.json({
      attempted: false
    });

  } catch (err) {
    console.error('Error checking quiz attempt:', err);
    res.status(500).json({ 
      msg: 'Server error while checking quiz attempt',
      error: err.message 
    });
  }
};

const getStudentQuizHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('Fetching quiz history for student:', userId);

    // Get all quiz attempts for the student
    const attempts = await QuizAttempt.find({ student: userId })
      .populate('quizEvent', 'title subject startTime endTime')
      .sort({ submittedAt: -1 });

    const history = attempts.map(attempt => ({
      attemptId: attempt._id,
      quizTitle: attempt.quizEvent?.title || 'Unknown Quiz',
      quizSubject: attempt.quizEvent?.subject || 'N/A',
      score: attempt.score,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      answers: attempt.answers
    }));

    res.json({
      totalAttempts: history.length,
      attempts: history
    });

  } catch (err) {
    console.error('Error fetching quiz history:', err);
    res.status(500).json({ 
      msg: 'Server error while fetching quiz history',
      error: err.message 
    });
  }
};

const getAllQuizAttempts = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('Fetching all quiz attempts for teacher:', userId);

    // Get all quiz attempts with populated student and quiz event data
    const allAttempts = await QuizAttempt.find()
      .populate('student', 'name email')
      .populate({
        path: 'quizEvent',
        populate: {
          path: 'createdBy',
          select: 'name email'
        }
      })
      .sort({ submittedAt: -1 });

    console.log('Total attempts in database:', allAttempts.length);

    // Filter to only include quizzes created by this teacher
    const teacherAttempts = allAttempts.filter(attempt => {
      const hasQuizEvent = attempt.quizEvent != null;
      const hasCreatedBy = attempt.quizEvent?.createdBy != null;
      const creatorMatch = attempt.quizEvent?.createdBy?._id?.toString() === userId;
      
      return hasQuizEvent && hasCreatedBy && creatorMatch;
    });

    console.log('Teacher attempts after filter:', teacherAttempts.length);

    res.json({
      totalAttempts: teacherAttempts.length,
      attempts: teacherAttempts
    });

  } catch (err) {
    console.error('Error fetching all quiz attempts:', err);
    res.status(500).json({ 
      msg: 'Server error while fetching quiz attempts',
      error: err.message 
    });
  }
};

module.exports = { submitQuizAttempt, checkQuizAttempt, getStudentQuizHistory, getAllQuizAttempts };