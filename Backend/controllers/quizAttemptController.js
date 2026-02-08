const Quiz = require('../models/Quiz.prisma');
const StudentSubmission = require('../models/StudentSubmission.prisma');
const SubmissionEvaluation = require('../models/SubmissionEvaluation.prisma');
const { gradeAnswerWithAI } = require('./gradeController');
const { saveAudioToFile } = require('../utils/audioUtils');

const submitQuizAttempt = async (req, res) => {
  console.log('\n========== QUIZ SUBMISSION REQUEST ==========');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  console.log('User:', req.user);
  
  try {
    const { quizEventId, answers, startedAt } = req.body;
    const studentId = req.user.id;

    console.log('Submitting quiz attempt:', { quizId: quizEventId, studentId, answersCount: answers?.length });

    if (!quizEventId || !answers) {
      return res.status(400).json({ msg: 'Quiz ID and answers are required' });
    }

    // Find the quiz using Prisma
    const quiz = await Quiz.findById(parseInt(quizEventId));
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }

    // Check if student has already submitted this quiz
    const existingEvaluation = await SubmissionEvaluation.findByStudentAndQuiz(studentId, quiz.id);
    if (existingEvaluation) {
      console.log('Student already submitted this quiz - returning existing evaluation');
      // Return existing evaluation instead of error (handles double-submit gracefully)
      const totalPossible = quiz.questions.reduce((sum, q) => sum + (q.points || 10), 0);
      const percentage = totalPossible > 0 ? ((parseFloat(existingEvaluation.totalMarks) / totalPossible) * 100).toFixed(2) : 0;
      
      const gradedAnswers = existingEvaluation.questionResults.map(qr => ({
        questionId: qr.question_id,
        question: qr.question_text,
        studentAnswer: qr.student_answer,
        correctAnswer: qr.actual_answer,
        isCorrect: qr.similarity_score >= 0.70,
        pointsEarned: qr.marks_awarded,
        maxPoints: qr.max_points,
        similarityScore: qr.similarity_score,
        explanation: qr.similarity_score >= 0.70 ? 'Correct answer!' : 'Incorrect or partially correct'
      }));
      
      return res.json({
        msg: 'Quiz already submitted - returning previous results',
        score: parseFloat(existingEvaluation.totalMarks),
        totalPossible: totalPossible,
        percentage: percentage,
        answers: gradedAnswers,
        evaluationId: existingEvaluation.id,
        alreadySubmitted: true
      });
    }

    // Check if quiz is still active
    const now = new Date();
    if (now < new Date(quiz.startTime)) {
      return res.status(400).json({ msg: 'Quiz has not started yet' });
    }
    if (now > new Date(quiz.endTime)) {
      return res.status(400).json({ msg: 'Quiz has already ended' });
    }

    // Grade all answers using AI and prepare submission data
    const questionResults = [];
    const submissions = [];
    let totalMarks = 0;
    let totalSimilarity = 0;
    
    console.log(`Processing ${answers.length} answers...`);
    
    for (let index = 0; index < answers.length; index++) {
      const answerObj = answers[index];
      const question = quiz.questions[index];
      
      if (!question) {
        console.log(`Question ${index + 1} not found in quiz`);
        continue;
      }

      // Find the correct answer for this question from the correctAnswers array
      const correctAnswerObj = quiz.correctAnswers?.find(ca => ca.questionId === question.id);
      const correctAnswerText = correctAnswerObj?.answer || '';

      // Save audio file if provided
      let audioPath = null;
      if (answerObj.audioBlob) {
        // Save as .wav file in sounds/ folder
        audioPath = await saveAudioToFile(answerObj.audioBlob, Date.now(), question.id);
        if (audioPath) {
          console.log(`✓ Audio saved: sounds/${audioPath}`);
        }
      }

      // Grade the answer using AI
      const gradeResult = await gradeAnswerWithAI(
        question.text || question.questionText,
        answerObj.studentAnswer,
        correctAnswerText,
        0.70 // 70% threshold for correct answer
      );
      
      const maxPoints = question.points || 10;
      const similarityScore = gradeResult.similarityScore;
      const marksAwarded = Math.round(maxPoints * similarityScore * 100) / 100;
      
      totalMarks += marksAwarded;
      totalSimilarity += similarityScore;
      
      // Store submission data (will be saved later)
      submissions.push({
        studentId: studentId,
        quizId: quiz.id,
        questionId: question.id,
        audioPath: audioPath,
        transcribedAnswer: answerObj.studentAnswer
      });
      
      // Store question result for evaluation
      questionResults.push({
        question_id: question.id,
        question_text: question.text,
        student_answer: answerObj.studentAnswer,
        actual_answer: correctAnswerText,
        similarity_score: similarityScore,
        marks_awarded: marksAwarded,
        max_points: maxPoints
      });
      
      console.log(`Question ${index + 1}: ${marksAwarded.toFixed(2)}/${maxPoints} pts - Similarity: ${Math.round(similarityScore * 100)}%`);
    }

    // Calculate average similarity
    const avgSimilarity = answers.length > 0 ? totalSimilarity / answers.length : 0;

    // Save all submissions to database
    if (submissions.length > 0) {
      await StudentSubmission.createMany(submissions);
      console.log(`✓ Saved ${submissions.length} question submissions`);
    }

    // Create or update evaluation record (upsert to handle duplicate submissions gracefully)
    const evaluation = await SubmissionEvaluation.createOrUpdate({
      studentId: studentId,
      quizId: quiz.id,
      questionResults: questionResults,
      totalSimilarity: avgSimilarity,
      totalMarks: totalMarks
    });

    console.log(`✓ Evaluation saved: ID ${evaluation.id}`);

    // Calculate total possible marks
    const totalPossible = quiz.questions.reduce((sum, q) => sum + (q.points || 10), 0);
    const percentage = totalPossible > 0 ? ((totalMarks / totalPossible) * 100).toFixed(2) : 0;

    // Format response for frontend
    const gradedAnswers = questionResults.map(qr => ({
      questionId: qr.question_id,
      question: qr.question_text,
      studentAnswer: qr.student_answer,
      correctAnswer: qr.actual_answer,
      isCorrect: qr.similarity_score >= 0.70,
      pointsEarned: qr.marks_awarded,
      maxPoints: qr.max_points,
      similarityScore: qr.similarity_score,
      explanation: qr.similarity_score >= 0.70 ? 'Correct answer!' : 'Incorrect or partially correct'
    }));

    res.json({
      msg: 'Quiz submitted successfully',
      score: totalMarks,
      totalPossible: totalPossible,
      percentage: percentage,
      answers: gradedAnswers,
      evaluationId: evaluation.id
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
    const studentId = req.user.id;

    console.log('Checking quiz attempt:', { quizId: quizEventId, studentId });

    // Check if evaluation exists for this student and quiz
    const existingEvaluation = await SubmissionEvaluation.findByStudentAndQuiz(
      studentId, 
      parseInt(quizEventId)
    );

    if (existingEvaluation) {
      return res.json({
        attempted: true,
        evaluationId: existingEvaluation.id,
        score: existingEvaluation.totalMarks,
        submittedAt: existingEvaluation.createdAt
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
    const studentId = req.user.id;

    console.log('Fetching quiz history for student:', studentId);

    // Get all evaluations for the student using Prisma
    const evaluations = await SubmissionEvaluation.findByStudent(studentId);

    const attempts = evaluations.map(evaluation => {
      const quiz = evaluation.quiz;
      const questionResults = evaluation.questionResults || [];
      
      return {
        id: evaluation.id,
        quizId: quiz.id,
        quizTitle: quiz.title,
        subject: quiz.subject,
        score: evaluation.totalMarks,
        totalPossible: questionResults.reduce((sum, qr) => sum + (qr.max_points || 10), 0),
        percentage: questionResults.length > 0 
          ? ((evaluation.totalMarks / questionResults.reduce((sum, qr) => sum + (qr.max_points || 10), 0)) * 100).toFixed(1)
          : 0,
        submittedAt: evaluation.createdAt,
        startedAt: evaluation.createdAt, // Use createdAt as fallback
        answers: questionResults.map(qr => ({
          question: qr.question_text,
          studentAnswer: qr.student_answer,
          correctAnswer: qr.actual_answer,
          isCorrect: qr.similarity_score >= 0.70,
          pointsEarned: qr.marks_awarded,
          maxPoints: qr.max_points || 10,
          similarityScore: qr.similarity_score
        }))
      };
    });

    res.json({
      totalAttempts: attempts.length,
      attempts: attempts
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
    const teacherId = req.user.id;

    console.log('Fetching all quiz attempts for teacher:', teacherId);

    // Get all quizzes created by this teacher
    const teacherQuizzes = await Quiz.findByTeacherId(teacherId);
    const quizIds = teacherQuizzes.map(q => q.id);

    if (quizIds.length === 0) {
      return res.json({
        totalAttempts: 0,
        attempts: []
      });
    }

    // Get all evaluations for these quizzes
    let allEvaluations = [];
    for (const quizId of quizIds) {
      const evaluations = await SubmissionEvaluation.findByQuiz(quizId);
      allEvaluations = allEvaluations.concat(evaluations);
    }

    const attempts = allEvaluations.map(evaluation => ({
      id: evaluation.id,
      studentName: evaluation.student.name,
      studentRollNo: evaluation.student.rollNo,
      quizId: evaluation.quizId,
      quizTitle: evaluation.quiz.title,
      subject: evaluation.quiz.subject,
      score: evaluation.totalMarks,
      submittedAt: evaluation.createdAt
    }));

    console.log('Teacher attempts:', attempts.length);

    res.json({
      totalAttempts: attempts.length,
      attempts: attempts
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
    const teacherId = req.user.id;

    console.log('Fetching quiz attempts for quiz:', quizEventId);

    // First verify that this quiz belongs to the teacher
    const quiz = await Quiz.findById(parseInt(quizEventId));
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }

    if (quiz.teacherId !== teacherId) {
      return res.status(403).json({ msg: 'Not authorized to view this quiz\'s attempts' });
    }

    // Get all evaluations for this quiz
    const evaluations = await SubmissionEvaluation.findByQuiz(parseInt(quizEventId));

    console.log(`Found ${evaluations.length} attempts for quiz ${quizEventId}`);

    res.json({
      quizTitle: quiz.title,
      quizSubject: quiz.subject,
      totalAttempts: evaluations.length,
      attempts: evaluations.map(evaluation => ({
        evaluationId: evaluation.id,
        studentId: evaluation.studentId,
        studentName: evaluation.student.name,
        studentRollNo: evaluation.student.rollNo,
        studentEmail: evaluation.student.email,
        score: evaluation.totalMarks,
        submittedAt: evaluation.createdAt,
        questionResults: evaluation.questionResults
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
