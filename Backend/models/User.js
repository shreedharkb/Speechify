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
});

// Create and export the User model
module.exports = mongoose.model('User', UserSchema);

