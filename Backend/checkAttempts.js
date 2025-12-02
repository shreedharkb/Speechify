require('dotenv').config();
const mongoose = require('mongoose');
const QuizAttempt = require('./models/QuizAttempt');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    console.log('Database:', mongoose.connection.name);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Try direct collection query
    const directAttempts = await mongoose.connection.db.collection('quizattempts').find().toArray();
    console.log('\nDirect collection query - Total documents:', directAttempts.length);
    
    // Try model query
    const attempts = await QuizAttempt.find();
    console.log('Model query - Total documents:', attempts.length);
    
    if (directAttempts.length > 0) {
      console.log('\nFirst attempt from direct query:');
      console.log(JSON.stringify(directAttempts[0], null, 2));
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
