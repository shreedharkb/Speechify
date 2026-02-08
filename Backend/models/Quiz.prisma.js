const prisma = require('../config/prisma');

/**
 * Quiz Model - Handles quiz operations with JSON questions
 * Questions are stored as JSON array, not in separate table
 */
const QuizModel = {
  /**
   * Create a new quiz with questions stored as JSON
   * @param {Object} quizData - Quiz data including questions array
   * @returns {Promise<Object>} Created quiz
   */
  create: async (quizData) => {
    const {
      teacherId,
      title,
      subject,
      courseCode,
      description,
      questions, // Array of {id, text, image: {type, value}}
      correctAnswers, // Array of correct answers
      startTime,
      endTime
    } = quizData;

    return await prisma.quiz.create({
      data: {
        teacherId,
        title,
        subject,
        courseCode,
        description,
        questions, // Stored as JSON
        correctAnswers, // Stored as JSON
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            branch: true
          }
        }
      }
    });
  },

  /**
   * Find quiz by ID with teacher information
   */
  findById: async (quizId) => {
    return await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            branch: true
          }
        }
      }
    });
  },

  /**
   * Get all quizzes
   */
  findAll: async () => {
    return await prisma.quiz.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            branch: true
          }
        }
      }
    });
  },

  /**
   * Get all quizzes by a teacher
   */
  findByTeacherId: async (teacherId) => {
    return await prisma.quiz.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    });
  },

  /**
   * Get active quizzes (between start and end time)
   */
  findActiveQuizzes: async () => {
    const now = new Date();
    return await prisma.quiz.findMany({
      where: {
        startTime: { lte: now },
        endTime: { gte: now }
      },
      include: {
        teacher: {
          select: {
            name: true,
            branch: true
          }
        }
      }
    });
  },

  /**
   * Get quizzes by course code
   */
  findByCourseCode: async (courseCode) => {
    return await prisma.quiz.findMany({
      where: { courseCode },
      orderBy: { startTime: 'desc' }
    });
  },

  /**
   * Update quiz
   */
  update: async (quizId, updateData) => {
    return await prisma.quiz.update({
      where: { id: quizId },
      data: updateData
    });
  },

  /**
   * Delete quiz
   */
  delete: async (quizId) => {
    return await prisma.quiz.delete({
      where: { id: quizId }
    });
  },

  /**
   * Get quiz with submission count
   */
  getQuizWithStats: async (quizId) => {
    return await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            branch: true
          }
        },
        _count: {
          select: { submissions: true }
        }
      }
    });
  }
};

module.exports = QuizModel;
