const prisma = require('../config/prisma');

const TeacherModel = {
  // Create a new teacher
  create: async (teacherData) => {
    const { name, email, password, branch } = teacherData;
    return await prisma.teacher.create({
      data: { name, email, password, branch }
    });
  },

  // Find teacher by email
  findByEmail: async (email) => {
    return await prisma.teacher.findUnique({
      where: { email }
    });
  },

  // Find teacher by ID
  findById: async (id) => {
    return await prisma.teacher.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        branch: true,
        createdAt: true
      }
    });
  },

  // Find all teachers
  findAll: async () => {
    return await prisma.teacher.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        branch: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });
  },

  // Find teachers by branch
  findByBranch: async (branch) => {
    return await prisma.teacher.findMany({
      where: { branch },
      select: {
        id: true,
        name: true,
        email: true,
        branch: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });
  },

  // Update teacher
  update: async (id, teacherData) => {
    const updateData = {};
    if (teacherData.name) updateData.name = teacherData.name;
    if (teacherData.email) updateData.email = teacherData.email;
    if (teacherData.password) updateData.password = teacherData.password;
    if (teacherData.branch) updateData.branch = teacherData.branch;

    return await prisma.teacher.update({
      where: { id },
      data: updateData
    });
  },

  // Delete teacher
  delete: async (id) => {
    return await prisma.teacher.delete({
      where: { id }
    });
  },

  // Get quizzes created by teacher
  getQuizzesCreated: async (teacherId) => {
    const quizEvents = await prisma.quizEvent.findMany({
      where: { createdBy: teacherId },
      include: {
        questions: true,
        quizAttempts: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return quizEvents.map(qe => ({
      ...qe,
      question_count: qe.questions.length,
      attempt_count: qe.quizAttempts.length
    }));
  },

  // Get teacher with quiz events
  findByIdWithQuizEvents: async (id) => {
    return await prisma.teacher.findUnique({
      where: { id },
      include: {
        createdQuizEvents: {
          include: {
            questions: true,
            quizAttempts: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  },

  // Get teacher statistics
  getStatistics: async (teacherId) => {
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        createdQuizEvents: {
          include: {
            questions: true,
            quizAttempts: true
          }
        }
      }
    });

    if (!teacher) return null;

    const totalQuizzes = teacher.createdQuizEvents.length;
    const totalQuestions = teacher.createdQuizEvents.reduce(
      (sum, quiz) => sum + quiz.questions.length, 
      0
    );
    const totalAttempts = teacher.createdQuizEvents.reduce(
      (sum, quiz) => sum + quiz.quizAttempts.length,
      0
    );

    return {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      branch: teacher.branch,
      totalQuizzes,
      totalQuestions,
      totalAttempts
    };
  }
};

module.exports = TeacherModel;
