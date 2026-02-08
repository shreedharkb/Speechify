const prisma = require('../config/prisma');

const QuizAttemptModel = {
  // Create a new quiz attempt with answers
  create: async (attemptData) => {
    const { quizEventId, studentId, answers, score, startedAt, submittedAt } = attemptData;
    
    return await prisma.quizAttempt.create({
      data: {
        quizEventId,
        studentId,
        score: score || 0,
        startedAt: startedAt ? new Date(startedAt) : null,
        submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
        answers: {
          create: answers?.map(answer => ({
            questionId: answer.questionId || null,
            questionText: answer.question,
            studentAnswer: answer.studentAnswer,
            correctAnswer: answer.correctAnswer,
            isCorrect: answer.isCorrect,
            pointsEarned: answer.pointsEarned || 0,
            maxPoints: answer.maxPoints || 10,
            similarityScore: answer.similarityScore || null,
            explanation: answer.explanation || null,
            audio: answer.audioBlob || null,
            audioPath: answer.audioPath || null
          })) || []
        }
      },
      include: {
        answers: true,
        quizEvent: {
          select: {
            title: true,
            subject: true
          }
        },
        student: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
  },

  // Find quiz attempt by ID with answers
  findById: async (id) => {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id },
      include: {
        answers: {
          orderBy: { id: 'asc' }
        },
        quizEvent: {
          select: {
            title: true,
            subject: true
          }
        },
        student: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!attempt) return null;

    return {
      ...attempt,
      quiz_title: attempt.quizEvent?.title,
      subject: attempt.quizEvent?.subject,
      student_name: attempt.student?.name,
      student_email: attempt.student?.email
    };
  },

  // Find attempt by student and quiz event
  findByStudentAndQuiz: async (studentId, quizEventId) => {
    const attempt = await prisma.quizAttempt.findUnique({
      where: {
        quizEventId_studentId: {
          quizEventId,
          studentId
        }
      },
      include: {
        answers: {
          orderBy: { id: 'asc' }
        },
        quizEvent: true,
        student: true
      }
    });

    if (!attempt) return null;

    return {
      ...attempt,
      quiz_title: attempt.quizEvent?.title,
      subject: attempt.quizEvent?.subject,
      student_name: attempt.student?.name,
      student_email: attempt.student?.email
    };
  },

  // Find all attempts for a quiz event
  findByQuizEvent: async (quizEventId) => {
    const attempts = await prisma.quizAttempt.findMany({
      where: { quizEventId },
      include: {
        student: {
          select: {
            name: true,
            email: true
          }
        },
        answers: true
      },
      orderBy: [
        { score: 'desc' },
        { submittedAt: 'asc' }
      ]
    });

    return attempts.map(attempt => ({
      ...attempt,
      student_name: attempt.student?.name,
      student_email: attempt.student?.email
    }));
  },

  // Find all attempts by student
  findByStudent: async (studentId) => {
    const attempts = await prisma.quizAttempt.findMany({
      where: { studentId },
      include: {
        quizEvent: {
          select: {
            title: true,
            subject: true,
            startTime: true,
            endTime: true
          }
        },
        answers: true
      },
      orderBy: { submittedAt: 'desc' }
    });

    return attempts.map(attempt => ({
      ...attempt,
      quiz_title: attempt.quizEvent?.title,
      subject: attempt.quizEvent?.subject
    }));
  },

  // Update quiz attempt
  update: async (id, updateData) => {
    const data = {};
    if (updateData.score !== undefined) data.score = updateData.score;
    if (updateData.startedAt) data.startedAt = new Date(updateData.startedAt);
    if (updateData.submittedAt) data.submittedAt = new Date(updateData.submittedAt);

    return await prisma.quizAttempt.update({
      where: { id },
      data,
      include: {
        answers: true
      }
    });
  },

  // Delete quiz attempt
  delete: async (id) => {
    return await prisma.quizAttempt.delete({
      where: { id }
    });
  },

  // Get statistics for a quiz event
  getQuizStatistics: async (quizEventId) => {
    const attempts = await prisma.quizAttempt.findMany({
      where: { quizEventId },
      select: {
        score: true
      }
    });

    if (attempts.length === 0) {
      return {
        attemptCount: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0
      };
    }

    const scores = attempts.map(a => parseFloat(a.score));
    return {
      attemptCount: attempts.length,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores)
    };
  },

  // Get answer by ID
  getAnswerById: async (answerId) => {
    return await prisma.attemptAnswer.findUnique({
      where: { id: answerId }
    });
  },

  // Update answer
  updateAnswer: async (answerId, updateData) => {
    return await prisma.attemptAnswer.update({
      where: { id: answerId },
      data: updateData
    });
  }
};

module.exports = QuizAttemptModel;
