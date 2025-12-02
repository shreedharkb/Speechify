const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuizAttemptSchema = new Schema({
  quizEvent: {
    type: Schema.Types.ObjectId,
    ref: 'QuizEvent',
    required: true,
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [{
    question: { type: String, required: true },
    studentAnswer: { type: String, required: true },
    correctAnswer: { type: String },
    isCorrect: { type: Boolean, required: true },
    pointsEarned: { type: Number, default: 0 },
    maxPoints: { type: Number, default: 10 },
    similarityScore: { type: Number },
    explanation: { type: String }
  }],
  score: { type: Number, required: true },
  startedAt: { type: Date },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);