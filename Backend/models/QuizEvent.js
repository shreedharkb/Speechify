const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuizEventSchema = new Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  questions: [{
    questionText: { type: String, required: true },
    correctAnswerText: { type: String, required: true },
    points: { type: Number, default: 10 }
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('QuizEvent', QuizEventSchema);