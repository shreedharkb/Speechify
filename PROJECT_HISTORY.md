# Speechify - Complete Project Documentation & History

**Last Updated:** February 10, 2026  
**Project Type:** AI-Powered Quiz Platform  
**Status:** ✅ Fully Functional

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [What Problem Does This Solve?](#what-problem-does-this-solve)
3. [Tech Stack](#tech-stack)
4. [System Architecture](#system-architecture)
5. [Complete Feature List](#complete-feature-list)
6. [Database Evolution Timeline](#database-evolution-timeline)
7. [Major Implementations & Migrations](#major-implementations--migrations)
8. [Current Database Schema](#current-database-schema)
9. [API Endpoints Reference](#api-endpoints-reference)
10. [How It Works - Complete Flow](#how-it-works---complete-flow)
11. [Project Structure](#project-structure)
12. [Setup & Running Instructions](#setup--running-instructions)
13. [Key Technical Decisions](#key-technical-decisions)
14. [Testing & Verification](#testing--verification)

---

## 🎯 Project Overview

**Speechify** is an intelligent quiz application designed for educational institutions (colleges/universities) that revolutionizes how quizzes are graded. Instead of requiring exact text matches, it uses **AI-powered semantic similarity** to understand the meaning of student answers.

### Core Innovation
Traditional quiz systems mark answers as wrong if they don't match exactly. Speechify uses **Sentence-BERT (SBERT)** AI models to understand that:
- "Plants use sunlight to make food" 
- "Photosynthesis converts light energy into chemical energy"

...are **semantically equivalent** and should both be marked correct!

---

## ❓ What Problem Does This Solve?

### Traditional Grading Problems:
- ❌ Students get marked wrong for correct answers worded differently
- ❌ Teachers spend hours manually grading open-ended questions
- ❌ No flexibility for creative or alternative answers
- ❌ Multiple Choice Questions (MCQs) are restrictive

### Speechify Solution:
- ✅ **AI understands meaning**, not just exact words
- ✅ **Instant automatic grading** with semantic similarity scoring
- ✅ **Audio transcription** support (students can speak answers)
- ✅ **Flexible answer formats** - students can explain in their own words
- ✅ **Teacher dashboard** for creating and managing quizzes
- ✅ **Student dashboard** for taking quizzes and viewing results
- ✅ **Real-time feedback** with similarity scores

---

## 🛠️ Tech Stack

### **Frontend**
- **React 19** with modern hooks
- **Vite** - Lightning-fast build tool
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **Port:** 5173

### **Backend**
- **Node.js 18+** - JavaScript runtime
- **Express.js 4** - Web framework
- **PostgreSQL 16** - Primary database
- **Prisma** - ORM and migration tool
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Port:** 3001

### **AI Services**
1. **SBERT Service** (Semantic Similarity)
   - Python 3.9 + Flask
   - Model: `sentence-transformers/all-MiniLM-L6-v2`
   - Port: 5002
   - Purpose: Grade answers by semantic similarity

2. **Whisper Service** (Speech-to-Text)
   - Python 3.9 + FastAPI
   - Model: OpenAI Whisper `base`
   - Port: 5000
   - Purpose: Transcribe audio recordings to text

### **DevOps**
- **Docker & Docker Compose** - Containerization
- **PostgreSQL Docker** - Database container
- **Git** - Version control

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Frontend (React + Vite)                    │
│                   Port: 5173                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Teacher   │  │   Student   │  │    Login    │   │
│  │  Dashboard  │  │  Dashboard  │  │  /Register  │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/REST API (JWT Auth)
                        ▼
┌─────────────────────────────────────────────────────────┐
│           Backend (Node.js + Express)                   │
│                   Port: 3001                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │   Auth   │  │   Quiz   │  │  Grade   │  │ Whisper││
│  │   API    │  │   API    │  │   API    │  │  API   ││
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘│
└───────┼────────────┼──────────────┼─────────────┼─────┘
        │            │              │             │
        ▼            ▼              ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌────────────┐ ┌──────────┐
│ PostgreSQL  │ │   SBERT     │ │   Whisper  │ │  File    │
│  Database   │ │  Service    │ │  Service   │ │  Storage │
│  Port: 5432 │ │  Port: 5002 │ │ Port: 5000 │ │ /uploads │
└─────────────┘ └─────────────┘ └────────────┘ └──────────┘
```

---

## ✨ Complete Feature List

### **For Teachers**
1. ✅ **Account Management**
   - Register as teacher
   - Login with JWT authentication
   - Profile with branch/department

2. ✅ **Quiz Creation**
   - Create quizzes with title, subject, course code
   - Add multiple questions with customizable points
   - Add images to questions (upload or URL)
   - Set correct/model answers
   - Schedule quiz (start time & end time)
   - Questions stored as JSON (flexible structure)

3. ✅ **Quiz Management**
   - View all created quizzes
   - Edit quiz details
   - Delete quizzes
   - See quiz statistics

4. ✅ **Grading & Results**
   - Automatic AI-powered grading
   - View all student submissions
   - See similarity scores and marks
   - Student-wise performance reports

### **For Students**
1. ✅ **Account Management**
   - Register with roll number, year, semester, branch
   - Login with JWT authentication
   - Academic profile management

2. ✅ **Taking Quizzes**
   - View available/active quizzes
   - Take quizzes during scheduled time
   - Answer questions (text or audio)
   - Submit quiz for grading

3. ✅ **Audio Recording**
   - Record audio answers
   - Automatic transcription via Whisper AI
   - Audio stored as .wav files (16kHz)

4. ✅ **Results & Feedback**
   - Instant results after submission
   - See similarity scores per question
   - View total marks and percentage
   - Review correct answers
   - Access quiz history

### **AI Features**
1. ✅ **Semantic Similarity Grading**
   - SBERT model compares answer embeddings
   - Cosine similarity score (0-100%)
   - Threshold-based grading (e.g., >85% = pass)

2. ✅ **Speech-to-Text**
   - Whisper AI transcription
   - Supports multiple audio formats
   - High accuracy transcription

---

## 📅 Database Evolution Timeline

### **Phase 1: Initial Setup (Early 2026)**
- Created basic schema with single `users` table
- Legacy `quizzes` and `quiz_questions` tables
- `quiz_events` table for quiz scheduling

### **Phase 2: Legacy Tables Removal (Feb 3, 2026)**
📄 **Migration:** `20260203074356_initial_without_legacy_tables`

**Changes:**
- ❌ Removed `quizzes` (old)
- ❌ Removed `quiz_questions` (old)
- ✅ Kept only active tables
- ✅ Baseline Prisma migration created

**Why:** Cleanup redundant tables, establish clean baseline

---

### **Phase 3: Users Split into Students & Teachers (Feb 3, 2026)**
📄 **Migration:** `20260203080819_replace_users_with_students_and_teachers`  
📄 **Documentation:** `STUDENTS_TEACHERS_MIGRATION.md`

**Changes:**
- ❌ Removed single `users` table with role field
- ✅ Created `students` table with academic fields (roll_no, year, semester, branch)
- ✅ Created `teachers` table with department field
- ✅ Updated foreign keys in quiz_events and quiz_attempts

**Benefits:**
- Better type safety
- Role-specific fields
- Cleaner queries (no role filtering needed)
- Separate concerns

---

### **Phase 4: JSON-Based 5-Table Schema (Feb 4-5, 2026)**
📄 **Migration:** `20260204192950_implement_5_table_json_schema`  
📄 **Documentation:** `JSON_SCHEMA_IMPLEMENTATION.md`

**Major Redesign:** Questions moved from separate table to JSON in quizzes table

**New Structure:**
1. **students** - Student identity
2. **teachers** - Teacher identity
3. **quizzes** - Quiz metadata + questions as JSON
4. **student_submissions** - One row per question answered
5. **submission_evaluations** - Evaluation results

**Design Decisions:**
- ✅ Questions stored as JSONB array in quizzes table
- ✅ No separate questions table (denormalized for speed)
- ✅ Images as URLs only (no binary data)
- ✅ Audio as file paths only

**Benefits:**
- Faster quiz creation
- Simpler schema
- Flexible question structure
- Better for MVP/rapid development

---

### **Phase 5: Simplified Evaluations (Feb 5, 2026)**
📄 **Migration:** `20260205013021_simplify_evaluations_one_per_quiz`  
📄 **Documentation:** `SIMPLIFIED_EVALUATIONS_DESIGN.md`, `SCHEMA_UPDATE_SUMMARY.md`

**Major Change:** One evaluation per student per quiz (not per question)

**Before:**
- One evaluation row per question per student
- Complicated relationships

**After:**
- ONE evaluation row per quiz per student
- Question-level data in `question_results` JSONB
- **Unique constraint:** `(student_id, quiz_id)`

**Benefits:**
- Minimal database rows
- Simple state management
- Easy aggregation
- Direct student-quiz lookup

---

### **Phase 6: Prisma Integration (Early Feb 2026)**
📄 **Documentation:** `PRISMA_INTEGRATION_COMPLETE.md`, `PRISMA_MIGRATION_GUIDE.md`

**Changes:**
- ✅ Installed Prisma and @prisma/client
- ✅ Created `prisma/schema.prisma`
- ✅ Created Prisma model files (*.prisma.js)
- ✅ Backward compatible with legacy models
- ✅ Migration tracking system

**Benefits:**
- Type-safe database queries
- Automatic migration management
- Visual database tool (Prisma Studio)
- Better developer experience

---

### **Phase 7: Quiz Creation with Prisma + Points Field (Feb 7, 2026)**
📄 **Documentation:** `QUIZ_CREATION_IMPLEMENTATION.md`, `POINTS_FIELD_IMPLEMENTATION.md`

**Changes:**
- ✅ Updated quiz controller to use Prisma Quiz model
- ✅ Added `points` field to each question object
- ✅ Auto-calculate `totalPoints` from questions
- ✅ Questions JSON structure: `{id, text, points, image}`
- ✅ Teacher middleware updated for JWT role checking

**Benefits:**
- Flexible point allocation per question
- Better grade calculation
- Teacher has full control over question weights

---

### **Phase 8: Image Upload System (Feb 7, 2026)**
📄 **Documentation:** `IMAGE_UPLOAD_GUIDE.md`, `FRONTEND_IMAGE_UPLOAD_GUIDE.md`

**Changes:**
- ✅ Created `/api/images/upload` endpoint
- ✅ Image storage in `Backend/uploads/images/`
- ✅ Static file serving configured
- ✅ Support multiple image formats (JPG, PNG, GIF, WebP)
- ✅ 5MB max file size
- ✅ Image handling in question JSON

**Image Formats Supported:**
```json
// Format 1: Object (Recommended)
{"type": "url", "value": "https://..."}

// Format 2: String URL
"https://example.com/img.png"

// Format 3: null (no image)
null
```

---

### **Phase 9: Audio Storage Implementation (Ongoing)**
📄 **Documentation:** `AUDIO_STORAGE.md`, `SETUP_AUDIO_STORAGE.md`

**Implementation:** Audio stored as file paths (.wav format, 16kHz)

**Changes:**
- ✅ Audio files stored in file system
- ✅ `audio_path` field in student_submissions
- ✅ `audio_codec` field for format tracking
- ✅ Whisper transcription integration

---

## 🗄️ Current Database Schema

### **5 Core Tables:**

#### 1. **students**
```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    year INTEGER DEFAULT 1,
    branch VARCHAR(100) NOT NULL,
    semester INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose:** Store student identity and academic information  
**Key Fields:** roll_no (unique), year, semester, branch  
**Indexes:** email, roll_no

---

#### 2. **teachers**
```sql
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose:** Store teacher identity  
**Key Fields:** branch  
**Indexes:** email

---

#### 3. **quizzes**
```sql
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    description TEXT,
    questions JSONB NOT NULL,
    correct_answers JSONB NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose:** Store quiz metadata and questions as JSON  
**Key Design:** Questions NOT in separate table

**questions JSON Structure:**
```json
[
  {
    "id": 1,
    "text": "Explain the OSI Model",
    "points": 10,
    "image": {
      "type": "url",
      "value": "https://cdn.example.com/osi.png"
    }
  },
  {
    "id": 2,
    "text": "What is normalization?",
    "points": 15,
    "image": null
  }
]
```

**correct_answers JSON Structure:**
```json
[
  {
    "questionId": 1,
    "answer": "The OSI Model is a 7-layer conceptual framework..."
  },
  {
    "questionId": 2,
    "answer": "Normalization is the process of reducing redundancy..."
  }
]
```

**Indexes:** teacher_id, start_time, end_time, course_code

---

#### 4. **student_submissions**
```sql
CREATE TABLE student_submissions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL,  -- Logical ID from questions JSON
    audio_path VARCHAR(500),        -- Path to .wav file (16kHz)
    transcribed_answer TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose:** Store what a student submitted for each question  
**Key Design:** One row = one student answering one question  
**Audio Format:** .wav files at 16kHz frequency

**Indexes:** student_id, quiz_id, question_id

---

#### 5. **submission_evaluations**
```sql
CREATE TABLE submission_evaluations (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    question_results JSONB NOT NULL,
    total_similarity DECIMAL(5,4) NOT NULL,
    total_marks DECIMAL(5,2) NOT NULL,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, quiz_id)
);
```

**Purpose:** Store evaluation results (one per student per quiz)  
**Key Design:** ONE evaluation row per quiz submission (not per question)

**question_results JSON Structure:**
```json
[
  {
    "question_id": 1,
    "actual_answer": "Students' transcribed answer...",
    "similarity_score": 0.8750,
    "marks_awarded": 8.75
  },
  {
    "question_id": 2,
    "actual_answer": "Another answer...",
    "similarity_score": 0.9200,
    "marks_awarded": 13.80
  }
]
```

**Constraint:** UNIQUE (student_id, quiz_id)  
**Indexes:** student_id, quiz_id

---

## 🔌 API Endpoints Reference

### **Authentication Endpoints**
```
POST   /api/auth/register      Register new student/teacher
POST   /api/auth/login         Login and get JWT token
GET    /api/auth/verify        Verify JWT token validity
```

**Register Body:**
```json
{
  "name": "John Doe",
  "email": "john@college.edu",
  "password": "password123",
  "role": "student",           // or "teacher"
  "rollNo": "CS2024001",       // students only
  "year": 2,                   // students only
  "semester": 4,               // students only
  "branch": "Computer Science"
}
```

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@college.edu",
    "role": "student"
  }
}
```

---

### **Quiz Endpoints (Teachers)**
```
POST   /api/quiz/create           Create new quiz
GET    /api/quiz                  Get all quizzes
GET    /api/quiz/teacher/quizzes  Get teacher's quizzes
GET    /api/quiz/:id              Get quiz by ID
PUT    /api/quiz/:id              Update quiz
DELETE /api/quiz/:id              Delete quiz
```

**Create Quiz Body:**
```json
{
  "title": "Operating Systems Quiz",
  "subject": "Computer Science",
  "courseCode": "CS458",
  "description": "Quiz on OS concepts",
  "questions": [
    {
      "id": 1,
      "text": "Explain process vs thread",
      "points": 10,
      "image": null
    },
    {
      "id": 2,
      "text": "What is Round-Robin scheduling?",
      "points": 15,
      "image": {
        "type": "url",
        "value": "/uploads/images/rr-diagram.png"
      }
    }
  ],
  "correctAnswers": [
    {
      "questionId": 1,
      "answer": "A process is an independent program with its own memory..."
    },
    {
      "questionId": 2,
      "answer": "Round-Robin scheduling assigns equal time quantum..."
    }
  ],
  "startTime": "2026-02-15T10:00:00Z",
  "endTime": "2026-02-15T12:00:00Z"
}
```

---

### **Quiz Taking Endpoints (Students)**
```
GET    /api/quiz/active/student       Get active quizzes for student
POST   /api/quiz-attempt/start        Start quiz attempt
POST   /api/quiz-attempt/submit       Submit quiz answers
GET    /api/quiz-attempt/:id/results  Get quiz results
GET    /api/quiz-attempt/student/:id  Get student's attempts
```

**Submit Quiz Body:**
```json
{
  "quizId": 5,
  "answers": [
    {
      "questionId": 1,
      "transcribedAnswer": "A process has its own memory space...",
      "audioPath": "/uploads/audio/student1_q1.wav"
    },
    {
      "questionId": 2,
      "transcribedAnswer": "Round-Robin uses time slicing...",
      "audioPath": "/uploads/audio/student1_q2.wav"
    }
  ]
}
```

---

### **Grading Endpoints**
```
POST   /api/grade                 Grade single answer (SBERT)
POST   /api/grade/quiz            Grade entire quiz submission
```

**Grade Request:**
```json
{
  "studentAnswer": "Plants convert light energy into chemical energy",
  "correctAnswer": "Photosynthesis is the process of converting sunlight into energy",
  "questionId": 1
}
```

**Grade Response:**
```json
{
  "similarity": 0.8750,
  "marks": 8.75,
  "maxMarks": 10,
  "percentage": 87.5,
  "status": "good_match"
}
```

---

### **Image Upload Endpoints**
```
POST   /api/images/upload              Upload single image
POST   /api/images/upload-multiple     Upload multiple images
DELETE /api/images/:filename           Delete image
GET    /uploads/images/:filename       Serve image file
```

**Upload Response:**
```json
{
  "success": true,
  "image": {
    "filename": "image-1707562000000-abc123.png",
    "url": "/uploads/images/image-1707562000000-abc123.png",
    "size": 245678
  }
}
```

---

### **Whisper Transcription Endpoints**
```
POST   /api/whisper/transcribe    Transcribe audio to text
```

**Transcribe Request:** Multipart form with audio file

**Transcribe Response:**
```json
{
  "success": true,
  "transcription": "This is the transcribed text from audio",
  "language": "en",
  "duration": 15.5
}
```

---

## 🔄 How It Works - Complete Flow

### **Teacher Workflow**

1. **Registration & Login**
   - Teacher registers with email, password, branch
   - System creates entry in `teachers` table
   - Receives JWT token for authentication

2. **Create Quiz**
   - Teacher navigates to "Create Quiz" page
   - Fills in: Title, Subject, Course Code, Description
   - Adds questions with:
     - Question text
     - Points
     - Optional image (upload or URL)
   - Sets correct/model answers for each question
   - Schedules quiz (start and end time)
   - Submits to `POST /api/quiz/create`

3. **Backend Processing**
   - Validates teacher authentication (JWT)
   - Validates all fields
   - Handles image format conversion
   - Calculates total points
   - Stores quiz in `quizzes` table with questions as JSONB
   - Returns quiz ID and confirmation

4. **Monitor Submissions**
   - Teacher can view all submissions
   - See real-time grading results
   - Export results as reports

---

### **Student Workflow**

1. **Registration & Login**
   - Student registers with roll number, year, semester, branch
   - System creates entry in `students` table
   - Receives JWT token

2. **View Available Quizzes**
   - Student sees quizzes that are currently active (between start and end time)
   - Can see quiz details, question count, total points

3. **Take Quiz**
   - Student clicks "Start Quiz"
   - System validates quiz is active
   - Questions displayed one by one or all at once

4. **Answer Questions**
   - **Text Answer:** Student types answer
   - **Audio Answer:** 
     - Student clicks record button
     - Records audio (WebM/WAV format)
     - Audio saved as .wav file at 16kHz
     - Automatic transcription via Whisper AI

5. **Submit Quiz**
   - Student submits all answers
   - Creates rows in `student_submissions` (one per question)
   - Triggers automatic grading

---

### **AI Grading Workflow**

1. **Receive Submission**
   - Backend receives student answers
   - For each question:
     - Extracts student answer (transcribed text)
     - Extracts correct answer from quiz
     - Sends to SBERT service

2. **SBERT Processing**
   - **Step 1:** Convert both answers to 768-dimensional embeddings
     - Student answer → Vector A
     - Correct answer → Vector B
   - **Step 2:** Calculate cosine similarity between vectors
     - Score: 0.0 (completely different) to 1.0 (identical)
   - **Step 3:** Convert to percentage (0-100%)

3. **Calculate Marks**
   ```javascript
   marks_awarded = similarity_score * question_points
   // Example: 0.875 * 10 = 8.75 marks
   ```

4. **Aggregate Results**
   - Collect all question evaluations
   - Calculate total similarity (average)
   - Calculate total marks (sum)
   - Create ONE row in `submission_evaluations`

5. **Store Evaluation**
   ```json
   {
     "student_id": 1,
     "quiz_id": 5,
     "question_results": [
       {"question_id": 1, "similarity_score": 0.875, "marks_awarded": 8.75},
       {"question_id": 2, "similarity_score": 0.920, "marks_awarded": 13.80}
     ],
     "total_similarity": 0.8975,
     "total_marks": 22.55
   }
   ```

6. **Return Results**
   - Student sees:
     - Score per question
     - Similarity percentage
     - Total marks
     - Percentage score
     - Correct answers for review

---

### **Grading Thresholds**
```
95-100% = Excellent match (nearly perfect understanding)
90-95%  = Very strong match (minor wording differences)
85-90%  = Good match (acceptable understanding)
75-85%  = Moderate match (partial understanding)
Below 75% = Needs improvement
```

---

## 📁 Project Structure

```
Speechify/
├── README.md                          # Main project documentation
├── PROJECT_HISTORY.md                 # This file
├── docker-compose.yml                 # Docker services configuration
├── package.json                       # Root dependencies
│
├── Backend/                           # Node.js Backend
│   ├── server.js                      # Express server entry point
│   ├── package.json                   # Backend dependencies
│   ├── .env                           # Environment variables
│   │
│   ├── config/                        # Configuration
│   │   ├── db.js                      # PostgreSQL connection (legacy)
│   │   └── prisma.js                  # Prisma client singleton
│   │
│   ├── prisma/                        # Prisma ORM
│   │   ├── schema.prisma              # Database schema definition
│   │   └── migrations/                # Migration history
│   │       ├── 20260203074356_initial_without_legacy_tables/
│   │       ├── 20260203080819_replace_users_with_students_and_teachers/
│   │       ├── 20260204192950_implement_5_table_json_schema/
│   │       └── 20260205013021_simplify_evaluations_one_per_quiz/
│   │
│   ├── models/                        # Prisma models (Database layer)
│   │   ├── index.js                   # Central model exports
│   │   ├── Student.prisma.js          # Student operations
│   │   ├── Teacher.prisma.js          # Teacher operations
│   │   ├── Quiz.prisma.js             # Quiz operations
│   │   ├── StudentSubmission.prisma.js # Submission operations
│   │   └── SubmissionEvaluation.prisma.js # Evaluation operations
│   │
│   ├── controllers/                   # Business logic
│   │   ├── authController.js          # Registration & login
│   │   ├── quizController.js          # Quiz CRUD operations
│   │   ├── quizAttemptController.js   # Quiz taking & submission
│   │   ├── gradeController.js         # Grading logic
│   │   ├── whisperController.js       # Audio transcription
│   │   └── questionController.js      # Question management
│   │
│   ├── routes/                        # API routes
│   │   ├── auth.js                    # Auth endpoints
│   │   ├── quiz.js                    # Quiz endpoints
│   │   ├── quizAttempt.js             # Quiz attempt endpoints
│   │   ├── images.js                  # Image upload endpoints
│   │   ├── questions.js               # Question endpoints
│   │   └── whisper.js                 # Whisper endpoints
│   │
│   ├── middleware/                    # Express middleware
│   │   ├── authMiddleware.js          # JWT verification
│   │   └── teacherMiddleware.js       # Teacher role check
│   │
│   ├── scripts/                       # Utility scripts
│   │   ├── test-quiz-creation.js      # Test quiz creation
│   │   ├── check-quiz-points.js       # Verify points field
│   │   ├── add-points-to-questions.js # Migration script
│   │   └── test-image-upload.js       # Test image uploads
│   │
│   ├── uploads/                       # File storage
│   │   └── images/                    # Uploaded images
│   │
│   └── Documentation/                 # Detailed docs
│       ├── PRISMA_INTEGRATION_COMPLETE.md
│       ├── STUDENTS_TEACHERS_MIGRATION.md
│       ├── JSON_SCHEMA_IMPLEMENTATION.md
│       ├── SIMPLIFIED_EVALUATIONS_DESIGN.md
│       ├── QUIZ_CREATION_IMPLEMENTATION.md
│       ├── POINTS_FIELD_IMPLEMENTATION.md
│       ├── IMAGE_UPLOAD_GUIDE.md
│       ├── AUDIO_STORAGE.md
│       └── LEGACY_TABLES_REMOVED.md
│
├── Frontend/                          # React Frontend
│   ├── index.html                     # HTML entry point
│   ├── package.json                   # Frontend dependencies
│   ├── vite.config.js                 # Vite configuration
│   │
│   └── src/                           # React source code
│       ├── App.jsx                    # Main app component
│       ├── main.jsx                   # React entry point
│       ├── components/                # React components
│       ├── pages/                     # Page components
│       └── utils/                     # Utilities
│
├── sbert-service/                     # SBERT AI Service
│   ├── Dockerfile                     # Docker configuration
│   ├── app.py                         # Flask application
│   ├── requirements.txt               # Python dependencies
│   ├── test_service.py                # Service tests
│   └── check_requirements.py          # Dependency check
│
├── whisper-service/                   # Whisper AI Service
│   ├── Dockerfile                     # Docker configuration
│   ├── app.py                         # FastAPI application
│   └── requirements.txt               # Python dependencies
│
└── sounds/                            # Audio files directory
```

---

## 🚀 Setup & Running Instructions

### **Prerequisites**
- **Node.js 18+** and npm
- **Docker & Docker Compose**
- **Python 3.9+** (optional, for manual AI service setup)
- **PostgreSQL 16** (can use Docker)

### **Step 1: Clone Repository**
```bash
git clone https://github.com/yourusername/speechify.git
cd speechify
```

### **Step 2: Start Docker Services**
```bash
# Start PostgreSQL, SBERT, and Whisper services
docker-compose up -d

# Verify services are running
docker ps
```

**Expected containers:**
- `quiz-postgres-db` (Port 5432)
- `sbert-grading` (Port 5002)
- `whisper-transcription` (Port 5000)

### **Step 3: Setup Backend**
```bash
cd Backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
PORT=3001
JWT_SECRET=your_super_secret_key_change_this_in_production
DB_HOST=localhost
DB_PORT=5432
DB_USER=quiz_admin
DB_PASSWORD=quiz_secure_password
DB_NAME=quiz_app
DATABASE_URL=postgresql://quiz_admin:quiz_secure_password@localhost:5432/quiz_app
SBERT_SERVICE_URL=http://localhost:5002
WHISPER_SERVICE_URL=http://localhost:5000
EOL

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Start backend server
npm start
```

**Backend should be running on:** http://localhost:3001

### **Step 4: Setup Frontend**
```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend should be running on:** http://localhost:5173

### **Step 5: Verify Everything Works**

1. **Open browser:** http://localhost:5173
2. **Register as teacher**
3. **Create a quiz**
4. **Register as student**
5. **Take the quiz**
6. **Check results**

### **Optional: Open Prisma Studio**
```bash
cd Backend
npx prisma studio
```
Visual database manager opens at http://localhost:5555

---

## 🎯 Key Technical Decisions

### **1. Why JSON for Questions Instead of Separate Table?**

**Decision:** Store questions as JSONB in quizzes table

**Reasoning:**
- ✅ **Faster Development:** No joins needed to fetch quiz with questions
- ✅ **Atomic Operations:** Quiz + questions created/updated together
- ✅ **Flexibility:** Can add question fields without migrations
- ✅ **Better for MVP:** Simpler schema, faster iteration
- ✅ **Performance:** Single query instead of 1+N queries

**Trade-offs:**
- ❌ Cannot query individual questions directly
- ❌ Cannot reuse questions across quizzes
- **Verdict:** Acceptable for MVP, can normalize later if needed

---

### **2. Why One Evaluation Per Quiz Instead of Per Question?**

**Decision:** Store one evaluation row per student per quiz

**Reasoning:**
- ✅ **Minimal Rows:** 1 row vs potentially 100+ rows
- ✅ **Simple Queries:** Single lookup for quiz results
- ✅ **Clear State:** Easy to check if quiz is graded
- ✅ **Atomic Results:** All questions graded together
- ✅ **UNIQUE Constraint:** Prevents duplicate evaluations

**Trade-offs:**
- ❌ Question details in JSON (not queryable individually)
- **Verdict:** Better for current use case

---

### **3. Why Separate Students and Teachers Tables?**

**Decision:** Split single `users` table with role field into two tables

**Reasoning:**
- ✅ **Type Safety:** Different types in code
- ✅ **Role-Specific Fields:** Students have roll_no, year, semester
- ✅ **Better Relations:** Clear FK relationships
- ✅ **No Role Filtering:** Queries are simpler
- ✅ **Future-Proof:** Easy to add role-specific features

**Trade-offs:**
- ❌ Two registration endpoints needed
- **Verdict:** Worth it for clarity and maintainability

---

### **4. Why Audio as File Paths, Not Binary?**

**Decision:** Store audio file paths, not BYTEA blobs

**Reasoning:**
- ✅ **Database Size:** DB stays small and fast
- ✅ **Backup Speed:** Faster database backups
- ✅ **Scalability:** Can move to S3/CDN easily
- ✅ **Streaming:** Easier to stream large audio files
- ✅ **Standard Format:** .wav at 16kHz for Whisper

**Trade-offs:**
- ❌ File system management needed
- ❌ Separate backup for audio files
- **Verdict:** Industry standard approach

---

### **5. Why Prisma Over Raw SQL?**

**Decision:** Use Prisma ORM alongside raw SQL

**Reasoning:**
- ✅ **Migration Management:** Track schema changes in git
- ✅ **Type Safety:** Auto-completion in IDE
- ✅ **Developer Experience:** Easier to write queries
- ✅ **Prisma Studio:** Visual database tool
- ✅ **Backward Compatible:** Can use both Prisma and raw SQL

**Trade-offs:**
- ❌ Learning curve
- ❌ Extra abstraction layer
- **Verdict:** Benefits outweigh costs

---

## ✅ Testing & Verification

### **Test Scripts Available:**

```bash
# Backend tests
cd Backend

# Test Prisma connection
node test-prisma.js

# Test quiz creation
node scripts/test-quiz-creation.js

# Check quiz points field
node scripts/check-quiz-points.js

# Test image upload
node scripts/test-image-upload.js

# Verify JSON schema
node verify-json-schema.js

# Check quiz dates
node scripts/check-quiz-dates.js
```

### **Manual Testing Checklist:**

#### **Teacher Flow:**
- [ ] Register as teacher
- [ ] Login successfully
- [ ] Create quiz with questions
- [ ] Add images to questions
- [ ] Set points for each question
- [ ] Schedule quiz (start/end time)
- [ ] View created quizzes
- [ ] Edit quiz
- [ ] Delete quiz

#### **Student Flow:**
- [ ] Register as student
- [ ] Login successfully
- [ ] View available quizzes
- [ ] Start quiz
- [ ] Answer questions (text)
- [ ] Record audio answer
- [ ] Submit quiz
- [ ] View results instantly
- [ ] See similarity scores
- [ ] Review correct answers

#### **AI Services:**
- [ ] SBERT grades answers correctly
- [ ] Similarity scores are reasonable
- [ ] Whisper transcribes audio accurately
- [ ] Integration with backend works

#### **Database:**
- [ ] All tables created
- [ ] Foreign keys working
- [ ] Cascade deletes working
- [ ] UNIQUE constraints enforced
- [ ] Indexes improving query speed

---

## 📊 Database Statistics

**Current Schema:**
- **Tables:** 5 (students, teachers, quizzes, student_submissions, submission_evaluations)
- **Migrations:** 4 major migrations applied
- **Foreign Keys:** 6 FK relationships
- **Indexes:** 12+ indexes for performance
- **JSONB Columns:** 3 (questions, correct_answers, question_results)

**Capacity Estimates:**
- 10,000 students
- 100 teachers
- 1,000 quizzes
- 50,000 quiz attempts
- ~1GB database size (without audio files)

---

## 🔮 Future Enhancements (Not Yet Implemented)

### **Planned Features:**
1. **Dashboard Analytics**
   - Student performance graphs
   - Quiz difficulty analysis
   - Class average comparisons

2. **Advanced Grading**
   - Custom similarity thresholds per question
   - Partial credit rules
   - Keyword matching bonus

3. **Question Bank**
   - Reusable question library
   - Tag-based organization
   - Import/export questions

4. **Real-Time Monitoring**
   - Live quiz status dashboard
   - Student progress tracking
   - Anti-cheating measures

5. **Mobile App**
   - React Native app
   - Offline quiz taking
   - Push notifications

6. **Export & Reports**
   - PDF grade reports
   - Excel exports
   - Email notifications

---

## 🤝 Contributing

### **Development Workflow:**
1. Create feature branch
2. Make changes
3. Run tests
4. Create Prisma migration if schema changed
5. Update documentation
6. Submit PR

### **Database Changes:**
```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name your_migration_name
# 3. Update models if needed
# 4. Document in markdown file
```

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👥 Team & Support

**Project Type:** Educational Platform  
**Target Users:** Universities and Colleges  
**Current Status:** MVP Complete ✅  

For questions or support, check existing documentation files:
- `PRISMA_MIGRATION_GUIDE.md`
- `QUIZ_CREATION_IMPLEMENTATION.md`
- `IMAGE_UPLOAD_GUIDE.md`
- `SIMPLIFIED_EVALUATIONS_DESIGN.md`

---

**Last Updated:** February 10, 2026  
**Version:** 1.0.0  
**Status:** Production Ready 🚀
