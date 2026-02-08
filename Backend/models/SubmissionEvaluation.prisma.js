const prisma = require('../config/prisma');

/**
 * SubmissionEvaluation Model - One evaluation per student per quiz
 * Stores aggregated question-level results in JSON
 */
const SubmissionEvaluationModel = {
  /**
   * Create or update evaluation for a student's entire quiz attempt
   * @param {Object} evaluationData
   * @returns {Promise<Object>} Created or updated evaluation
   */
  createOrUpdate: async (evaluationData) => {
    const {
      studentId,
      quizId,
      questionResults,
      totalSimilarity,
      totalMarks
    } = evaluationData;

    return await prisma.submissionEvaluation.upsert({
      where: {
        studentId_quizId: {
          studentId,
          quizId
        }
      },
      update: {
        questionResults,
        totalSimilarity,
        totalMarks,
        evaluatedAt: new Date()
      },
      create: {
        studentId,
        quizId,
        questionResults,
        totalSimilarity,
        totalMarks
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNo: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true,
            subject: true
          }
        }
      }
    });
  },

  /**
   * Create evaluation for a student's entire quiz attempt
   * @param {Object} evaluationData
   * @returns {Promise<Object>} Created evaluation
   */
  create: async (evaluationData) => {
    const {
      studentId,
      quizId,
      questionResults, // Array of {question_id, actual_answer, similarity_score, marks_awarded}
      totalSimilarity,
      totalMarks
    } = evaluationData;

    return await prisma.submissionEvaluation.create({
      data: {
        studentId,
        quizId,
        questionResults,
        totalSimilarity,
        totalMarks
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNo: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true,
            subject: true
          }
        }
      }
    });
  },

  /**
   * Find evaluation by student ID and quiz ID
   */
  findByStudentAndQuiz: async (studentId, quizId) => {
    return await prisma.submissionEvaluation.findUnique({
      where: { 
        studentId_quizId: { studentId, quizId }
      },
      include: {
        student: true,
        quiz: true
      }
    });
  },

  /**
   * Update evaluation
   */
  update: async (evaluationId, updateData) => {
    return await prisma.submissionEvaluation.update({
      where: { id: evaluationId },
      data: updateData
    });
  },

  /**
   * Get all evaluations for a quiz
   */
  findByQuiz: async (quizId) => {
    return await prisma.submissionEvaluation.findMany({
      where: { quizId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNo: true,
            branch: true
          }
        }
      },
      orderBy: {
        totalMarks: 'desc'
      }
    });
  },

  /**
   * Get all evaluations for a student
   */
  findByStudent: async (studentId) => {
    return await prisma.submissionEvaluation.findMany({
      where: { studentId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            subject: true,
            courseCode: true
          }
        }
      },
      orderBy: {
        evaluatedAt: 'desc'
      }
    });
  },

  /**
   * Get evaluation statistics for a quiz
   */
  getQuizStats: async (quizId) => {
    const evaluations = await prisma.submissionEvaluation.findMany({
      where: { quizId }
    });

    const stats = {
      totalEvaluations: evaluations.length,
      averageScore: 0,
      averageSimilarity: 0,
      highestScore: 0,
      lowestScore: 0
    };

    if (evaluations.length > 0) {
      const totalMarks = evaluations.reduce((sum, e) => 
        sum + parseFloat(e.totalMarks), 0);
      const totalSimilarity = evaluations.reduce((sum, e) => 
        sum + parseFloat(e.totalSimilarity), 0);
      
      stats.averageScore = totalMarks / evaluations.length;
      stats.averageSimilarity = totalSimilarity / evaluations.length;
      stats.highestScore = Math.max(...evaluations.map(e => parseFloat(e.totalMarks)));
      stats.lowestScore = Math.min(...evaluations.map(e => parseFloat(e.totalMarks)));
    }

    return stats;
  },

  /**
   * Delete evaluation
   */
  delete: async (evaluationId) => {
    return await prisma.submissionEvaluation.delete({
      where: { id: evaluationId }
    });
  }
};

module.exports = SubmissionEvaluationModel;
