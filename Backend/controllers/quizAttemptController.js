const QuizEvent = require('../models/QuizEvent');
const QuizAttempt = require('../models/QuizAttempt');
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
    const existingAttempt = await QuizAttempt.findByStudentAndQuiz(userId, quizEventId);
    if (existingAttempt) {
      return res.status(400).json({ 
        msg: 'You have already submitted this quiz',
        alreadyAttempted: true,
        attemptId: existingAttempt.id
      });
    }

    // Check if quiz is still active
    const now = new Date();
    if (now < new Date(quizEvent.startTime)) {
      return res.status(400).json({ msg: 'Quiz has not started yet' });
    }
    if (now > new Date(quizEvent.endTime)) {
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
          questionId: null,
          question: answerObj.question,
          studentAnswer: answerObj.studentAnswer,
          correctAnswer: '',
          isCorrect: false,
          pointsEarned: 0,
          maxPoints: 10,
          similarityScore: 0,
          explanation: 'Question not found'
        });
        continue;
      }

      // Use AI grading
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
      
      // Use AI's similarity score
      percentageEarned = gradeResult.similarityScore;
      
      // Determine if correct based on threshold
      if (gradeResult.similarityScore >= 0.70) {
        isCorrect = true;
      }
      
      // Calculate points based on AI similarity assessment
      pointsEarned = maxPoints * percentageEarned;
      
      // Round to 2 decimal places
      pointsEarned = Math.round(pointsEarned * 100) / 100;
      
      // Ensure we never exceed max points
      pointsEarned = Math.min(pointsEarned, maxPoints);
      
      totalPoints += pointsEarned;
      if (isCorrect) correctAnswers++;

      gradedAnswers.push({
        questionId: question.id,
        question: question.questionText,
        studentAnswer: answerObj.studentAnswer,
        correctAnswer: question.correctAnswerText,
        isCorrect: isCorrect,
        pointsEarned: pointsEarned,
        maxPoints: maxPoints,
        similarityScore: gradeResult.similarityScore,
        explanation: gradeResult.explanation
      });
      
      console.log(`Question ${index + 1}: ${isCorrect ? 'CORRECT' : 'INCORRECT'} - ${pointsEarned.toFixed(2)}/${maxPoints} pts - Similarity: ${Math.round(gradeResult.similarityScore * 100)}%`);
    }

    // Create quiz attempt record
    const quizAttempt = await QuizAttempt.create({
      quizEventId: quizEventId,
      studentId: userId,
      answers: gradedAnswers,
      score: totalPoints,
      startedAt: req.body.startedAt || now,
      submittedAt: now
    });

    console.log('Quiz attempt saved:', quizAttempt.id);

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
      attemptId: quizAttempt.id
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

    const existingAttempt = await QuizAttempt.findByStudentAndQuiz(userId, quizEventId);

    if (existingAttempt) {
      return res.json({
        attempted: true,
        attemptId: existingAttempt.id,
        score: existingAttempt.score,
        submittedAt: existingAttempt.submitted_at
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
    const attempts = await QuizAttempt.findByStudent(userId);

    const history = attempts.map(attempt => ({
      attemptId: attempt.id,
      quizTitle: attempt.quiz_title || 'Unknown Quiz',
      quizSubject: attempt.subject || 'N/A',
      score: attempt.score,
      startedAt: attempt.started_at,
      submittedAt: attempt.submitted_at
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

    // Get all quizzes created by this teacher
    const teacherQuizzes = await QuizEvent.findByCreator(userId);
    const quizIds = teacherQuizzes.map(q => q.id);

    if (quizIds.length === 0) {
      return res.json({
        totalAttempts: 0,
        attempts: []
      });
    }

    // Get all attempts for these quizzes
    let allAttempts = [];
    for (const quizId of quizIds) {
      const attempts = await QuizAttempt.findByQuizEvent(quizId);
      allAttempts = allAttempts.concat(attempts);
    }

    console.log('Teacher attempts:', allAttempts.length);

    res.json({
      totalAttempts: allAttempts.length,
      attempts: allAttempts
    });

  } catch (err) {
    console.error('Error fetching all quiz attempts:', err);
    res.status(500).json({ 
      msg: 'Server error while fetching quiz attempts',
      error: err.message 
    });
  }
};

const getQuizAttemptsByQuizId = async (req, res) => {
  try {
    const { quizEventId } = req.params;
    const userId = req.user.id;

    console.log('Fetching quiz attempts for quiz:', quizEventId);

    // First verify that this quiz belongs to the teacher
    const quiz = await QuizEvent.findById(quizEventId);
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }

    if (quiz.createdBy !== userId) {
      return res.status(403).json({ msg: 'Not authorized to view this quiz\'s attempts' });
    }

    // Get all attempts for this quiz
    const attempts = await QuizAttempt.findByQuizEvent(quizEventId);

    console.log(`Found ${attempts.length} attempts for quiz ${quizEventId}`);

    res.json({
      quizTitle: quiz.title,
      quizSubject: quiz.subject,
      totalAttempts: attempts.length,
      attempts: attempts.map(attempt => ({
        attemptId: attempt.id,
        studentId: attempt.student_id,
        studentName: attempt.student_name || 'Unknown Student',
        studentEmail: attempt.student_email || '',
        score: attempt.score,
        startedAt: attempt.started_at,
        submittedAt: attempt.submitted_at,
        answers: attempt.answers
      }))
    });

  } catch (err) {
    console.error('Error fetching quiz attempts:', err);
    res.status(500).json({ 
      msg: 'Server error while fetching quiz attempts',
      error: err.message 
    });
  }
};

module.exports = { submitQuizAttempt, checkQuizAttempt, getStudentQuizHistory, getAllQuizAttempts, getQuizAttemptsByQuizId };
