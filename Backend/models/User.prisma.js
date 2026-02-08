const prisma = require('../config/prisma');

const UserModel = {
  // Create a new user
  create: async (userData) => {
    const { name, email, password, role = 'student' } = userData;
    return await prisma.user.create({
      data: { name, email, password, role }
    });
  },

  // Find user by email
  findByEmail: async (email) => {
    return await prisma.user.findUnique({
      where: { email }
    });
  },

  // Find user by ID
  findById: async (id) => {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
  },

  // Find all users
  findAll: async () => {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
  },

  // Find users by role
  findByRole: async (role) => {
    return await prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
  },

  // Update user
  update: async (id, userData) => {
    const updateData = {};
    if (userData.name) updateData.name = userData.name;
    if (userData.email) updateData.email = userData.email;
    if (userData.password) updateData.password = userData.password;
    if (userData.role) updateData.role = userData.role;

    return await prisma.user.update({
      where: { id },
      data: updateData
    });
  },

  // Delete user
  delete: async (id) => {
    return await prisma.user.delete({
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

  // Get quizzes attended by student
  getQuizzesAttended: async (studentId) => {
    return await prisma.quizAttempt.findMany({
      where: { studentId },
      include: {
        quizEvent: {
          include: {
            questions: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });
  }
};

module.exports = UserModel;
