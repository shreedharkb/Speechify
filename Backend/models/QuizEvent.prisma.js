const prisma = require('../config/prisma');

const QuizEventModel = {
  // Create a new quiz event with questions
  create: async (quizData) => {
    const { title, subject, description, createdBy, startTime, endTime, questions } = quizData;
    
    return await prisma.quizEvent.create({
      data: {
        title,
        subject,
        description,
        createdBy,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        questions: {
          create: questions?.map((q, index) => ({
            questionText: q.questionText,
            correctAnswerText: q.correctAnswerText,
            points: q.points || 10,
            questionOrder: index
          })) || []
        }
      },
      include: {
        questions: {
          orderBy: { questionOrder: 'asc' }
        }
      }
    });
  },

  // Find quiz event by ID with questions
  findById: async (id) => {
    const quiz = await prisma.quizEvent.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { questionOrder: 'asc' }
        }
      }
    });

    if (!quiz) return null;

    return {
      id: quiz.id,
      title: quiz.title,
      subject: quiz.subject,
      description: quiz.description,
      createdBy: quiz.createdBy,
      startTime: quiz.startTime,
      endTime: quiz.endTime,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      questions: quiz.questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        correctAnswerText: q.correctAnswerText,
        points: q.points,
        questionOrder: q.questionOrder
      }))
    };
  },

  // Find all quiz events
  findAll: async () => {
    const quizEvents = await prisma.quizEvent.findMany({
      include: {
        teacher: {
          select: { name: true }
        },
        questions: {
          orderBy: { questionOrder: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return quizEvents.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      subject: quiz.subject,
      description: quiz.description,
      createdBy: quiz.createdBy,
      creatorName: quiz.teacher?.name,
      startTime: quiz.startTime,
      endTime: quiz.endTime,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      questionCount: quiz.questions.length,
      questions: quiz.questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        correctAnswerText: q.correctAnswerText,
        points: q.points,
        questionOrder: q.questionOrder
      }))
    }));
  },

  // Find quiz events by creator
  findByCreator: async (creatorId) => {
    const quizEvents = await prisma.quizEvent.findMany({
      where: { createdBy: creatorId },
      include: {
        questions: {
          orderBy: { questionOrder: 'asc' }
        },
        quizAttempts: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return quizEvents.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      subject: quiz.subject,
      description: quiz.description,
      createdBy: quiz.createdBy,
      startTime: quiz.startTime,
      endTime: quiz.endTime,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      questionCount: quiz.questions.length,
      attemptCount: quiz.quizAttempts.length,
      questions: quiz.questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        correctAnswerText: q.correctAnswerText,
        points: q.points,
        questionOrder: q.questionOrder
      }))
    }));
  },

  // Find active quiz events
  findActive: async () => {
    const now = new Date();
    return await prisma.quizEvent.findMany({
      where: {
        AND: [
          { startTime: { lte: now } },
          { endTime: { gte: now } }
        ]
      },
      include: {
        questions: {
          orderBy: { questionOrder: 'asc' }
        },
        teacher: {
          select: { name: true, email: true }
        }
      }
    });
  },

  // Find upcoming quiz events
  findUpcoming: async () => {
    const now = new Date();
    return await prisma.quizEvent.findMany({
      where: {
        startTime: { gt: now }
      },
      include: {
        questions: true,
        teacher: {
          select: { name: true }
        }
      },
      orderBy: { startTime: 'asc' }
    });
  },

  // Update quiz event
  update: async (id, quizData) => {
    const updateData = {};
    if (quizData.title) updateData.title = quizData.title;
    if (quizData.subject) updateData.subject = quizData.subject;
    if (quizData.description !== undefined) updateData.description = quizData.description;
    if (quizData.startTime) updateData.startTime = new Date(quizData.startTime);
    if (quizData.endTime) updateData.endTime = new Date(quizData.endTime);

    return await prisma.quizEvent.update({
      where: { id },
      data: updateData,
      include: {
        questions: {
          orderBy: { questionOrder: 'asc' }
        }
      }
    });
  },

  // Delete quiz event
  delete: async (id) => {
    return await prisma.quizEvent.delete({
      where: { id }
    });
  },

  // Add question to quiz event
  addQuestion: async (quizEventId, questionData) => {
    const { questionText, correctAnswerText, points, questionOrder } = questionData;
    return await prisma.question.create({
      data: {
        quizEventId,
        questionText,
        correctAnswerText,
        points: points || 10,
        questionOrder: questionOrder || 0
      }
    });
  },

  // Update question
  updateQuestion: async (questionId, questionData) => {
    const updateData = {};
    if (questionData.questionText) updateData.questionText = questionData.questionText;
    if (questionData.correctAnswerText) updateData.correctAnswerText = questionData.correctAnswerText;
    if (questionData.points !== undefined) updateData.points = questionData.points;
    if (questionData.questionOrder !== undefined) updateData.questionOrder = questionData.questionOrder;

    return await prisma.question.update({
      where: { id: questionId },
      data: updateData
    });
  },

  // Delete question
  deleteQuestion: async (questionId) => {
    return await prisma.question.delete({
      where: { id: questionId }
    });
  }
};

module.exports = QuizEventModel;
