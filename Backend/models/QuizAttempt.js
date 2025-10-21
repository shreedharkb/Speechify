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
    isCorrect: { type: Boolean, required: true },
    similarityScore: { type: Number }
  }],
  finalScore: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);