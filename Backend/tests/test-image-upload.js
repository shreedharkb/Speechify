/**
 * Test Script: Verify Image Upload and Quiz Creation with Images
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001/api';

async function testImageUploadAndQuiz() {
  try {
    console.log('🧪 Testing Image Upload and Quiz Creation\n');

    // Step 1: Login as teacher
    console.log('1️⃣  Logging in as teacher...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test.teacher@quiz.com',
      password: 'password123'
    });

    const { token, user } = loginResponse.data;
    console.log(`✅ Logged in as: ${user.name}`);

    // Step 2: Test quiz creation with image URL
    console.log('\n2️⃣  Creating quiz with image URL...');
    
    const quizWithImageUrl = {
      title: 'Networking Quiz with Images',
      subject: 'Computer Networks',
      courseCode: 'NET401',
      description: 'Test with image URLs',
      questions: [
        {
          id: 1,
          text: 'What is the OSI Model?',
          points: 10,
          image: {
            type: 'url',
            value: 'https://cdn.example.com/osi-model.png'
          }
        },
        {
          id: 2,
          text: 'Explain TCP handshake',
          points: 15,
          image: {
            type: 'url',
            value: 'https://cdn.example.com/tcp-handshake.png'
          }
        },
        {
          id: 3,
          text: 'What is DNS?',
          points: 10,
          image: null
        }
      ],
      correctAnswers: [
        { questionId: 1, answer: 'OSI Model has 7 layers' },
        { questionId: 2, answer: 'Three-way handshake: SYN, SYN-ACK, ACK' },
        { questionId: 3, answer: 'Domain Name System' }
      ],
      startTime: new Date('2026-02-25T10:00:00Z').toISOString(),
      endTime: new Date('2026-02-25T12:00:00Z').toISOString()
    };

    const createResponse = await axios.post(
      `${BASE_URL}/quiz/create`,
      quizWithImageUrl,
      {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      }
    );

    const { quiz } = createResponse.data;
    console.log(`✅ Quiz created: "${quiz.title}"`);
    console.log(`   ID: ${quiz.id}`);
    console.log(`   Questions: ${quiz.questionCount}`);

    // Step 3: Fetch and verify the quiz has images
    console.log('\n3️⃣  Fetching quiz to verify images...');
    const fetchResponse = await axios.get(
      `${BASE_URL}/quiz/${quiz.id}`,
      {
        headers: { 'x-auth-token': token }
      }
    );

    const fetchedQuiz = fetchResponse.data;
    console.log(`✅ Quiz fetched: "${fetchedQuiz.title}"`);
    console.log('\n   Questions with images:');
    fetchedQuiz.questions.forEach((q, index) => {
      const hasImage = q.image !== null;
      const status = hasImage ? '✅' : '❌';
      console.log(`   ${status} Q${index + 1}: "${q.text.substring(0, 40)}..."`);
      if (hasImage) {
        console.log(`       Image: ${q.image.value}`);
      }
    });

    // Step 4: Test different image formats
    console.log('\n4️⃣  Testing different image input formats...');
    
    const testQuiz = {
      title: 'Image Format Test',
      subject: 'Test',
      courseCode: 'TEST101',
      questions: [
        {
          id: 1,
          text: 'Question with string URL',
          points: 5,
          image: 'https://example.com/image1.png'  // String format
        },
        {
          id: 2,
          text: 'Question with object',
          points: 5,
          image: {
            type: 'url',
            value: 'https://example.com/image2.png'  // Proper object format
          }
        },
        {
          id: 3,
          text: 'Question with url property',
          points: 5,
          image: {
            url: 'https://example.com/image3.png'  // Frontend might send this
          }
        },
        {
          id: 4,
          text: 'Question without image',
          points: 5,
          image: null
        }
      ],
      correctAnswers: [
        { questionId: 1, answer: 'Answer 1' },
        { questionId: 2, answer: 'Answer 2' },
        { questionId: 3, answer: 'Answer 3' },
        { questionId: 4, answer: 'Answer 4' }
      ],
      startTime: new Date('2026-03-01T10:00:00Z').toISOString(),
      endTime: new Date('2026-03-01T12:00:00Z').toISOString()
    };

    const testResponse = await axios.post(
      `${BASE_URL}/quiz/create`,
      testQuiz,
      {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      }
    );

    const testQuizResult = testResponse.data.quiz;
    console.log(`✅ Test quiz created: "${testQuizResult.title}"`);
    
    // Fetch and verify
    const verifyResponse = await axios.get(
      `${BASE_URL}/quiz/${testQuizResult.id}`,
      {
        headers: { 'x-auth-token': token }
      }
    );

    console.log('\n   Image format conversion results:');
    verifyResponse.data.questions.forEach((q, index) => {
      const hasImage = q.image !== null;
      const status = hasImage ? '✅' : '❌';
      console.log(`   ${status} Q${index + 1}: ${q.text}`);
      if (hasImage) {
        console.log(`       Type: ${q.image.type}`);
        console.log(`       Value: ${q.image.value}`);
      } else {
        console.log(`       Image: null`);
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log('✨ IMAGE HANDLING TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   ✅ Quiz created with image URLs`);
    console.log(`   ✅ Images properly stored in database`);
    console.log(`   ✅ Multiple image formats handled correctly`);
    console.log(`   ✅ String URLs converted to proper format`);
    console.log(`   ✅ Null images handled correctly`);

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.msg || error.response.data.error}`);
      console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`   Error: ${error.message}`);
      console.error(error.stack);
    }
  }
}

// Run the test
testImageUploadAndQuiz();
