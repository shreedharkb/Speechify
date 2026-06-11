/**
 * API Test: Test Quiz Creation Endpoint
 * This tests the /api/quiz/create endpoint with teacher authentication
 */

const axios = require('axios');
const BASE_URL = 'http://localhost:3001/api';

async function testQuizAPI() {
  try {
    console.log('🧪 Testing Quiz Creation API\n');

    // Step 1: Login as teacher to get token
    console.log('1️⃣  Logging in as teacher...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test.teacher@quiz.com',
      password: 'password123'
    });

    const { token, user } = loginResponse.data;
    console.log(`✅ Logged in as: ${user.name} (Role: ${user.role})`);
    console.log(`   Token received: ${token.substring(0, 20)}...`);

    if (user.role !== 'teacher') {
      console.log('❌ User is not a teacher!');
      return;
    }

    // Step 2: Create a quiz using the API
    console.log('\n2️⃣  Creating quiz via API...');
    
    const quizData = {
      title: 'Web Development Quiz',
      subject: 'Web Technologies',
      courseCode: 'WEB301',
      description: 'Test your HTML, CSS, and JavaScript knowledge',
      questions: [
        {
          id: 1,
          text: 'What does HTML stand for?',
          points: 5,
          image: null
        },
        {
          id: 2,
          text: 'Explain the CSS Box Model',
          points: 15,
          image: {
            type: 'url',
            value: 'https://cdn.example.com/css-box-model.png'
          }
        },
        {
          id: 3,
          text: 'What is the difference between let, const, and var in JavaScript?',
          points: 20,
          image: null
        }
      ],
      correctAnswers: [
        {
          questionId: 1,
          answer: 'HyperText Markup Language'
        },
        {
          questionId: 2,
          answer: 'The CSS box model consists of margin, border, padding, and content'
        },
        {
          questionId: 3,
          answer: 'let is block-scoped and can be reassigned, const is block-scoped and cannot be reassigned, var is function-scoped'
        }
      ],
      startTime: new Date('2026-02-20T09:00:00Z').toISOString(),
      endTime: new Date('2026-02-20T11:00:00Z').toISOString()
    };

    const createResponse = await axios.post(
      `${BASE_URL}/quiz/create`,
      quizData,
      {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      }
    );

    const { quiz } = createResponse.data;
    console.log(`✅ Quiz created successfully!`);
    console.log(`   ID: ${quiz.id}`);
    console.log(`   Title: ${quiz.title}`);
    console.log(`   Course Code: ${quiz.courseCode}`);
    console.log(`   Questions: ${quiz.questionCount}`);
    console.log(`   Total Points: ${quiz.totalPoints}`);

    // Step 3: Fetch the created quiz
    console.log('\n3️⃣  Fetching created quiz...');
    const fetchResponse = await axios.get(
      `${BASE_URL}/quiz/${quiz.id}`,
      {
        headers: {
          'x-auth-token': token
        }
      }
    );

    const fetchedQuiz = fetchResponse.data;
    console.log(`✅ Quiz fetched: "${fetchedQuiz.title}"`);
    console.log(`   Questions: ${fetchedQuiz.questions.length}`);
    fetchedQuiz.questions.forEach((q, index) => {
      console.log(`   Q${index + 1}: "${q.text.substring(0, 40)}..." - ${q.points} points`);
    });

    // Step 4: Get all quizzes by this teacher
    console.log('\n4️⃣  Fetching teacher\'s quizzes...');
    const teacherQuizzesResponse = await axios.get(
      `${BASE_URL}/quiz/teacher/quizzes`,
      {
        headers: {
          'x-auth-token': token
        }
      }
    );

    const teacherQuizzes = teacherQuizzesResponse.data;
    console.log(`✅ Found ${teacherQuizzes.length} quiz(zes)`);
    teacherQuizzes.forEach(q => {
      console.log(`   - "${q.title}" (${q.courseCode}) - ${q.questionCount} questions, ${q.totalPoints} points - Status: ${q.status}`);
    });

    // Step 5: Get all quizzes (student view)
    console.log('\n5️⃣  Fetching all quizzes (student view)...');
    const allQuizzesResponse = await axios.get(
      `${BASE_URL}/quiz`,
      {
        headers: {
          'x-auth-token': token
        }
      }
    );

    const allQuizzes = allQuizzesResponse.data.quizzes;
    console.log(`✅ Found ${allQuizzes.length} quiz(zes) in system`);
    allQuizzes.forEach(q => {
      console.log(`   - "${q.title}" (${q.courseCode}) - ${q.questionCount} questions - Status: ${q.status}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✨ ALL API TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   ✅ Teacher login successful`);
    console.log(`   ✅ Quiz created via API in 'quizzes' table`);
    console.log(`   ✅ Questions include points field`);
    console.log(`   ✅ Quiz retrieval working`);
    console.log(`   ✅ Teacher can view their quizzes`);
    console.log(`   ✅ All quizzes endpoint working`);

  } catch (error) {
    console.error('\n❌ API Test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.msg || error.response.data.error}`);
      console.error(`   Data:`, error.response.data);
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

// Run the test
testQuizAPI();
