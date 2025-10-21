const mongoose = require('mongoose');
require('dotenv').config();

const QuizEvent = require('../models/QuizEvent');

async function checkQuizDates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const now = new Date();
    console.log('Current date:', now.toISOString());

    // Get all quiz events
    const allQuizEvents = await QuizEvent.find({});
    console.log('\nTotal quiz events found:', allQuizEvents.length);

    if (allQuizEvents.length === 0) {
      console.log('No quiz events found in the database');
      return;
    }

    console.log('\nAnalyzing quiz events:');
    allQuizEvents.forEach(event => {
      console.log(`\nQuiz: ${event.title}`);
      console.log('ID:', event._id);
      console.log('Start Time:', event.startTime);
      console.log('End Time:', event.endTime);
      console.log('Created By:', event.createdBy);
      
      // Check if dates are valid
      const startDate = new Date(event.startTime);
      const endDate = new Date(event.endTime);
      
      console.log('Start Date valid:', !isNaN(startDate.getTime()));
      console.log('End Date valid:', !isNaN(endDate.getTime()));
      
      if (startDate > now) {
        console.log('Status: Upcoming');
      } else if (startDate <= now && endDate >= now) {
        console.log('Status: Active');
      } else {
        console.log('Status: Completed');
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkQuizDates();