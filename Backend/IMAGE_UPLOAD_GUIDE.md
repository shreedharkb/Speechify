# Image Upload for Quiz Questions - Implementation Guide

**Date:** February 7, 2026  
**Status:** ✅ Implemented

---

## Problem

When teachers create quizzes and try to add images to questions, the images were showing as `null` in the database instead of storing the image reference.

## Solution

Updated the backend to properly handle different image input formats from the frontend.

---

## Backend Changes

### 1. Image Upload Route Created

**File:** `Backend/routes/images.js`

New endpoints for uploading images:
- `POST /api/images/upload` - Upload single image
- `POST /api/images/upload-multiple` - Upload multiple images
- `DELETE /api/images/:filename` - Delete uploaded image

**Features:**
- ✅ Accepts JPEG, PNG, GIF, WebP formats
- ✅ 5MB max file size
- ✅ Unique filenames (timestamp + random string)
- ✅ Stored in `Backend/uploads/images/`
- ✅ Returns image URL for use in quiz

### 2. Quiz Controller Updated

**File:** `Backend/controllers/quizController.js`

Now handles multiple image input formats:

```javascript
// Format 1: Object with type and value (Recommended)
{
  type: 'url',
  value: 'https://example.com/image.png'
}

// Format 2: String URL (Auto-converted)
"https://example.com/image.png"

// Format 3: Object with url property (Auto-converted)
{
  url: 'https://example.com/image.png'
}

// Format 4: null (No image)
null
```

### 3. Static File Serving

**File:** `Backend/server.js`

- ✅ Added static file serving for `/uploads` directory
- ✅ Images accessible at `http://localhost:3001/uploads/images/filename.png`

---

## Frontend Integration

### Option 1: Upload Image First (Recommended)

**Step 1:** Upload the image file

```javascript
const uploadImage = async (imageFile, token) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch('http://localhost:3001/api/images/upload', {
    method: 'POST',
    headers: {
      'x-auth-token': token
    },
    body: formData
  });

  const data = await response.json();
  return data.image.url; // Returns: "/uploads/images/filename-123456.png"
};
```

**Step 2:** Create quiz with image URLs

```javascript
const createQuiz = async (quizData, token) => {
  // Assume images are already uploaded and we have their URLs
  const quiz = {
    title: "Networking Quiz",
    subject: "Computer Networks",
    courseCode: "NET401",
    description: "Quiz description",
    questions: [
      {
        id: 1,
        text: "What is the OSI Model?",
        points: 10,
        image: {
          type: 'url',
          value: '/uploads/images/osi-model-123456.png' // URL from upload
        }
      },
      {
        id: 2,
        text: "Question without image",
        points: 10,
        image: null
      }
    ],
    correctAnswers: [
      { questionId: 1, answer: "Answer 1" },
      { questionId: 2, answer: "Answer 2" }
    ],
    startTime: "2026-02-20T10:00:00Z",
    endTime: "2026-02-20T12:00:00Z"
  };

  const response = await fetch('http://localhost:3001/api/quiz/create', {
    method: 'POST',
    headers: {
      'x-auth-token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(quiz)
  });

  return await response.json();
};
```

### Option 2: Use External Image URLs

If you're using externally hosted images (CDN, cloud storage):

```javascript
const quiz = {
  // ... other fields
  questions: [
    {
      id: 1,
      text: "Question text",
      points: 10,
      image: "https://cdn.example.com/image.png" // Simple string
    },
    {
      id: 2,
      text: "Another question",
      points: 10,
      image: {
        type: 'url',
        value: "https://cdn.example.com/image2.png" // Proper format
      }
    }
  ]
};
```

---

## Complete React Example

```jsx
import React, { useState } from 'react';

function CreateQuizForm() {
  const [questions, setQuestions] = useState([
    { id: 1, text: '', points: 10, image: null, imageFile: null }
  ]);

  const handleImageUpload = async (questionIndex, file) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:3001/api/images/upload', {
        method: 'POST',
        headers: {
          'x-auth-token': token
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        // Update question with uploaded image URL
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].image = {
          type: 'url',
          value: `http://localhost:3001${data.image.url}`
        };
        setQuestions(updatedQuestions);
        
        alert('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image');
    }
  };

  const handleImageSelect = (questionIndex, event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Upload immediately
      handleImageUpload(questionIndex, file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const quizData = {
      title: document.getElementById('title').value,
      subject: document.getElementById('subject').value,
      courseCode: document.getElementById('courseCode').value,
      description: document.getElementById('description').value,
      questions: questions.map((q, index) => ({
        id: index + 1,
        text: q.text,
        points: q.points,
        image: q.image // Will be properly formatted object or null
      })),
      correctAnswers: questions.map((q, index) => ({
        questionId: index + 1,
        answer: q.correctAnswer || ''
      })),
      startTime: document.getElementById('startTime').value,
      endTime: document.getElementById('endTime').value
    };

    try {
      const response = await fetch('http://localhost:3001/api/quiz/create', {
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
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Basic fields */}
      <input id="title" placeholder="Quiz Title" required />
      <input id="subject" placeholder="Subject" required />
      <input id="courseCode" placeholder="Course Code" required />
      <textarea id="description" placeholder="Description" />
      <input id="startTime" type="datetime-local" required />
      <input id="endTime" type="datetime-local" required />

      {/* Questions */}
      {questions.map((q, index) => (
        <div key={index}>
          <h4>Question {index + 1}</h4>
          <input
            placeholder="Question text"
            value={q.text}
            onChange={(e) => {
              const updated = [...questions];
              updated[index].text = e.target.value;
              setQuestions(updated);
            }}
            required
          />
          <input
            type="number"
            placeholder="Points"
            value={q.points}
            onChange={(e) => {
              const updated = [...questions];
              updated[index].points = parseInt(e.target.value);
              setQuestions(updated);
            }}
            required
          />
          <input
            placeholder="Correct Answer"
            onChange={(e) => {
              const updated = [...questions];
              updated[index].correctAnswer = e.target.value;
              setQuestions(updated);
            }}
          />
          
          {/* Image Upload */}
          <div>
            <label>Question Image (Optional):</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect(index, e)}
            />
            {q.image && (
              <div>
                <img 
                  src={q.image.value} 
                  alt="Question" 
                  style={{ maxWidth: '200px', marginTop: '10px' }}
                />
                <button 
                  type="button"
                  onClick={() => {
                    const updated = [...questions];
                    updated[index].image = null;
                    setQuestions(updated);
                  }}
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      <button type="button" onClick={() => setQuestions([...questions, { 
        id: questions.length + 1, 
        text: '', 
        points: 10, 
        image: null 
      }])}>
        Add Question
      </button>

      <button type="submit">Create Quiz</button>
    </form>
  );
}

export default CreateQuizForm;
```

---

## API Endpoints Reference

### Upload Image
```http
POST /api/images/upload
Headers:
  x-auth-token: <teacher-jwt-token>
Content-Type: multipart/form-data

Body (FormData):
  image: <file>

Response:
{
  "success": true,
  "msg": "Image uploaded successfully",
  "image": {
    "filename": "osi-model-1707313891234-123456789.png",
    "url": "/uploads/images/osi-model-1707313891234-123456789.png",
    "size": 245678,
    "mimetype": "image/png",
    "originalname": "osi-model.png"
  }
}
```

### Create Quiz with Images
```http
POST /api/quiz/create
Headers:
  x-auth-token: <teacher-jwt-token>
  Content-Type: application/json

Body:
{
  "title": "Quiz Title",
  "subject": "Subject",
  "courseCode": "CODE123",
  "questions": [
    {
      "id": 1,
      "text": "Question with image",
      "points": 10,
      "image": {
        "type": "url",
        "value": "/uploads/images/filename.png"
      }
    },
    {
      "id": 2,
      "text": "Question without image",
      "points": 10,
      "image": null
    }
  ],
  ...
}
```

---

## Testing

Check if images are properly stored:

```bash
# Create a quiz and verify
node Backend/scripts/check-quiz-points.js
```

The output should show image data instead of null for questions with images.

---

## Important Notes

1. **Image Format:** Always use `{type: 'url', value: 'image-path'}` format in database
2. **Upload First:** Upload images before creating the quiz
3. **File Size:** Maximum 5MB per image
4. **Allowed Types:** JPEG, PNG, GIF, WebP only
5. **Storage:** Images stored in `Backend/uploads/images/`
6. **Access:** Images served at `http://localhost:3001/uploads/images/filename`

---

**Status:** ✅ Ready for Frontend Integration
