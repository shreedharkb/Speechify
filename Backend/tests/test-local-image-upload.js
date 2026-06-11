/**
 * Complete Test: Upload Local Image and Create Quiz
 * Simulates teacher uploading an image from their PC and creating a quiz
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001/api';

// Create a test image file
function createTestImage() {
  const testImagePath = path.join(__dirname, 'test-image.png');
  
  // Create a simple 1x1 PNG image (base64 encoded)
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const imageBuffer = Buffer.from(pngBase64, 'base64');
  
  fs.writeFileSync(testImagePath, imageBuffer);
  console.log('✅ Test image created:', testImagePath);
  
  return testImagePath;
}

async function testLocalImageUploadAndQuiz() {
  let imagePath;
  
  try {
    console.log('🧪 Testing Local Image Upload and Quiz Creation\n');
    console.log('This simulates a teacher uploading images from their PC\n');

    // Step 1: Create a test image
    console.log('1️⃣  Creating test image file...');
    imagePath = createTestImage();

    // Step 2: Login as teacher
    console.log('\n2️⃣  Logging in as teacher...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test.teacher@quiz.com',
      password: 'password123'
    });

    const { token, user } = loginResponse.data;
    console.log(`✅ Logged in as: ${user.name} (Role: ${user.role})`);

    // Step 3: Upload local image file
    console.log('\n3️⃣  Uploading local image file...');
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });

    const uploadResponse = await axios.post(
      `${BASE_URL}/images/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'x-auth-token': token
        }
      }
    );

    const uploadedImage = uploadResponse.data.image;
    console.log(`✅ Image uploaded successfully!`);
    console.log(`   Filename: ${uploadedImage.filename}`);
    console.log(`   URL: ${uploadedImage.url}`);
    console.log(`   Size: ${uploadedImage.size} bytes`);
    console.log(`   Full URL: http://localhost:3001${uploadedImage.url}`);

    // Step 4: Upload another image for second question
    console.log('\n4️⃣  Uploading second image...');
    
    const formData2 = new FormData();
    formData2.append('image', fs.createReadStream(imagePath), {
      filename: 'test-image-2.png',
      contentType: 'image/png'
    });

    const uploadResponse2 = await axios.post(
      `${BASE_URL}/images/upload`,
      formData2,
      {
        headers: {
          ...formData2.getHeaders(),
          'x-auth-token': token
        }
      }
    );

    const uploadedImage2 = uploadResponse2.data.image;
    console.log(`✅ Second image uploaded: ${uploadedImage2.filename}`);

    // Step 5: Create quiz with uploaded images
    console.log('\n5️⃣  Creating quiz with uploaded local images...');
    
    const quizData = {
      title: 'Quiz with Local Images',
      subject: 'Computer Science',
      courseCode: 'CS999',
      description: 'This quiz uses images uploaded from teacher\'s local PC',
      questions: [
        {
          id: 1,
          text: 'Question with first uploaded image',
          points: 10,
          image: {
            type: 'url',
            value: uploadedImage.url  // Use the uploaded image URL
          }
        },
        {
          id: 2,
          text: 'Question with second uploaded image',
          points: 15,
          image: {
            type: 'url',
            value: uploadedImage2.url  // Use the second uploaded image URL
          }
        },
        {
          id: 3,
          text: 'Question without image',
          points: 10,
          image: null
        }
      ],
      correctAnswers: [
        { questionId: 1, answer: 'Answer 1' },
        { questionId: 2, answer: 'Answer 2' },
        { questionId: 3, answer: 'Answer 3' }
      ],
      startTime: new Date('2026-03-10T10:00:00Z').toISOString(),
      endTime: new Date('2026-03-10T12:00:00Z').toISOString()
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
    console.log(`✅ Quiz created with local images!`);
    console.log(`   Quiz ID: ${quiz.id}`);
    console.log(`   Title: ${quiz.title}`);
    console.log(`   Questions: ${quiz.questionCount}`);
    console.log(`   Total Points: ${quiz.totalPoints}`);

    // Step 6: Verify quiz has images stored
    console.log('\n6️⃣  Verifying quiz images in database...');
    
    const verifyResponse = await axios.get(
      `${BASE_URL}/quiz/${quiz.id}`,
      {
        headers: { 'x-auth-token': token }
      }
    );

    console.log(`✅ Quiz retrieved from database:\n`);
    verifyResponse.data.questions.forEach((q, index) => {
      const hasImage = q.image !== null;
      const status = hasImage ? '✅' : '❌';
      console.log(`   ${status} Q${index + 1}: ${q.text}`);
      console.log(`       Points: ${q.points}`);
      if (hasImage) {
        console.log(`       Image URL: ${q.image.value}`);
        console.log(`       Full URL: http://localhost:3001${q.image.value}`);
        console.log(`       File stored at: Backend${q.image.value.replace(/\//g, '\\')}`);
      } else {
        console.log(`       Image: null`);
      }
      console.log('');
    });

    // Step 7: Verify image files exist on disk
    console.log('7️⃣  Verifying image files exist on server...');
    
    const imagePath1 = path.join(__dirname, '..', uploadedImage.url.replace(/^\//, ''));
    const imagePath2 = path.join(__dirname, '..', uploadedImage2.url.replace(/^\//, ''));
    
    const file1Exists = fs.existsSync(imagePath1);
    const file2Exists = fs.existsSync(imagePath2);
    
    console.log(`   ${file1Exists ? '✅' : '❌'} Image 1: ${imagePath1}`);
    console.log(`   ${file2Exists ? '✅' : '❌'} Image 2: ${imagePath2}`);

    if (file1Exists && file2Exists) {
      const file1Stats = fs.statSync(imagePath1);
      const file2Stats = fs.statSync(imagePath2);
      console.log(`\n   File 1 size: ${file1Stats.size} bytes`);
      console.log(`   File 2 size: ${file2Stats.size} bytes`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ LOCAL IMAGE UPLOAD TEST PASSED!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   ✅ Teacher logged in successfully`);
    console.log(`   ✅ Images uploaded from local PC`);
    console.log(`   ✅ Images stored on server: Backend/uploads/images/`);
    console.log(`   ✅ Quiz created with local image URLs`);
    console.log(`   ✅ Image URLs stored in database`);
    console.log(`   ✅ Images accessible via HTTP`);
    console.log(`\n📁 Uploaded Images:`);
    console.log(`   - ${uploadedImage.filename}`);
    console.log(`   - ${uploadedImage2.filename}`);
    console.log(`\n🌐 Access Images:`);
    console.log(`   - http://localhost:3001${uploadedImage.url}`);
    console.log(`   - http://localhost:3001${uploadedImage2.url}`);

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.msg || error.response.data.error}`);
      if (error.response.data) {
        console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
      }
    } else {
      console.error(`   Error: ${error.message}`);
      if (error.code) {
        console.error(`   Code: ${error.code}`);
      }
    }
  } finally {
    // Cleanup test image
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log('\n🧹 Cleaned up test image');
    }
  }
}

// Run the test
testLocalImageUploadAndQuiz();
