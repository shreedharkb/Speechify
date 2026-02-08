# Frontend Integration Guide - Local Image Upload for Quiz Questions

## ✅ Backend is Ready!

The backend now fully supports uploading images from the teacher's local PC and storing them on the server.

---

## How It Works

1. **Teacher selects image** from their PC
2. **Frontend uploads image** to `/api/images/upload`
3. **Server stores image** in `Backend/uploads/images/`
4. **Server returns URL** like `/uploads/images/filename-123456.png`
5. **Frontend includes URL** in quiz creation
6. **Database stores** the image reference

---

## Complete React/JavaScript Implementation

### Step 1: Create Image Upload Component

```jsx
// components/ImageUpload.jsx
import React, { useState } from 'react';
import axios from 'axios';

function ImageUpload({ onImageUploaded, currentImage, onRemove }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('image', file);

      // Get token from localStorage
      const token = localStorage.getItem('token');

      // Upload to server
      const response = await axios.post(
        'http://localhost:3001/api/images/upload',
        formData,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        // Call parent component with uploaded image URL
        onImageUploaded({
          type: 'url',
          value: response.data.image.url  // e.g., "/uploads/images/file-123.png"
        });
        
        console.log('Image uploaded:', response.data.image);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setError(err.response?.data?.msg || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload">
      <label>Question Image (Optional)</label>
      
      {!currentImage ? (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {uploading && <p>Uploading...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
      ) : (
        <div>
          <img
            src={`http://localhost:3001${currentImage.value}`}
            alt="Question"
            style={{ maxWidth: '200px', display: 'block', margin: '10px 0' }}
          />
          <button type="button" onClick={onRemove}>
            Remove Image
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
```

### Step 2: Update Quiz Creation Form

```jsx
// pages/CreateQuiz.jsx
import React, { useState } from 'react';
import axios from 'axios';
import ImageUpload from '../components/ImageUpload';

function CreateQuiz() {
  const [quizData, setQuizData] = useState({
    title: '',
    subject: '',
    courseCode: '',
    description: '',
    startTime: '',
    endTime: ''
  });

  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: '',
      points: 10,
      correctAnswer: '',
      image: null  // Will be {type: 'url', value: '/uploads/images/...'}
    }
  ]);

  const [submitting, setSubmitting] = useState(false);

  // Handle image upload for a specific question
  const handleImageUploaded = (questionIndex, imageData) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].image = imageData;
    setQuestions(updatedQuestions);
  };

  // Remove image from a question
  const handleRemoveImage = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].image = null;
    setQuestions(updatedQuestions);
  };

  // Update question field
  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  // Add new question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: questions.length + 1,
        text: '',
        points: 10,
        correctAnswer: '',
        image: null
      }
    ]);
  };

  // Remove question
  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  // Submit quiz
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      // Prepare quiz data
      const quizPayload = {
        ...quizData,
        questions: questions.map((q, index) => ({
          id: index + 1,
          text: q.text,
          points: parseInt(q.points),
          image: q.image  // This will be {type: 'url', value: '...'} or null
        })),
        correctAnswers: questions.map((q, index) => ({
          questionId: index + 1,
          answer: q.correctAnswer
        }))
      };

      console.log('Creating quiz:', quizPayload);

      const response = await axios.post(
        'http://localhost:3001/api/quiz/create',
        quizPayload,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.quiz) {
        alert('Quiz created successfully!');
        console.log('Created quiz:', response.data.quiz);
        
        // Reset form or redirect
        // navigate('/teacher/quizzes');
      }
    } catch (error) {
      console.error('Quiz creation failed:', error);
      alert(error.response?.data?.msg || 'Failed to create quiz');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-quiz-form">
      <h2>Create New Quiz</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Basic Quiz Information */}
        <div>
          <label>Quiz Title *</label>
          <input
            type="text"
            value={quizData.title}
            onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label>Subject *</label>
          <input
            type="text"
            value={quizData.subject}
            onChange={(e) => setQuizData({ ...quizData, subject: e.target.value })}
            required
          />
        </div>

        <div>
          <label>Course Code *</label>
          <input
            type="text"
            value={quizData.courseCode}
            onChange={(e) => setQuizData({ ...quizData, courseCode: e.target.value })}
            placeholder="e.g., CS101"
            required
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            value={quizData.description}
            onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
          />
        </div>

        <div>
          <label>Start Time *</label>
          <input
            type="datetime-local"
            value={quizData.startTime}
            onChange={(e) => setQuizData({ ...quizData, startTime: e.target.value })}
            required
          />
        </div>

        <div>
          <label>End Time *</label>
          <input
            type="datetime-local"
            value={quizData.endTime}
            onChange={(e) => setQuizData({ ...quizData, endTime: e.target.value })}
            required
          />
        </div>

        {/* Questions Section */}
        <div className="questions-section">
          <h3>Questions</h3>
          
          {questions.map((question, index) => (
            <div key={index} className="question-card">
              <h4>Question {index + 1}</h4>
              
              <div>
                <label>Question Text *</label>
                <textarea
                  value={question.text}
                  onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                  placeholder="Enter your question"
                  required
                />
              </div>

              <div>
                <label>Points *</label>
                <input
                  type="number"
                  value={question.points}
                  onChange={(e) => updateQuestion(index, 'points', e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div>
                <label>Correct Answer *</label>
                <textarea
                  value={question.correctAnswer}
                  onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                  placeholder="Enter the correct answer"
                  required
                />
              </div>

              {/* Image Upload Component */}
              <ImageUpload
                currentImage={question.image}
                onImageUploaded={(imageData) => handleImageUploaded(index, imageData)}
                onRemove={() => handleRemoveImage(index)}
              />

              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="remove-question-btn"
                >
                  Remove Question
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addQuestion}>
            + Add Question
          </button>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating Quiz...' : 'Create Quiz'}
        </button>
      </form>
    </div>
  );
}

export default CreateQuiz;
```

### Step 3: Display Images in Quiz View

```jsx
// components/QuizQuestion.jsx
function QuizQuestion({ question, questionNumber }) {
  return (
    <div className="quiz-question">
      <h3>Question {questionNumber}</h3>
      <p>{question.text}</p>
      
      {question.image && (
        <div className="question-image">
          <img
            src={`http://localhost:3001${question.image.value}`}
            alt={`Question ${questionNumber}`}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      )}
      
      <p className="points">Points: {question.points}</p>
    </div>
  );
}
```

---

## Vanilla JavaScript (No React)

If you're not using React:

```html
<!-- create-quiz.html -->
<form id="createQuizForm">
  <!-- Quiz fields -->
  <input type="text" id="title" required />
  <input type="text" id="courseCode" required />
  
  <!-- Question 1 -->
  <div class="question">
    <textarea id="q1-text" required></textarea>
    <input type="number" id="q1-points" value="10" />
    <input type="file" id="q1-image" accept="image/*" />
    <div id="q1-image-preview"></div>
  </div>
  
  <button type="submit">Create Quiz</button>
</form>

<script>
const API_URL = 'http://localhost:3001/api';
let questionImages = {}; // Store uploaded image URLs

// Handle image upload
async function uploadQuestionImage(fileInput, questionId) {
  const file = fileInput.files[0];
  if (!file) return null;

  const formData = new FormData();
  formData.append('image', file);

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/images/upload`, {
      method: 'POST',
      headers: {
        'x-auth-token': token
      },
      body: formData
    });

    const data = await response.json();
    if (data.success) {
      questionImages[questionId] = {
        type: 'url',
        value: data.image.url
      };
      
      // Show preview
      const preview = document.getElementById(`q${questionId}-image-preview`);
      preview.innerHTML = `<img src="${API_URL.replace('/api', '')}${data.image.url}" style="max-width:200px" />`;
      
      return data.image.url;
    }
  } catch (error) {
    console.error('Image upload failed:', error);
    alert('Failed to upload image');
  }
  return null;
}

// Attach upload handlers
document.getElementById('q1-image').addEventListener('change', function() {
  uploadQuestionImage(this, 1);
});

// Handle form submission
document.getElementById('createQuizForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const quizData = {
    title: document.getElementById('title').value,
    courseCode: document.getElementById('courseCode').value,
    // ... other fields
    questions: [
      {
        id: 1,
        text: document.getElementById('q1-text').value,
        points: parseInt(document.getElementById('q1-points').value),
        image: questionImages[1] || null  // Use uploaded image or null
      }
      // ... more questions
    ],
    correctAnswers: [
      { questionId: 1, answer: document.getElementById('q1-answer').value }
    ]
  };

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/quiz/create`, {
      method: 'POST',
      headers: {
        'x-auth-token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quizData)
    });

    const data = await response.json();
    if (data.quiz) {
      alert('Quiz created successfully!');
      console.log('Created quiz:', data.quiz);
    }
  } catch (error) {
    console.error('Quiz creation failed:', error);
    alert('Failed to create quiz');
  }
});
</script>
```

---

## Key Points

1. **Upload images BEFORE creating the quiz** - Each image gets uploaded individually and returns a URL
2. **Store the URL** - Keep the returned URL (`/uploads/images/filename.png`) to include in quiz data
3. **Format correctly** - Always send as `{type: 'url', value: '/uploads/images/...'}` or `null`
4. **Use FormData** - For file uploads, must use FormData (not JSON)
5. **Correct headers** - Use `x-auth-token` for authentication, let browser set Content-Type for FormData

---

## Testing

Test the complete flow:

```bash
node Backend/scripts/test-local-image-upload.js
```

This will verify images are uploaded, stored, and saved to the database correctly.

---

**Status:** ✅ Fully Implemented and Tested
