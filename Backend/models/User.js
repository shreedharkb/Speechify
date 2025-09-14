const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for a user
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // No two users can have the same email
  },
  password: {
    type: String,
    required: true,
  },
  // --- NEW FIELD ---
  // This adds a 'role' to each user document.
  // By default, any new user who signs up will have the role of 'student'.
  role: {
    type: String,
    enum: ['student', 'teacher'], // The role can only be one of these two values
    default: 'student',
  },
});

// Create and export the User model
module.exports = mongoose.model('User', UserSchema);

