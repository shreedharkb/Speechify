// Run this script with: node scripts/seedQuestions.js
const mongoose = require('mongoose');
const Question = require('../models/Question');

const MONGO_URI = 'mongodb://localhost:27017/speechify'; // Change if needed

const questions = [
  { questionText: 'What is the capital of France?' },
  { questionText: 'Who wrote To Kill a Mockingbird?' },
  { questionText: 'What is the chemical symbol for water?' },
];

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await Question.deleteMany({});
  await Question.insertMany(questions);
  console.log('Sample questions seeded!');
  mongoose.disconnect();
}

seed();
