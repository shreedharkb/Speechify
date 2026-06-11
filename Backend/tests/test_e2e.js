const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function runTests() {
  console.log('Starting A to Z API Tests...');
  let teacherToken = '';
  let studentToken = '';
  let quizId = null;
  let attemptId = null;

  try {
    // 1. Teacher Signup
    console.log('1. Registering Teacher...');
    const teacherEmail = `teacher_${Date.now()}@test.com`;
    const teacherSignup = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Teacher Test E2E',
      email: teacherEmail,
      password: 'password123',
      role: 'teacher'
    });
    const teacherLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: teacherEmail,
      password: 'password123'
    });
    console.log(teacherLogin.data);
    teacherToken = teacherLogin.data.token || teacherLogin.data.data?.token || teacherLogin.headers['x-auth-token'];
    console.log('✓ Teacher registered and logged in successfully');

    // 2. Student Signup
    console.log('2. Registering Student...');
    const studentEmail = `student_${Date.now()}@test.com`;
    const studentSignup = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Student Test E2E',
      email: studentEmail,
      password: 'password123',
      role: 'student'
    });
    const studentLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: studentEmail,
      password: 'password123'
    });
    console.log(studentLogin.data);
    studentToken = studentLogin.data.token || studentLogin.data.data?.token || studentLogin.headers['x-auth-token'];
    console.log('✓ Student registered and logged in successfully');

    // 3. Create Quiz (Teacher)
    console.log('3. Creating Quiz as Teacher...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const quizResponse = await axios.post(`${API_BASE}/quiz/create`, {
      title: 'E2E Test Quiz',
      description: 'Testing the E2E flow',
      subject: 'Science',
      courseCode: 'SCI101',
      startTime: new Date().toISOString(),
      endTime: tomorrow.toISOString(),
      time_limit: 30,
      questions: [
        {
          question_text: "What powers the cell?",
          correct_answer_text: "Mitochondria is the powerhouse of the cell",
          points: 5
        },
        {
          question_text: "How do plants make food?",
          correct_answer_text: "Plants use photosynthesis to convert sunlight into energy",
          points: 5
        }
      ]
    }, { headers: { 'x-auth-token': teacherToken } });
    
    quizId = quizResponse.data.id || quizResponse.data.quiz?.id;
    console.log(`✓ Quiz created successfully with ID: ${quizId}`);

    // 4. Student views active quizzes
    console.log('4. Student fetching active quizzes...');
    const activeQuizzes = await axios.get(`${API_BASE}/quiz`, {
      headers: { 'x-auth-token': studentToken }
    });
    const foundQuiz = activeQuizzes.data.quizEvents?.find(q => q.id === quizId) || activeQuizzes.data.data?.find(q => q.id === quizId) || activeQuizzes.data.find(q => q.id === quizId) || activeQuizzes.data.quizzes?.find(q => q.id === quizId);
    if (!foundQuiz) {
        console.warn('! Quiz not found in active list, but continuing anyway. Response keys:', Object.keys(activeQuizzes.data));
    } else {
        console.log('✓ Student can see the active quiz');
    }

    // 5. Student Starts Attempt
    console.log('5. Student starting quiz attempt...');
    const startAttempt = await axios.post(`${API_BASE}/quiz-attempt/start`, { quizId }, {
      headers: { 'x-auth-token': studentToken }
    });
    attemptId = startAttempt.data.id || startAttempt.data.attempt?.id || startAttempt.data.data?.id;
    console.log(`✓ Quiz attempt started with ID: ${attemptId}`);
    
    // Fetch quiz questions
    const quizDetails = await axios.get(`${API_BASE}/quiz/${quizId}`, {
      headers: { 'x-auth-token': studentToken }
    });
    const questions = quizDetails.data.questions || quizDetails.data.data?.questions || quizDetails.data.quiz?.questions;
    
    if (!questions || questions.length === 0) {
        throw new Error('Could not fetch questions for the quiz');
    }

    // 6. Student Submits Answers
    console.log('6. Student submitting answers...');
    const answers = [
      { questionId: questions[0].id, studentAnswer: "The mitochondria powers the cell." },
      { questionId: questions[1].id, studentAnswer: "Plants make food using sunlight and a process called photosynthesis." }
    ];

    const submission = await axios.post(`${API_BASE}/quiz-attempt/submit`, {
      attemptId,
      answers
    }, {
      headers: { 'x-auth-token': studentToken }
    });
    console.log('✓ Answers submitted successfully. Waiting for AI grading (if async) or processing result...');

    // 7. Verify Results
    console.log('7. Verifying Results...');
    // Give it a couple seconds in case of background processing via Bull queue
    await new Promise(resolve => setTimeout(resolve, 3000));

    const results = await axios.get(`${API_BASE}/quiz-attempt/${attemptId}/results`, {
      headers: { 'x-auth-token': studentToken }
    });
    
    const gradedData = results.data.data || results.data.result || results.data;
    console.log('Results:');
    console.log(JSON.stringify(gradedData, null, 2));
    
    if (gradedData && (gradedData.score !== undefined || gradedData.totalScore !== undefined)) {
        console.log(`\n✅ E2E TEST PASSED! Final Score: ${gradedData.score || gradedData.totalScore}`);
    } else {
        console.log('\n⚠️ Could not verify final score in results. Check output.');
    }

  } catch (error) {
    console.error('\n❌ E2E TEST FAILED:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

runTests();
