const prisma = require('../config/prisma');

/**
 * StudentSubmission Model - One row per question answered
 */
const StudentSubmissionModel = {
  /**
   * Create a submission for a single question
   * Audio format: .wav at 16kHz frequency
   * @param {Object} submissionData
   * @returns {Promise<Object>} Created submission
   */
  create: async (submissionData) => {
    const {
      studentId,
      quizId,
      questionId, // Logical ID from quiz.questions JSON
      audioPath, // Path to .wav file (16kHz)
      transcribedAnswer
    } = submissionData;

    return await prisma.studentSubmission.create({
      data: {
        studentId,
        quizId,
        questionId,
        audioPath,
        transcribedAnswer
      }
    });
  },

  /**
   * Create multiple submissions at once
   */
  createMany: async (submissions) => {
    return await prisma.studentSubmission.createMany({
      data: submissions
    });
  },

  /**
   * Find submission by ID
   */
  findById: async (submissionId) => {
    return await prisma.studentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNo: true,
            branch: true,
            semester: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true,
            subject: true,
            courseCode: true,
            questions: true,
            correctAnswers: true
          }
        }
      }
    });
  },

  /**
   * Get all submissions by a student for a quiz
   */
  findByStudentAndQuiz: async (studentId, quizId) => {
    return await prisma.studentSubmission.findMany({
      where: {
        studentId,
        quizId
      },
      include: {
        evaluation: true
      },
      orderBy: { submittedAt: 'asc' }
    });
  },

  /**
   * Get all submissions for a quiz
   */
  findByQuizId: async (quizId) => {
    return await prisma.studentSubmission.findMany({
      where: { quizId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNo: true,
            branch: true
          }
        },
        evaluation: true
      }
    });
  },

  /**
   * Get student's submission history
   */
  findByStudentId: async (studentId) => {
    return await prisma.studentSubmission.findMany({
      where: { studentId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            subject: true,
            courseCode: true
          }
        },
        evaluation: {
          select: {
            marksAwarded: true,
            similarityScore: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });
  },

  /**
   * Check if student has submitted for a specific question
   */
  hasSubmitted: async (studentId, quizId, questionId) => {
    const submission = await prisma.studentSubmission.findFirst({
      where: {
        studentId,
        quizId,
        questionId
      }
    });
    return submission !== null;
  },

  /**
   * Get submissions pending evaluation
   */
  findPendingEvaluations: async () => {
    return await prisma.studentSubmission.findMany({
      where: {
        evaluation: null
      },
      include: {
        student: {
          select: {
            name: true,
            rollNo: true
          }
        },
        quiz: {
          select: {
            title: true,
            subject: true,
            questions: true,
            correctAnswers: true
          }
        }
      }
    });
  },

  /**
   * Update submission
   */
  update: async (submissionId, updateData) => {
    return await prisma.studentSubmission.update({
      where: { id: submissionId },
      data: updateData
    });
  },

  /**
   * Delete submission
   */
  delete: async (submissionId) => {
    return await prisma.studentSubmission.delete({
      where: { id: submissionId }
    });
  }
};

module.exports = StudentSubmissionModel;
