const mongoose = require('mongoose');
const Question = require('../models/Question');
const QuizEvent = require('../models/QuizEvent');
require('dotenv').config();

async function migrateData() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined in environment variables');
      console.log('Please create a .env file in the Backend directory with:');
      console.log('MONGODB_URI=mongodb://localhost:27017/speechify');
      process.exit(1);
    }
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all existing questions
    const questions = await Question.find().populate('createdBy');
    
    if (questions.length === 0) {
      console.log('No questions to migrate');
      process.exit(0);
    }

    // Group questions by creator
    const questionsByCreator = {};
    questions.forEach(q => {
      const creatorId = q.createdBy._id.toString();
      if (!questionsByCreator[creatorId]) {
        questionsByCreator[creatorId] = [];
      }
      questionsByCreator[creatorId].push(q);
    });

    // Create a QuizEvent for each group of questions
    for (const [creatorId, questions] of Object.entries(questionsByCreator)) {
      const quizQuestions = questions.map(q => ({
        questionText: q.questionText,
        correctAnswerText: q.correctAnswerText,
        points: 10
      }));

      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      await QuizEvent.create({
        title: 'Migrated Quiz',
        subject: 'General',
        description: 'Quiz created from migrated questions',
        createdBy: creatorId,
        startTime: now,
        endTime: oneWeekFromNow,
        questions: quizQuestions,
        createdAt: now
      });
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateData();