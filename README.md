# Speechify - AI-Powered Quiz Platform
## Complete Technical Documentation

**Date:** December 26, 2025  
**Project Type:** Full-Stack Web Application  
**Tech Stack:** MERN (MongoDB, Express.js, React, Node.js) + SBERT AI Integration

> **🆕 LATEST UPDATE (Dec 26, 2025):** The grading system has been upgraded from Gemini API to **SBERT (Sentence-BERT)** for semantic similarity evaluation. This provides faster, free, offline, and privacy-focused grading. See [SBERT_SETUP.md](SBERT_SETUP.md) for details.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Backend Structure](#backend-structure)
4. [Frontend Structure](#frontend-structure)
5. [API Routes & Endpoints](#api-routes--endpoints)
6. [Data Flow & Request Lifecycle](#data-flow--request-lifecycle)
7. [AI Grading System](#ai-grading-system)
8. [Authentication & Authorization](#authentication--authorization)
9. [Database Schema](#database-schema)
10. [File-by-File Breakdown](#file-by-file-breakdown)

---

## Project Overview

**What is Speechify?**  
Speechify is an intelligent quiz platform that uses AI (SBERT - Sentence-BERT) to grade student answers semantically. Instead of requiring exact matches, it understands the meaning of answers and grades them based on semantic similarity to the correct answer.

**Key Features:**
- 🎓 Teacher can create quizzes with questions
- 👨‍🎓 Students can take quizzes and submit answers
- 🤖 AI grades answers based on semantic understanding (not just exact matching)
- 📊 Real-time grading with detailed feedback
- ⏰ Quiz scheduling with start/end dates
- 🔐 JWT-based authentication for teachers and students
- 📈 Performance tracking and quiz history

**Why This Project Exists:**
Traditional quiz systems only accept exact answers. This project uses AI to understand if a student's answer means the same thing as the correct answer, even if worded differently. For example:
- Correct Answer: "Photosynthesis is the process plants use to convert sunlight into energy"
- Student Answer: "Plants make food using light from the sun"
- Traditional System: ❌ Wrong
- Speechify AI: ✅ Correct (85% similarity)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                          │
│  ┌───────────────────────────────────────────────────┐     │
│  │         React Frontend (Port 5174)                │     │
│  │  - Components (UI Building Blocks)                │     │
│  │  - Pages (Full Page Views)                        │     │
│  │  - Vite Dev Server (Fast Refresh)                 │     │
│  └───────────────────┬───────────────────────────────┘     │
└────────────────────────┼───────────────────────────────────┘
                         │ HTTP Requests (axios)
                         │ with JWT Token in headers
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVER SIDE                           │
│  ┌───────────────────────────────────────────────────┐     │
│  │      Node.js/Express Backend (Port 5000)          │     │
│  │  ┌─────────────────────────────────────────┐     │     │
│  │  │  Routes (API Endpoints)                 │     │     │
│  │  │  /api/auth, /api/quiz, /api/questions   │     │     │
│  │  └──────────┬──────────────────────────────┘     │     │
│  │             ▼                                      │     │
│  │  ┌─────────────────────────────────────────┐     │     │
│  │  │  Middleware (Request Processing)        │     │     │
│  │  │  - authMiddleware (JWT Verification)    │     │     │
│  │  │  - teacherMiddleware (Role Check)       │     │     │
│  │  └──────────┬──────────────────────────────┘     │     │
│  │             ▼                                      │     │
│  │  ┌─────────────────────────────────────────┐     │     │
│  │  │  Controllers (Business Logic)           │     │     │
│  │  │  - Process requests                     │     │     │
│  │  │  - Call AI services                     │     │     │
│  │  │  - Return responses                     │     │     │
│  │  └──────────┬──────────────────────────────┘     │     │
│  │             ▼                                      │     │
│  │  ┌─────────────────────────────────────────┐     │     │
│  │  │  Models (Data Schema)                   │     │     │
│  │  │  - Define database structure            │     │     │
│  │  │  - Mongoose schemas                     │     │     │
│  │  └──────────┬──────────────────────────────┘     │     │
│  └─────────────┼──────────────────────────────────┘     │
└────────────────┼───────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              MongoDB Atlas (Cloud Database)                 │
│  Collections: users, quizevents, quizattempts              │
└─────────────────────────────────────────────────────────────┘
                 
                 ▲
                 │ API Calls
                 │
┌────────────────┴─────────────────────────────────────────────┐
│              Google Gemini AI (External Service)             │
│  - Semantic answer grading                                   │
│  - Returns similarity score (0.0 - 1.0)                      │
└──────────────────────────────────────────────────────────────┘
```

---

## Backend Structure

### Why Backend Exists
The backend is the **brain** of the application. It:
1. **Stores and retrieves data** from the database
2. **Protects sensitive operations** (only authenticated users can access)
3. **Handles business logic** (grading, quiz creation, user management)
4. **Communicates with external services** (Google Gemini AI)
5. **Validates data** before saving to database

### Folder Structure Explained

```
Backend/
├── server.js                    # Entry point - starts the Express server
├── package.json                 # Lists all dependencies (express, mongoose, etc.)
├── google-credentials.json      # Google Cloud API credentials for Gemini
│
├── controllers/                 # Business Logic Layer
│   ├── authController.js        # Handles login, signup, user verification
│   ├── gradeController.js       # Calls Google Gemini AI for grading
│   ├── questionController.js    # CRUD operations for questions
│   ├── quizController.js        # CRUD operations for quizzes
│   ├── quizAttemptController.js # Handles quiz submissions and grading
│   ├── verifyController.js      # Token verification
│   └── whisperController.js     # (Future: Audio transcription)
│
├── middleware/                  # Request Interceptors
│   ├── authMiddleware.js        # Verifies JWT token on protected routes
│   └── teacherMiddleware.js     # Ensures user is a teacher
│
├── models/                      # Database Schemas
│   ├── User.js                  # User data structure (email, password, role)
│   ├── Quiz.js                  # Quiz template (questions without dates)
│   ├── QuizEvent.js             # Quiz instance (with start/end dates)
│   └── QuizAttempt.js           # Student's quiz submission and scores
│
├── routes/                      # API Endpoint Definitions
│   ├── auth.js                  # /api/auth/* routes
│   ├── questions.js             # /api/questions/* routes
│   ├── quiz.js                  # /api/quiz/* routes
│   ├── quizAttempt.js           # /api/quiz-attempt/* routes
│   └── whisper.js               # /api/whisper/* routes
│
├── scripts/                     # Utility Scripts
│   ├── seedQuestions.js         # Populate database with sample questions
│   ├── check-quiz-dates.js      # Debug quiz date issues
│   └── migrate-to-quiz-events.js # Database migration script
│
└── uploads/                     # Temporary file storage (audio files)
```

---

## Frontend Structure

### Why Frontend Exists
The frontend is the **face** of the application. It:
1. **Displays the user interface** (what users see and interact with)
2. **Sends requests to the backend** (fetch data, submit forms)
3. **Manages application state** (React hooks like useState, useEffect)
4. **Handles routing** (which page to show based on URL)
5. **Validates user input** before sending to backend

### Folder Structure Explained

```
Frontend/
├── index.html                   # HTML entry point (loads React app)
├── package.json                 # Lists dependencies (react, react-router, axios)
├── vite.config.js               # Vite bundler configuration
├── eslint.config.js             # Code quality rules
│
├── src/
│   ├── main.jsx                 # React entry point (renders App component)
│   ├── App.jsx                  # Main app component (sets up routing)
│   ├── styles.css               # Global CSS styles
│   │
│   ├── components/              # Reusable UI Components
│   │   ├── Navbar.jsx           # Top navigation bar
│   │   ├── Footer.jsx           # Bottom footer
│   │   └── quiz/                # Quiz-specific components
│   │       ├── QuizList.jsx     # Displays list of available quizzes
│   │       ├── QuizAttempt.jsx  # Quiz taking interface
│   │       ├── QuizResults.jsx  # Shows results after submission
│   │       ├── QuizEditor.jsx   # Teacher's quiz creation interface
│   │       └── QuizEventCard.jsx # Individual quiz card component
│   │
│   ├── pages/                   # Full Page Views
│   │   ├── HomePage.jsx         # Landing page
│   │   ├── LoginPage.jsx        # Login form
│   │   ├── SignupPage.jsx       # Registration form
│   │   ├── DashboardPage.jsx    # Main dashboard (routes to teacher/student)
│   │   ├── TeacherDashboard.jsx # Teacher's dashboard (create/manage quizzes)
│   │   ├── StudentDashboard.jsx # Student's dashboard (view/take quizzes)
│   │   └── QuizPage.jsx         # Quiz taking page
│   │
│   └── utils/                   # Helper Functions
│       └── auth.js              # JWT token management (get, set, remove)
│
└── public/                      # Static assets (images, icons)
```

---

## API Routes & Endpoints

### Complete API Reference

#### 1. Authentication Routes (`/api/auth`)
**File:** `Backend/routes/auth.js` → `Backend/controllers/authController.js`

| Method | Endpoint | Purpose | Request Body | Response | Auth Required |
|--------|----------|---------|--------------|----------|---------------|
| POST | `/api/auth/signup` | Register new user | `{name, email, password, role}` | `{token, user}` | No |
| POST | `/api/auth/login` | Login existing user | `{email, password}` | `{token, user}` | No |
| GET | `/api/auth/verify` | Verify JWT token | None (token in header) | `{user}` | Yes |

**Example Request:**
```javascript
// Signup
POST /api/auth/signup
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "student"
}

Response: {
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

#### 2. Quiz Routes (`/api/quiz`)
**File:** `Backend/routes/quiz.js` → `Backend/controllers/quizController.js`

| Method | Endpoint | Purpose | Auth | Teacher Only |
|--------|----------|---------|------|--------------|
| GET | `/api/quiz` | Get all quizzes | Yes | No |
| GET | `/api/quiz/:id` | Get single quiz | Yes | No |
| POST | `/api/quiz` | Create new quiz | Yes | Yes |
| PUT | `/api/quiz/:id` | Update quiz | Yes | Yes |
| DELETE | `/api/quiz/:id` | Delete quiz | Yes | Yes |
| GET | `/api/quiz/active/student` | Get active quizzes for student | Yes | No |
| GET | `/api/quiz/student/history` | Get student's quiz history | Yes | No |
| POST | `/api/quiz/:id/schedule` | Schedule quiz (create QuizEvent) | Yes | Yes |

**Example Request:**
```javascript
// Create Quiz (Teacher only)
POST /api/quiz
Headers: { "x-auth-token": "JWT_TOKEN_HERE" }
Body: {
  "title": "Physics Quiz 1",
  "description": "Basic mechanics concepts",
  "questions": [
    {
      "questionText": "What is Newton's First Law?",
      "correctAnswerText": "An object at rest stays at rest unless acted upon by an external force",
      "points": 10
    }
  ]
}

Response: {
  "_id": "507f1f77bcf86cd799439012",
  "title": "Physics Quiz 1",
  "description": "Basic mechanics concepts",
  "teacher": "507f1f77bcf86cd799439011",
  "questions": [...],
  "createdAt": "2025-12-02T10:30:00Z"
}
```

#### 3. Quiz Attempt Routes (`/api/quiz-attempt`)
**File:** `Backend/routes/quizAttempt.js` → `Backend/controllers/quizAttemptController.js`

| Method | Endpoint | Purpose | Auth | Description |
|--------|----------|---------|------|-------------|
| POST | `/api/quiz-attempt/submit` | Submit quiz answers | Yes | Grades answers with AI |
| GET | `/api/quiz-attempt/:id` | Get quiz attempt details | Yes | View specific attempt |
| GET | `/api/quiz-attempt/check/:quizEventId` | Check if student took quiz | Yes | Prevents retakes |

**Example Request:**
```javascript
// Submit Quiz
POST /api/quiz-attempt/submit
Headers: { "x-auth-token": "JWT_TOKEN_HERE" }
Body: {
  "quizEventId": "507f1f77bcf86cd799439013",
  "answers": [
    {
      "questionId": "507f1f77bcf86cd799439014",
      "studentAnswer": "Objects stay still unless pushed or pulled"
    }
  ],
  "startedAt": "2025-12-02T10:00:00Z"
}

Response: {
  "quizAttempt": {
    "_id": "507f1f77bcf86cd799439015",
    "student": "507f1f77bcf86cd799439011",
    "quizEvent": "507f1f77bcf86cd799439013",
    "score": 85,
    "totalPoints": 100,
    "percentage": 85,
    "gradedAnswers": [
      {
        "question": "What is Newton's First Law?",
        "studentAnswer": "Objects stay still unless pushed or pulled",
        "correctAnswer": "An object at rest stays at rest...",
        "isCorrect": true,
        "pointsEarned": 8.5,
        "maxPoints": 10,
        "similarityScore": 0.85,
        "explanation": "The answer correctly captures the essence of Newton's First Law"
      }
    ]
  }
}
```

#### 4. Questions Routes (`/api/questions`)
**File:** `Backend/routes/questions.js` → `Backend/controllers/questionController.js`

| Method | Endpoint | Purpose | Auth | Teacher Only |
|--------|----------|---------|------|--------------|
| GET | `/api/questions` | Get all questions | Yes | Yes |
| POST | `/api/questions` | Create question | Yes | Yes |
| PUT | `/api/questions/:id` | Update question | Yes | Yes |
| DELETE | `/api/questions/:id` | Delete question | Yes | Yes |

---

## Data Flow & Request Lifecycle

### Example: Student Takes a Quiz

**Step-by-Step Flow:**

```
1. STUDENT CLICKS "START QUIZ"
   ↓
   Frontend: QuizList.jsx
   - User clicks green "Start" button
   - navigate('/quiz/' + quizEventId)
   
2. LOAD QUIZ PAGE
   ↓
   Frontend: QuizPage.jsx
   - useEffect runs on mount
   - Calls: GET /api/quiz/:quizEventId
   
3. BACKEND RECEIVES REQUEST
   ↓
   Backend Flow:
   server.js (port 5000)
   → routes/quiz.js (matches /api/quiz/:id)
   → authMiddleware.js (verifies JWT token)
   → controllers/quizController.js (getQuizById function)
   → models/QuizEvent.js (queries MongoDB)
   → Response sent back to frontend
   
4. FRONTEND DISPLAYS QUIZ
   ↓
   QuizPage.jsx:
   - Renders quiz title, questions
   - Student types answers in textareas
   - Clicks "Submit Quiz"
   
5. SUBMIT QUIZ ANSWERS
   ↓
   Frontend: QuizPage.jsx (handleSubmit function)
   - Collects all answers from state
   - Calls: POST /api/quiz-attempt/submit
   - Body: { quizEventId, answers, startedAt }
   
6. BACKEND GRADES ANSWERS WITH AI
   ↓
   Backend Flow:
   server.js
   → routes/quizAttempt.js
   → authMiddleware.js
   → controllers/quizAttemptController.js (submitQuizAttempt)
   
   For each answer:
   → controllers/gradeController.js (gradeAnswerWithAI)
   → Makes HTTP request to Google Gemini API
   → Gemini returns similarity score (0.0 - 1.0)
   → Calculate points: maxPoints × similarityScore
   → Mark correct if similarity >= 0.70
   
   → Save to MongoDB (QuizAttempt model)
   → Response sent with grades
   
7. DISPLAY RESULTS
   ↓
   Frontend: QuizResults.jsx
   - Shows total score
   - Shows each question with:
     * Student answer
     * Correct answer
     * Points earned
     * AI explanation
```

---

## AI Grading System

### How Semantic Grading Works

**File:** `Backend/controllers/gradeController.js`

**Purpose:** Instead of exact string matching, the AI understands meaning.

**Process:**

1. **Student submits answer:** "Plants make food using sunlight"
2. **Correct answer:** "Photosynthesis is the process plants use to convert light energy into chemical energy"
3. **AI Request to Gemini:**
   ```javascript
   const prompt = `
   Question: What is photosynthesis?
   Correct Answer: Photosynthesis is the process plants use to convert light energy into chemical energy
   Student Answer: Plants make food using sunlight
   
   Grade this answer on semantic similarity (0.0 to 1.0).
   Consider if the student understands the core concept.
   Return JSON: { "similarityScore": 0.85, "explanation": "..." }
   `;
   ```

4. **Gemini AI Response:**
   ```json
   {
     "similarityScore": 0.85,
     "explanation": "The student correctly identifies that plants use sunlight to make food, which demonstrates understanding of the core concept of photosynthesis."
   }
   ```

5. **Points Calculation:**
   ```javascript
   // Question worth 10 points
   const maxPoints = 10;
   const similarity = 0.85;
   
   // Direct calculation (no artificial manipulation)
   const pointsEarned = maxPoints * similarity; // 10 × 0.85 = 8.5 points
   
   // Mark as correct if similarity >= 0.70
   const isCorrect = similarity >= 0.70; // true
   ```

**Why This Approach:**
- **Fairer grading:** Rewards understanding, not memorization
- **Transparent:** Uses AI's actual assessment (0.70 threshold)
- **Accurate:** No artificial score inflation or reduction
- **Consistent:** Same standard applied to all answers

---

## Authentication & Authorization

### How Security Works

**File:** `Backend/middleware/authMiddleware.js`

**JWT (JSON Web Token) Flow:**

```
1. USER LOGS IN
   ↓
   POST /api/auth/login
   { email: "john@example.com", password: "pass123" }
   ↓
   Backend verifies password with bcrypt
   ↓
   Creates JWT token:
   {
     userId: "507f1f77bcf86cd799439011",
     role: "student",
     exp: 1733155200 (expires in 1 hour)
   }
   ↓
   Signed with SECRET_KEY
   ↓
   Returns token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   
2. FRONTEND STORES TOKEN
   ↓
   localStorage.setItem('token', token)
   
3. FUTURE REQUESTS INCLUDE TOKEN
   ↓
   Every API call includes header:
   { "x-auth-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
   
4. BACKEND VERIFIES TOKEN
   ↓
   authMiddleware.js runs before controller:
   - Extracts token from header
   - Verifies signature with SECRET_KEY
   - Decodes userId from token
   - Fetches user from database
   - Adds user to req.user
   - Calls next() to proceed to controller
   
5. CONTROLLER ACCESS USER
   ↓
   req.user contains:
   {
     _id: "507f1f77bcf86cd799439011",
     name: "John Doe",
     email: "john@example.com",
     role: "student"
   }
```

**Teacher-Only Routes:**

Some routes require teacher role (creating quizzes, etc.)

**File:** `Backend/middleware/teacherMiddleware.js`

```javascript
// Applied after authMiddleware
if (req.user.role !== 'teacher') {
  return res.status(403).json({ msg: 'Access denied: Teachers only' });
}
next();
```

**Usage in Routes:**
```javascript
// Public route (no auth)
router.post('/signup', authController.signup);

// Protected route (auth required)
router.get('/quiz', authMiddleware, quizController.getAllQuizzes);

// Teacher-only route (auth + role check)
router.post('/quiz', authMiddleware, teacherMiddleware, quizController.createQuiz);
```

---

## Database Schema

### MongoDB Collections

**Why MongoDB:**
- Flexible schema (can add fields easily)
- JSON-like documents (matches JavaScript objects)
- Great for nested data (quiz with questions)
- Cloud-hosted (MongoDB Atlas)

### 1. Users Collection
**File:** `Backend/models/User.js`

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John Doe",
  email: "john@example.com",
  password: "$2b$10$hashed_password_here", // bcrypt hashed
  role: "student", // or "teacher"
  createdAt: ISODate("2025-12-01T10:00:00Z")
}
```

**Fields Explained:**
- `_id`: Unique identifier (auto-generated by MongoDB)
- `name`: User's full name
- `email`: Login credential (must be unique)
- `password`: Hashed with bcrypt (never store plain text!)
- `role`: Either "student" or "teacher" (determines permissions)
- `createdAt`: Account creation timestamp

### 2. QuizEvents Collection
**File:** `Backend/models/QuizEvent.js`

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439013"),
  title: "Physics Midterm",
  description: "Covers chapters 1-5",
  teacher: ObjectId("507f1f77bcf86cd799439011"), // references User._id
  questions: [
    {
      _id: ObjectId("507f1f77bcf86cd799439014"),
      questionText: "What is Newton's First Law?",
      correctAnswerText: "An object at rest stays at rest unless acted upon by an external force",
      points: 10
    },
    {
      _id: ObjectId("507f1f77bcf86cd799439015"),
      questionText: "Define velocity",
      correctAnswerText: "Velocity is the rate of change of displacement with respect to time",
      points: 10
    }
  ],
  startDate: ISODate("2025-12-02T09:00:00Z"),
  endDate: ISODate("2025-12-02T11:00:00Z"),
  isActive: true, // computed: current time between start and end
  createdAt: ISODate("2025-12-01T10:00:00Z")
}
```

**Fields Explained:**
- `title`: Quiz name
- `description`: What the quiz covers
- `teacher`: Reference to teacher who created it
- `questions`: Array of question objects (embedded)
- `startDate`: When quiz becomes available
- `endDate`: When quiz closes
- `isActive`: Virtual field (calculated based on current time)

**Why QuizEvent vs Quiz:**
- `Quiz` model: Template (just questions, no dates)
- `QuizEvent` model: Scheduled instance (questions + dates)
- Allows teachers to reuse same quiz for multiple classes/dates

### 3. QuizAttempts Collection
**File:** `Backend/models/QuizAttempt.js`

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439016"),
  student: ObjectId("507f1f77bcf86cd799439011"), // references User._id
  quizEvent: ObjectId("507f1f77bcf86cd799439013"), // references QuizEvent._id
  answers: [
    {
      question: ObjectId("507f1f77bcf86cd799439014"),
      studentAnswer: "Objects stay still unless pushed",
      correctAnswer: "An object at rest stays at rest unless acted upon by an external force",
      isCorrect: true,
      pointsEarned: 8.5,
      percentageEarned: 0.85,
      maxPoints: 10,
      similarityScore: 0.85,
      explanation: "The answer correctly captures the essence of Newton's First Law"
    },
    {
      question: ObjectId("507f1f77bcf86cd799439015"),
      studentAnswer: "Speed with direction",
      correctAnswer: "Velocity is the rate of change of displacement with respect to time",
      isCorrect: true,
      pointsEarned: 7.2,
      percentageEarned: 0.72,
      maxPoints: 10,
      similarityScore: 0.72,
      explanation: "Correctly identifies velocity as directional, though not as precise as the formal definition"
    }
  ],
  score: 15.7, // sum of pointsEarned
  totalPoints: 20, // sum of maxPoints
  percentage: 78.5, // (score / totalPoints) × 100
  startedAt: ISODate("2025-12-02T09:15:00Z"),
  submittedAt: ISODate("2025-12-02T09:45:00Z"),
  timeTaken: 1800 // seconds (30 minutes)
}
```

**Fields Explained:**
- `student`: Who took the quiz
- `quizEvent`: Which quiz was taken
- `answers`: Array of graded answers
  - Each answer includes AI's similarity score and explanation
- `score`: Total points earned
- `totalPoints`: Maximum possible points
- `percentage`: Final grade percentage
- `startedAt`: When student started quiz
- `submittedAt`: When student submitted
- `timeTaken`: Duration in seconds

---

## File-by-File Breakdown

### Backend Files

#### `server.js`
**Purpose:** Entry point that starts the Express server

**What it does:**
1. Loads environment variables (`.env` file)
2. Connects to MongoDB Atlas
3. Sets up middleware (CORS, JSON parsing)
4. Mounts route handlers
5. Starts server on port 5000

**Key Code:**
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors()); // Allow frontend to make requests
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/quiz-attempt', require('./routes/quizAttempt'));
app.use('/api/questions', require('./routes/questions'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Start server
app.listen(5000, () => console.log('Server running on port 5000'));
```

---

#### `controllers/authController.js`
**Purpose:** Handle user authentication (signup, login, verify)

**Functions:**
- `signup(req, res)`: Create new user account
  - Validates email doesn't exist
  - Hashes password with bcrypt
  - Saves to database
  - Returns JWT token

- `login(req, res)`: Authenticate existing user
  - Finds user by email
  - Compares password with bcrypt
  - Returns JWT token

- `verify(req, res)`: Verify JWT token is valid
  - Returns user info (already verified by authMiddleware)

---

#### `controllers/gradeController.js`
**Purpose:** Communicate with Google Gemini AI for answer grading

**Main Function: `gradeAnswerWithAI()`**

**Parameters:**
- `questionText`: The quiz question
- `studentAnswer`: What the student wrote
- `correctAnswer`: The expected answer
- `threshold`: Minimum score to mark correct (0.70)

**Process:**
1. Constructs detailed prompt for Gemini
2. Sends HTTP request to Gemini REST API
3. Parses JSON response
4. Returns `{ similarityScore, explanation }`

**API Endpoint Used:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

**Why Gemini:**
- Excellent at semantic understanding
- Fast response times
- Accurate similarity assessment
- Free tier available

---

#### `controllers/quizAttemptController.js`
**Purpose:** Handle quiz submissions and grading

**Main Function: `submitQuizAttempt()`**

**What it does:**
1. Receives quiz answers from frontend
2. Fetches quiz questions from database
3. For each answer:
   - Calls `gradeAnswerWithAI()`
   - Gets similarity score from Gemini
   - Calculates points: `maxPoints × similarityScore`
   - Marks correct if similarity >= 0.70
4. Saves QuizAttempt to database
5. Returns graded results to frontend

**Grading Logic:**
```javascript
// For each question
const gradeResult = await gradeAnswerWithAI(
  question.questionText,
  studentAnswer,
  question.correctAnswerText,
  0.70 // threshold
);

// Use Gemini's score directly (no manipulation)
const percentageEarned = gradeResult.similarityScore;
const isCorrect = percentageEarned >= 0.70;
const pointsEarned = Math.round((maxPoints * percentageEarned) * 100) / 100;

// Save to database
gradedAnswers.push({
  question: question.questionText,
  studentAnswer: studentAnswer,
  correctAnswer: question.correctAnswerText,
  isCorrect: isCorrect,
  pointsEarned: pointsEarned,
  percentageEarned: percentageEarned,
  maxPoints: maxPoints,
  similarityScore: gradeResult.similarityScore,
  explanation: gradeResult.explanation
});
```

---

#### `controllers/quizController.js`
**Purpose:** CRUD operations for quizzes and quiz events

**Functions:**
- `createQuiz()`: Teacher creates new quiz template
- `createQuizEvent()`: Schedule quiz with start/end dates
- `getAllQuizzes()`: Get all quizzes
- `getQuizById()`: Get single quiz details
- `updateQuiz()`: Edit quiz
- `deleteQuiz()`: Remove quiz
- `getActiveQuizzesForStudent()`: Get quizzes student can take now
- `getStudentQuizHistory()`: Get student's past attempts

---

#### `middleware/authMiddleware.js`
**Purpose:** Verify JWT token on protected routes

**How it works:**
```javascript
module.exports = function(req, res, next) {
  // 1. Get token from header
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  
  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Add user to request
    req.user = decoded.user;
    
    // 4. Continue to next middleware/controller
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
```

**Used on routes like:**
```javascript
router.get('/quiz', authMiddleware, quizController.getAllQuizzes);
//                  ↑ runs before controller
```

---

#### `middleware/teacherMiddleware.js`
**Purpose:** Ensure user is a teacher (for admin routes)

**How it works:**
```javascript
module.exports = function(req, res, next) {
  // req.user already set by authMiddleware
  
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ msg: 'Access denied: Teachers only' });
  }
  
  next();
};
```

**Used on routes like:**
```javascript
router.post('/quiz', authMiddleware, teacherMiddleware, quizController.createQuiz);
//                   ↑ auth first      ↑ then check role
```

---

### Frontend Files

#### `main.jsx`
**Purpose:** React entry point - renders the app into HTML

**What it does:**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Explanation:**
- Finds `<div id="root">` in `index.html`
- Renders `<App>` component inside it
- `React.StrictMode`: Enables extra checks in development

---

#### `App.jsx`
**Purpose:** Main component that sets up routing

**What it does:**
```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
// ... other imports

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/quiz/:quizEventId" element={<QuizPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}
```

**How Routing Works:**
- User visits `/login` → shows `<LoginPage />`
- User visits `/dashboard` → shows `<DashboardPage />`
- User visits `/quiz/507f191e810c19729de860ea` → shows `<QuizPage />` with that quiz ID

---

#### `pages/LoginPage.jsx`
**Purpose:** Login form for existing users

**What it does:**
1. Shows email/password form
2. On submit:
   - Sends POST request to `/api/auth/login`
   - Receives JWT token
   - Saves token to localStorage
   - Redirects to dashboard

**Key Code:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });
    
    // Save token
    localStorage.setItem('token', response.data.token);
    
    // Redirect
    navigate('/dashboard');
  } catch (err) {
    setError(err.response?.data?.msg || 'Login failed');
  }
};
```

---

#### `pages/StudentDashboard.jsx`
**Purpose:** Student's main page - view/take quizzes

**What it does:**
1. Fetches active quizzes on load
2. Shows list of available quizzes
3. Shows quiz history (past attempts)
4. Handles quiz selection

**Key Functions:**
- `fetchActiveQuizzes()`: GET `/api/quiz/active/student`
- `fetchQuizHistory()`: GET `/api/quiz/student/history`
- `checkIfAlreadyAttempted()`: GET `/api/quiz-attempt/check/:quizEventId`

**Components Used:**
- `<QuizList>`: Displays available quizzes with "Start" buttons
- `<QuizEventCard>`: Individual quiz card in history

---

#### `pages/TeacherDashboard.jsx`
**Purpose:** Teacher's main page - create/manage quizzes

**What it does:**
1. Shows quiz creation form
2. Displays all created quizzes
3. Allows editing/deleting quizzes
4. Schedule quiz events

**Key Functions:**
- `createQuiz()`: POST `/api/quiz`
- `scheduleQuizEvent()`: POST `/api/quiz/:id/schedule`
- `deleteQuiz()`: DELETE `/api/quiz/:id`

**Components Used:**
- `<QuizEditor>`: Form to create/edit quizzes

---

#### `pages/QuizPage.jsx`
**Purpose:** Quiz-taking interface

**What it does:**
1. Loads quiz questions on mount
2. Tracks start time
3. Shows question/answer form
4. Submits answers to backend
5. Navigates to results page

**Key Code:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await axios.post(
      'http://localhost:5000/api/quiz-attempt/submit',
      {
        quizEventId: id,
        answers: answers, // array of {questionId, studentAnswer}
        startedAt: quizStartTime
      },
      {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      }
    );
    
    // Navigate to results with attempt data
    navigate('/quiz/results', { state: { quizAttempt: response.data.quizAttempt } });
  } catch (err) {
    setError('Failed to submit quiz');
  }
};
```

---

#### `components/quiz/QuizResults.jsx`
**Purpose:** Display graded quiz results

**What it shows:**
1. Total score and percentage
2. Time taken
3. For each question:
   - Student's answer
   - Correct answer
   - Points earned
   - AI explanation

**Design:**
- Clean, professional layout
- Color-coded (green for correct, red for incorrect)
- Clear typography (not all bold)

---

#### `components/quiz/QuizList.jsx`
**Purpose:** Display list of available quizzes for students

**What it does:**
1. Receives quiz array as prop
2. Maps over quizzes to create cards
3. Shows quiz info (title, description, dates)
4. "Start" button for active quizzes
5. Checks if student already attempted

**Key Features:**
- Green gradient "Start" button with play icon
- Active/inactive status display
- Prevents retaking same quiz

---

#### `utils/auth.js`
**Purpose:** Helper functions for JWT token management

**Functions:**
```javascript
// Get token from localStorage
export const getToken = () => localStorage.getItem('token');

// Save token to localStorage
export const setToken = (token) => localStorage.setItem('token', token);

// Remove token (logout)
export const removeToken = () => localStorage.removeItem('token');

// Check if user is logged in
export const isAuthenticated = () => !!getToken();

// Get user info from token (decode JWT)
export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const decoded = jwt_decode(token);
    return decoded.user;
  } catch (err) {
    return null;
  }
};
```

**Used throughout app:**
```javascript
// In QuizPage.jsx
headers: { 'x-auth-token': getToken() }

// In Navbar.jsx
if (isAuthenticated()) {
  // Show dashboard link
} else {
  // Show login link
}
```

---

## How Everything Connects

### Complete User Journey Example

**Scenario:** Student takes a quiz and gets graded

```
┌─────────────────────────────────────────────────────────────┐
│ 1. STUDENT LOGS IN                                          │
└─────────────────────────────────────────────────────────────┘
Frontend: LoginPage.jsx
  ↓ User enters email/password
  ↓ Clicks "Login"
  ↓ POST /api/auth/login

Backend: routes/auth.js → controllers/authController.js
  ↓ Verify password with bcrypt
  ↓ Generate JWT token
  ↓ Response: { token, user }

Frontend: LoginPage.jsx
  ↓ localStorage.setItem('token', token)
  ↓ navigate('/dashboard')

┌─────────────────────────────────────────────────────────────┐
│ 2. VIEW AVAILABLE QUIZZES                                   │
└─────────────────────────────────────────────────────────────┘
Frontend: StudentDashboard.jsx
  ↓ useEffect runs on mount
  ↓ GET /api/quiz/active/student (with token in header)

Backend: routes/quiz.js → middleware/authMiddleware.js
  ↓ Verify JWT token
  ↓ Add user to req.user
  ↓ controllers/quizController.js (getActiveQuizzesForStudent)
  ↓ Query MongoDB: find quizzes where startDate <= now <= endDate
  ↓ Response: [array of active quizzes]

Frontend: StudentDashboard.jsx
  ↓ Pass quizzes to <QuizList quizzes={quizzes} />

Frontend: QuizList.jsx
  ↓ Map over quizzes
  ↓ Render QuizEventCard for each
  ↓ Show green "Start" button if active

┌─────────────────────────────────────────────────────────────┐
│ 3. START QUIZ                                               │
└─────────────────────────────────────────────────────────────┘
Frontend: QuizList.jsx
  ↓ Student clicks "Start Quiz"
  ↓ navigate('/quiz/' + quizEventId)

Frontend: QuizPage.jsx
  ↓ useEffect runs with quizEventId
  ↓ GET /api/quiz/:quizEventId (with token)

Backend: Similar flow as step 2
  ↓ Return quiz with all questions

Frontend: QuizPage.jsx
  ↓ Display questions
  ↓ Student types answers
  ↓ Track startedAt time

┌─────────────────────────────────────────────────────────────┐
│ 4. SUBMIT QUIZ                                              │
└─────────────────────────────────────────────────────────────┘
Frontend: QuizPage.jsx (handleSubmit)
  ↓ Collect all answers from state
  ↓ POST /api/quiz-attempt/submit
  ↓ Body: { quizEventId, answers, startedAt }
  ↓ Header: { 'x-auth-token': token }

Backend: routes/quizAttempt.js → middleware/authMiddleware.js
  ↓ Verify token
  ↓ controllers/quizAttemptController.js (submitQuizAttempt)

┌─────────────────────────────────────────────────────────────┐
│ 5. AI GRADING (Backend Processing)                          │
└─────────────────────────────────────────────────────────────┘
Backend: quizAttemptController.js
  ↓ Fetch quiz questions from database
  ↓ For each answer:
      ↓ controllers/gradeController.js (gradeAnswerWithAI)
      ↓ Build Gemini prompt with question, correct answer, student answer
      ↓ POST to Google Gemini API
      ↓ Gemini analyzes semantic similarity
      ↓ Returns: { similarityScore: 0.85, explanation: "..." }
      ↓ Calculate points: maxPoints × similarityScore
      ↓ Mark correct if similarity >= 0.70
  ↓ Sum total score
  ↓ Create QuizAttempt document
  ↓ Save to MongoDB
  ↓ Response: { quizAttempt with gradedAnswers }

┌─────────────────────────────────────────────────────────────┐
│ 6. DISPLAY RESULTS                                          │
└─────────────────────────────────────────────────────────────┘
Frontend: QuizPage.jsx
  ↓ Receive graded response
  ↓ navigate('/quiz/results', { state: { quizAttempt } })

Frontend: QuizResults.jsx
  ↓ Extract quizAttempt from location.state
  ↓ Display:
      - Total score: 85/100 (85%)
      - Time taken: 30 minutes
      - Each question with:
          * Student answer
          * Correct answer
          * Points earned (8.5/10)
          * AI explanation
  ↓ Student sees detailed feedback
```

---

## Development & Deployment

### Local Development Setup

**Prerequisites:**
- Node.js (v16+)
- MongoDB Atlas account
- Google Cloud API key (Gemini)

**Environment Variables:**
```bash
# Backend/.env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/speechify
JWT_SECRET=your_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

**Start Backend:**
```powershell
cd d:\Speechify\Backend
npm install
node server.js
```

**Start Frontend:**
```powershell
cd d:\Speechify\Frontend
npm install
npm run dev
```

**Access Application:**
- Frontend: http://localhost:5174
- Backend API: http://localhost:5000

---

## Key Concepts Summary

### 1. **MVC Pattern (Model-View-Controller)**
- **Model** (MongoDB schemas): Data structure
- **View** (React components): User interface
- **Controller** (Express controllers): Business logic

### 2. **RESTful API**
- **GET**: Retrieve data
- **POST**: Create data
- **PUT**: Update data
- **DELETE**: Remove data

### 3. **JWT Authentication**
- Token-based (no sessions)
- Stateless (server doesn't store sessions)
- Secure (signed with secret key)

### 4. **AI Integration**
- External API (Google Gemini)
- Semantic understanding vs exact matching
- Returns confidence scores (0.0 - 1.0)

### 5. **React Hooks**
- `useState`: Component state
- `useEffect`: Side effects (API calls)
- `useNavigate`: Programmatic navigation

---

## Common Workflows

### Creating a New Quiz (Teacher)
1. Login as teacher
2. Navigate to teacher dashboard
3. Fill quiz form (title, description, questions)
4. POST to `/api/quiz` → saves template
5. Schedule quiz event (set start/end dates)
6. POST to `/api/quiz/:id/schedule` → creates QuizEvent

### Taking a Quiz (Student)
1. Login as student
2. View active quizzes in dashboard
3. Click "Start Quiz"
4. Answer questions
5. Submit → AI grades answers
6. View results with feedback

### How AI Grading Works
1. Student submits answer
2. Backend sends to Gemini API
3. Gemini compares semantic meaning
4. Returns similarity score (0.85 = 85% similar)
5. Calculate points: `10 points × 0.85 = 8.5 points`
6. Mark correct if score >= 0.70 (70%)

---

## Troubleshooting Guide

### Common Issues

**1. Quiz Submission Fails**
- Check API endpoint matches: `/api/quiz-attempt/submit`
- Verify JWT token in localStorage
- Check backend is running on port 5000

**2. AI Grading Not Working**
- Verify `GEMINI_API_KEY` in `.env`
- Check Google Cloud API quota
- Look for errors in backend console

**3. Can't Login**
- Verify MongoDB connection
- Check user exists in database
- Ensure password is correct (bcrypt comparison)

**4. Frontend Not Connecting to Backend**
- Check CORS is enabled in `server.js`
- Verify axios base URL: `http://localhost:5000`
- Ensure both servers are running

---

## Future Enhancements

### Planned Features
1. **Audio Transcription**: Students speak answers, Whisper API transcribes
2. **Real-time Collaboration**: Multiple students take quiz simultaneously
3. **Analytics Dashboard**: Teacher views class performance metrics
4. **Question Bank**: Reusable question library
5. **Adaptive Difficulty**: AI adjusts question difficulty based on performance

---

## Conclusion

This documentation covers:
- ✅ Why each file exists
- ✅ How frontend and backend connect
- ✅ Complete API routing explained
- ✅ Data flow from user action to database
- ✅ AI grading system details
- ✅ Authentication/authorization
- ✅ Database schemas
- ✅ Step-by-step request lifecycles

**Study Tips:**
1. Start with `server.js` to understand server setup
2. Follow one route from frontend to backend
3. Trace a quiz submission through all layers
4. Understand JWT flow for authentication
5. Examine AI grading logic in detail

**Practice Exercises:**
1. Add a new API endpoint (e.g., get quiz statistics)
2. Create a new React page (e.g., profile page)
3. Modify grading threshold and test results
4. Add a new field to QuizAttempt model
5. Implement a new middleware (e.g., rate limiting)

---

**Questions or Need Clarification?**
This document provides a complete overview of the Speechify platform. Each section can be studied independently or as part of understanding the full system architecture.
