const axios = require('axios');

async function testQuizSubmission() {
  try {
    // First, login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'student@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✓ Login successful, token received');
    
    // Get available quizzes
    console.log('\n2. Fetching available quizzes...');
    const quizzesResponse = await axios.get('http://localhost:3001/api/quiz/student/available', {
      headers: { 'x-auth-token': token }
    });
    
    if (quizzesResponse.data.length === 0) {
      console.log('❌ No quizzes available');
      return;
    }
    
    const quiz = quizzesResponse.data[0];
    console.log(`✓ Found quiz: "${quiz.title}" (ID: ${quiz.id})`);
    console.log(`  Questions: ${quiz.questions?.length || 0}`);
    
    if (!quiz.questions || quiz.questions.length === 0) {
      console.log('❌ Quiz has no questions');
      return;
    }
    
    // Prepare answers
    console.log('\n3. Preparing quiz submission...');
    const answers = quiz.questions.map((q, index) => ({
      question: q.questionText,
      studentAnswer: `Test answer ${index + 1}`,
      isCorrect: false,
      audioBlob: null
    }));
    
    console.log(`  Submitting ${answers.length} answers`);
    
    // Submit quiz
    console.log('\n4. Submitting quiz...');
    const submitResponse = await axios.post('http://localhost:3001/api/quiz-attempt/submit', {
      quizEventId: quiz.id,
      answers: answers,
      startedAt: new Date().toISOString()
    }, {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✓ Quiz submitted successfully!');
    console.log('Response:', JSON.stringify(submitResponse.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ Error occurred:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testQuizSubmission();
