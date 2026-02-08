// ============================================
// Model Exports for 5-Table JSON Schema
// ============================================

// Prisma models (JSON-based schema)
const Student = require('./Student.prisma');
const Teacher = require('./Teacher.prisma');
const Quiz = require('./Quiz.prisma');
const StudentSubmission = require('./StudentSubmission.prisma');
const SubmissionEvaluation = require('./SubmissionEvaluation.prisma');

// Export all models
module.exports = {
  // Primary exports
  Student,
  Teacher,
  Quiz,
  StudentSubmission,
  SubmissionEvaluation
};

