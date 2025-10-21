const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['student', 'teacher'],
    default: 'student',
  },
  quizzesCreated: [{ type: Schema.Types.ObjectId, ref: 'QuizEvent' }],
  quizzesAttended: [{ type: Schema.Types.ObjectId, ref: 'QuizAttempt' }]
});

module.exports = mongoose.model('User', UserSchema);

