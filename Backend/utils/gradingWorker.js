const { quizQueue } = require('./queue');
const Quiz = require('../models/Quiz.prisma');
const StudentSubmission = require('../models/StudentSubmission.prisma');
const SubmissionEvaluation = require('../models/SubmissionEvaluation.prisma');
const { gradeAnswerWithAI } = require('../controllers/gradeController');
const { saveAudioToFile } = require('./audioUtils');

let ioInstance = null;

// Function to initialize the worker with the socket.io instance
const initializeGradingWorker = (io) => {
  ioInstance = io;
  
  // Start processing jobs
  quizQueue.process('grade-quiz', async (job) => {
    try {
      const { quizId, studentId, answers } = job.data;
      console.log(`[Worker] Started grading job ${job.id} for student ${studentId} on quiz ${quizId}`);
      
      const quiz = await Quiz.findById(quizId);
      if (!quiz) throw new Error('Quiz not found');

      const questionResults = [];
      const submissions = [];
      let totalMarks = 0;
      let totalSimilarity = 0;

      for (let index = 0; index < answers.length; index++) {
        const answerObj = answers[index];
        const question = quiz.questions[index];
        
        if (!question) continue;

        const correctAnswerObj = quiz.correctAnswers?.find(ca => ca.questionId === question.id);
        const correctAnswerText = correctAnswerObj?.answer || '';

        // Handle Audio
        let audioPath = null;
        if (answerObj.audioBlob) {
          audioPath = await saveAudioToFile(answerObj.audioBlob, Date.now(), question.id);
        }

        // Grade Answer
        const gradeResult = await gradeAnswerWithAI(
          question.text || question.questionText,
          answerObj.studentAnswer,
          correctAnswerText,
          0.70
        );

        const maxPoints = question.points || 10;
        const similarityScore = gradeResult.similarityScore;
        const marksAwarded = Math.round(maxPoints * similarityScore * 100) / 100;

        totalMarks += marksAwarded;
        totalSimilarity += similarityScore;

        submissions.push({
          studentId: studentId,
          quizId: quiz.id,
          questionId: question.id,
          audioPath: audioPath,
          transcribedAnswer: answerObj.studentAnswer
        });

        questionResults.push({
          question_id: question.id,
          question_text: question.text,
          student_answer: answerObj.studentAnswer,
          actual_answer: correctAnswerText,
          similarity_score: similarityScore,
          marks_awarded: marksAwarded,
          max_points: maxPoints
        });
      }

      const avgSimilarity = answers.length > 0 ? totalSimilarity / answers.length : 0;

      if (submissions.length > 0) {
        await StudentSubmission.createMany(submissions);
      }

      const evaluation = await SubmissionEvaluation.createOrUpdate({
        studentId: studentId,
        quizId: quiz.id,
        questionResults: questionResults,
        totalSimilarity: avgSimilarity,
        totalMarks: totalMarks
      });

      console.log(`[Worker] Finished grading job ${job.id}. Evaluation ID: ${evaluation.id}`);

      const totalPossible = quiz.questions.reduce((sum, q) => sum + (q.points || 10), 0);
      const percentage = totalPossible > 0 ? ((totalMarks / totalPossible) * 100).toFixed(2) : 0;

      const formattedResults = {
        quizTitle: quiz.title,
        submittedAt: new Date().toISOString(),
        timeTaken: 'N/A',
        questions: questionResults.map(qr => ({
          questionText: qr.question_text,
          studentAnswer: qr.student_answer,
          correctAnswer: qr.actual_answer,
          isCorrect: qr.similarity_score >= 0.70,
          pointsEarned: qr.marks_awarded,
          maxPoints: qr.max_points || 10,
          points: qr.max_points || 10,
          similarityScore: qr.similarity_score,
          feedback: qr.similarity_score >= 0.70 ? 'Correct answer!' : 'Incorrect or partially correct'
        })),
        score: totalMarks,
        totalPossible: totalPossible,
        percentage: percentage
      };

      // Emit WebSocket event to the student's room
      if (ioInstance) {
        ioInstance.to(`student_${studentId}`).emit(`quizGraded:${studentId}:${quizId}`, {
          status: 'completed',
          evaluationId: evaluation.id,
          results: formattedResults
        });
      }

      return { evaluationId: evaluation.id, score: totalMarks };
    } catch (error) {
      console.error(`[Worker] Error in job ${job.id}:`, error);
      
      // Attempt to notify user of failure
      if (ioInstance && job.data) {
        ioInstance.to(`student_${job.data.studentId}`).emit(`quizGraded:${job.data.studentId}:${job.data.quizId}`, {
          status: 'failed',
          error: error.message
        });
      }
      throw error;
    }
  });

  console.log('✅ Grading Worker initialized');
};

module.exports = { initializeGradingWorker };
