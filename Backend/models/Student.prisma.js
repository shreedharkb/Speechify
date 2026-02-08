const prisma = require('../config/prisma');

const StudentModel = {
  // Create a new student
  create: async (studentData) => {
    const { name, email, password, rollNo, year, branch, semester } = studentData;
    return await prisma.student.create({
      data: { name, email, password, rollNo, year, branch, semester }
    });
  },

  // Find student by email
  findByEmail: async (email) => {
    return await prisma.student.findUnique({
      where: { email }
    });
  },

  // Find student by roll number
  findByRollNo: async (rollNo) => {
    return await prisma.student.findUnique({
      where: { rollNo }
    });
  },

  // Find student by ID
  findById: async (id) => {
    return await prisma.student.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        rollNo: true,
        year: true,
        branch: true,
        semester: true,
        createdAt: true
      }
    });
  },

  // Find all students
  findAll: async () => {
    return await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        rollNo: true,
        year: true,
        branch: true,
        semester: true,
        createdAt: true
      },
      orderBy: { rollNo: 'asc' }
    });
  },

  // Find students by branch
  findByBranch: async (branch) => {
    return await prisma.student.findMany({
      where: { branch },
      select: {
        id: true,
        name: true,
        email: true,
        rollNo: true,
        year: true,
        branch: true,
        semester: true,
        createdAt: true
      },
      orderBy: { rollNo: 'asc' }
    });
  },

  // Find students by year and semester
  findByYearAndSemester: async (year, semester) => {
    return await prisma.student.findMany({
      where: { 
        year,
        semester
      },
      select: {
        id: true,
        name: true,
        email: true,
        rollNo: true,
        year: true,
        branch: true,
        semester: true
      },
      orderBy: { rollNo: 'asc' }
    });
  },

  // Update student
  update: async (id, studentData) => {
    const updateData = {};
    if (studentData.name) updateData.name = studentData.name;
    if (studentData.email) updateData.email = studentData.email;
    if (studentData.password) updateData.password = studentData.password;
    if (studentData.rollNo) updateData.rollNo = studentData.rollNo;
    if (studentData.year !== undefined) updateData.year = studentData.year;
    if (studentData.branch) updateData.branch = studentData.branch;
    if (studentData.semester !== undefined) updateData.semester = studentData.semester;

    return await prisma.student.update({
      where: { id },
      data: updateData
    });
  },

  // Delete student
  delete: async (id) => {
    return await prisma.student.delete({
      where: { id }
    });
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
  },

  // Get student with quiz attempts
  findByIdWithAttempts: async (id) => {
    return await prisma.student.findUnique({
      where: { id },
      include: {
        quizAttempts: {
          include: {
            quizEvent: {
              select: {
                title: true,
                subject: true,
                startTime: true,
                endTime: true
              }
            }
          },
          orderBy: { submittedAt: 'desc' }
        }
      }
    });
  }
};

module.exports = StudentModel;
