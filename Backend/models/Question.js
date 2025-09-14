const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
  // This creates a link to the User model, so we know which teacher created the question.
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questionText: {
    type: String,
    required: true,
    trim: true, // Removes any extra whitespace
  },
  // This is the ideal "correct" answer the teacher will provide.
  correctAnswerText: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Question', QuestionSchema);
