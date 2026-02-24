# Backend Database Documentation

## Overview

The Speechify Quiz Application uses **PostgreSQL** as its primary database, managed through **Prisma ORM**. The database follows a streamlined 5-table architecture designed for efficient quiz management, student submissions, and AI-powered evaluation.

---

## Database Architecture

```
┌──────────────┐         ┌──────────────┐
│   TEACHERS   │────────▶│    QUIZZES   │
└──────────────┘  1:N    └──────────────┘
                               │
                               │ 1:N
                               ▼
┌──────────────┐         ┌──────────────────────┐
│   STUDENTS   │────────▶│ STUDENT_SUBMISSIONS  │
└──────────────┘  1:N    └──────────────────────┘
       │                       │
       │                       │
       │                       ▼
       │              ┌────────────────────────┐
       └─────────────▶│ SUBMISSION_EVALUATIONS │
                      └────────────────────────┘
```

---

## Table Descriptions

### 1. Students (`students`)

**Purpose:** Store student identity and academic information for authentication and quiz participation.

#### Schema Definition

| Column      | Type           | Constraints                | Description                          |
|-------------|----------------|----------------------------|--------------------------------------|
| `id`        | `SERIAL`       | `PRIMARY KEY`              | Auto-incrementing unique identifier  |
| `name`      | `VARCHAR(255)` | `NOT NULL`                 | Student's full name                  |
| `email`     | `VARCHAR(255)` | `NOT NULL`, `UNIQUE`       | Student's email (used for login)     |
| `password`  | `VARCHAR(255)` | `NOT NULL`                 | Hashed password (bcrypt)             |
| `roll_no`   | `VARCHAR(50)`  | `NOT NULL`, `UNIQUE`       | Unique roll number identifier        |
| `year`      | `INTEGER`      | `DEFAULT 1`                | Academic year (1-4)                  |
| `branch`    | `VARCHAR(100)` | `NOT NULL`                 | Department/Branch (e.g., CSE, ECE)   |
| `semester`  | `INTEGER`      | `NOT NULL`                 | Current semester                     |
| `created_at`| `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP`| Row creation timestamp               |
| `updated_at`| `TIMESTAMP`    | Auto-updated               | Last modification timestamp          |

#### Indexes

| Index Name              | Column(s) | Purpose                     |
|-------------------------|-----------|----------------------------|
| `idx_students_email`    | `email`   | Fast login lookups          |
| `idx_students_roll_no`  | `roll_no` | Fast student identification |

#### Relationships

- **Has Many:** `student_submissions` (One student can submit many answers)
- **Has Many:** `submission_evaluations` (One student can have many quiz evaluations)

#### Example Record

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@university.edu",
  "password": "$2b$10$...", 
  "roll_no": "CS21B1001",
  "year": 2,
  "branch": "Computer Science",
  "semester": 4,
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-15T10:30:00Z"
}
```

---

### 2. Teachers (`teachers`)

**Purpose:** Store teacher identity information for authentication and quiz creation.

#### Schema Definition

| Column      | Type           | Constraints                | Description                          |
|-------------|----------------|----------------------------|--------------------------------------|
| `id`        | `SERIAL`       | `PRIMARY KEY`              | Auto-incrementing unique identifier  |
| `name`      | `VARCHAR(255)` | `NOT NULL`                 | Teacher's full name                  |
| `email`     | `VARCHAR(255)` | `NOT NULL`, `UNIQUE`       | Teacher's email (used for login)     |
| `password`  | `VARCHAR(255)` | `NOT NULL`                 | Hashed password (bcrypt)             |
| `branch`    | `VARCHAR(100)` | `NOT NULL`                 | Department/Branch                    |
| `created_at`| `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP`| Row creation timestamp               |
| `updated_at`| `TIMESTAMP`    | Auto-updated               | Last modification timestamp          |

#### Indexes

| Index Name              | Column(s) | Purpose                     |
|-------------------------|-----------|----------------------------|
| `idx_teachers_email`    | `email`   | Fast login lookups          |

#### Relationships

- **Has Many:** `quizzes` (One teacher can create many quizzes)

#### Example Record

```json
{
  "id": 1,
  "name": "Dr. Sarah Smith",
  "email": "sarah.smith@university.edu",
  "password": "$2b$10$...",
  "branch": "Computer Science",
  "created_at": "2026-01-10T09:00:00Z",
  "updated_at": "2026-01-10T09:00:00Z"
}
```

---

### 3. Quizzes (`quizzes`)

**Purpose:** Store quiz metadata and all quiz questions as JSON. This is the central table that contains quiz configuration, questions, and correct answers.

#### Schema Definition

| Column           | Type           | Constraints                | Description                              |
|------------------|----------------|----------------------------|------------------------------------------|
| `id`             | `SERIAL`       | `PRIMARY KEY`              | Auto-incrementing unique identifier      |
| `teacher_id`     | `INTEGER`      | `NOT NULL`, `FOREIGN KEY`  | Reference to the creating teacher        |
| `title`          | `VARCHAR(255)` | `NOT NULL`                 | Quiz title                               |
| `subject`        | `VARCHAR(255)` | `NOT NULL`                 | Subject name (e.g., "Computer Networks") |
| `course_code`    | `VARCHAR(50)`  | `NOT NULL`                 | Course code (e.g., "CS301")              |
| `description`    | `TEXT`         | `NULLABLE`                 | Optional quiz description                |
| `questions`      | `JSON`         | `NOT NULL`                 | Array of question objects                |
| `correct_answers`| `JSON`         | `NOT NULL`                 | Array of correct answer objects          |
| `start_time`     | `TIMESTAMP`    | `NOT NULL`                 | Quiz availability start time             |
| `end_time`       | `TIMESTAMP`    | `NOT NULL`                 | Quiz availability end time               |
| `created_at`     | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP`| Row creation timestamp                   |
| `updated_at`     | `TIMESTAMP`    | Auto-updated               | Last modification timestamp              |

#### Indexes

| Index Name                | Column(s)    | Purpose                           |
|---------------------------|--------------|-----------------------------------|
| `idx_quizzes_teacher_id`  | `teacher_id` | Fast teacher quiz lookups         |
| `idx_quizzes_start_time`  | `start_time` | Filter by availability            |
| `idx_quizzes_end_time`    | `end_time`   | Filter by availability            |
| `idx_quizzes_course_code` | `course_code`| Filter by course                  |

#### Relationships

- **Belongs To:** `teachers` (via `teacher_id`)
- **Has Many:** `student_submissions`
- **Has Many:** `submission_evaluations`

#### JSON Structure: `questions`

```json
[
  {
    "id": 1,
    "text": "Explain the OSI Model and its 7 layers.",
    "points": 10,
    "image": {
      "type": "url",
      "value": "https://example.com/images/osi-model.png"
    }
  },
  {
    "id": 2,
    "text": "What is database normalization? Explain 1NF, 2NF, and 3NF.",
    "points": 15,
    "image": null
  },
  {
    "id": 3,
    "text": "Describe the TCP three-way handshake process.",
    "points": 10,
    "image": null
  }
]
```

#### JSON Structure: `correct_answers`

```json
[
  {
    "questionId": 1,
    "answer": "The OSI Model is a conceptual framework with 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application. Each layer has specific responsibilities..."
  },
  {
    "questionId": 2,
    "answer": "Normalization is the process of organizing data to reduce redundancy. 1NF eliminates repeating groups, 2NF removes partial dependencies, 3NF removes transitive dependencies..."
  },
  {
    "questionId": 3,
    "answer": "The TCP three-way handshake involves: 1) SYN - Client sends synchronization request, 2) SYN-ACK - Server acknowledges and sends its own SYN, 3) ACK - Client acknowledges..."
  }
]
```

#### Example Record

```json
{
  "id": 1,
  "teacher_id": 1,
  "title": "Computer Networks Mid-Term Quiz",
  "subject": "Computer Networks",
  "course_code": "CS301",
  "description": "This quiz covers OSI model, TCP/IP, and networking fundamentals.",
  "questions": "[...]",
  "correct_answers": "[...]",
  "start_time": "2026-02-25T10:00:00Z",
  "end_time": "2026-02-25T11:00:00Z",
  "created_at": "2026-02-20T14:00:00Z",
  "updated_at": "2026-02-20T14:00:00Z"
}
```

---

### 4. Student Submissions (`student_submissions`)

**Purpose:** Store what a student submitted for a quiz question. Each row represents one student answering one question from one quiz.

#### Schema Definition

| Column              | Type           | Constraints                | Description                              |
|---------------------|----------------|----------------------------|------------------------------------------|
| `id`                | `SERIAL`       | `PRIMARY KEY`              | Auto-incrementing unique identifier      |
| `student_id`        | `INTEGER`      | `NOT NULL`, `FOREIGN KEY`  | Reference to the submitting student      |
| `quiz_id`           | `INTEGER`      | `NOT NULL`, `FOREIGN KEY`  | Reference to the quiz                    |
| `question_id`       | `INTEGER`      | `NOT NULL`                 | Logical reference to question in JSON    |
| `audio_path`        | `VARCHAR(500)` | `NULLABLE`                 | Path to audio file (.wav, 16kHz)         |
| `transcribed_answer`| `TEXT`         | `NULLABLE`                 | Whisper-transcribed text from audio      |
| `submitted_at`      | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP`| When the answer was submitted            |
| `created_at`        | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP`| Row creation timestamp                   |

#### Indexes

| Index Name                     | Column(s)    | Purpose                           |
|--------------------------------|--------------|-----------------------------------|
| `idx_submissions_student_id`   | `student_id` | Fast student submission lookups   |
| `idx_submissions_quiz_id`      | `quiz_id`    | Fast quiz submission lookups      |
| `idx_submissions_question_id`  | `question_id`| Fast question submission lookups  |

#### Relationships

- **Belongs To:** `students` (via `student_id`)
- **Belongs To:** `quizzes` (via `quiz_id`)

#### Audio Storage Details

| Property    | Value                                          |
|-------------|------------------------------------------------|
| Format      | WAV (Waveform Audio File Format)               |
| Sample Rate | 16 kHz                                         |
| Storage     | File system (`/uploads/audio/`)                |
| Path Format | `/uploads/audio/{student_id}_{quiz_id}_{question_id}_{timestamp}.wav` |

#### Example Record

```json
{
  "id": 1,
  "student_id": 1,
  "quiz_id": 1,
  "question_id": 1,
  "audio_path": "/uploads/audio/1_1_1_1708857600.wav",
  "transcribed_answer": "The OSI Model consists of seven layers. The first layer is the Physical layer which handles raw bit transmission. The second layer is Data Link...",
  "submitted_at": "2026-02-25T10:15:00Z",
  "created_at": "2026-02-25T10:15:00Z"
}
```

---

### 5. Submission Evaluations (`submission_evaluations`)

**Purpose:** Store aggregated evaluation results for a student's entire quiz attempt. This table contains the AI-evaluated scores for all questions in a single quiz attempt.

#### Schema Definition

| Column            | Type           | Constraints                        | Description                              |
|-------------------|----------------|------------------------------------|------------------------------------------|
| `id`              | `SERIAL`       | `PRIMARY KEY`                      | Auto-incrementing unique identifier      |
| `student_id`      | `INTEGER`      | `NOT NULL`, `FOREIGN KEY`          | Reference to the student                 |
| `quiz_id`         | `INTEGER`      | `NOT NULL`, `FOREIGN KEY`          | Reference to the quiz                    |
| `question_results`| `JSON`         | `NOT NULL`                         | Array of per-question evaluation results |
| `total_similarity`| `DECIMAL(5,4)` | `NOT NULL`                         | Average similarity score (0.0000-1.0000) |
| `total_marks`     | `DECIMAL(5,2)` | `NOT NULL`                         | Total marks awarded                      |
| `evaluated_at`    | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP`        | When evaluation was completed            |
| `created_at`      | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP`        | Row creation timestamp                   |

#### Constraints

| Constraint Name                  | Type     | Columns                  | Description                    |
|----------------------------------|----------|--------------------------|--------------------------------|
| `unique_student_quiz_evaluation` | `UNIQUE` | `student_id`, `quiz_id`  | One evaluation per student per quiz |

#### Indexes

| Index Name                    | Column(s)    | Purpose                           |
|-------------------------------|--------------|-----------------------------------|
| `idx_evaluations_student_id`  | `student_id` | Fast student evaluation lookups   |
| `idx_evaluations_quiz_id`     | `quiz_id`    | Fast quiz evaluation lookups      |

#### Relationships

- **Belongs To:** `students` (via `student_id`)
- **Belongs To:** `quizzes` (via `quiz_id`)

#### JSON Structure: `question_results`

```json
[
  {
    "question_id": 1,
    "actual_answer": "The OSI Model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application...",
    "similarity_score": 0.8750,
    "marks_awarded": 8.75
  },
  {
    "question_id": 2,
    "actual_answer": "Normalization organizes database tables to minimize redundancy...",
    "similarity_score": 0.9200,
    "marks_awarded": 13.80
  },
  {
    "question_id": 3,
    "actual_answer": "TCP handshake uses SYN, SYN-ACK, and ACK packets...",
    "similarity_score": 0.8100,
    "marks_awarded": 8.10
  }
]
```

#### Example Record

```json
{
  "id": 1,
  "student_id": 1,
  "quiz_id": 1,
  "question_results": "[...]",
  "total_similarity": 0.8683,
  "total_marks": 30.65,
  "evaluated_at": "2026-02-25T11:05:00Z",
  "created_at": "2026-02-25T11:05:00Z"
}
```

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                DATABASE: speechify                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌─────────────────┐                      ┌─────────────────┐                  │
│   │    TEACHERS     │                      │    STUDENTS     │                  │
│   ├─────────────────┤                      ├─────────────────┤                  │
│   │ PK id           │                      │ PK id           │                  │
│   │    name         │                      │    name         │                  │
│   │    email ◄──────┤                      │    email ◄──────┤                  │
│   │    password     │                      │    password     │                  │
│   │    branch       │                      │    roll_no ◄────┤                  │
│   │    created_at   │                      │    year         │                  │
│   │    updated_at   │                      │    branch       │                  │
│   └────────┬────────┘                      │    semester     │                  │
│            │                               │    created_at   │                  │
│            │ 1:N                           │    updated_at   │                  │
│            │                               └────────┬────────┘                  │
│            ▼                                        │                           │
│   ┌─────────────────────────┐                       │ 1:N                       │
│   │        QUIZZES          │                       │                           │
│   ├─────────────────────────┤                       │                           │
│   │ PK id                   │                       │                           │
│   │ FK teacher_id ──────────┤                       │                           │
│   │    title                │                       │                           │
│   │    subject              │                       │                           │
│   │    course_code          │                       │                           │
│   │    description          │                       │                           │
│   │    questions (JSON) ◄───┤                       │                           │
│   │    correct_answers (JSON)│                      │                           │
│   │    start_time           │                       │                           │
│   │    end_time             │                       │                           │
│   │    created_at           │                       │                           │
│   │    updated_at           │                       │                           │
│   └────────┬────────────────┘                       │                           │
│            │                                        │                           │
│            │ 1:N                                    │                           │
│            ▼                                        ▼                           │
│   ┌────────────────────────────────────────────────────────┐                    │
│   │               STUDENT_SUBMISSIONS                      │                    │
│   ├────────────────────────────────────────────────────────┤                    │
│   │ PK id                                                  │                    │
│   │ FK student_id ─────────────────────────────────────────┤                    │
│   │ FK quiz_id                                             │                    │
│   │    question_id (logical reference to questions JSON)   │                    │
│   │    audio_path (.wav, 16kHz)                            │                    │
│   │    transcribed_answer                                  │                    │
│   │    submitted_at                                        │                    │
│   │    created_at                                          │                    │
│   └────────────────────────────────────────────────────────┘                    │
│                                                                                 │
│   ┌────────────────────────────────────────────────────────┐                    │
│   │             SUBMISSION_EVALUATIONS                     │                    │
│   ├────────────────────────────────────────────────────────┤                    │
│   │ PK id                                                  │                    │
│   │ FK student_id                                          │                    │
│   │ FK quiz_id                                             │                    │
│   │    question_results (JSON)                             │                    │
│   │    total_similarity                                    │                    │
│   │    total_marks                                         │                    │
│   │    evaluated_at                                        │                    │
│   │    created_at                                          │                    │
│   │                                                        │                    │
│   │ UNIQUE(student_id, quiz_id)                            │                    │
│   └────────────────────────────────────────────────────────┘                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### 1. Questions Stored as JSON

**Decision:** Store quiz questions as a JSON array within the `quizzes` table instead of a separate `questions` table.

**Benefits:**
- Simplified queries (single fetch for entire quiz)
- Better performance for quiz retrieval
- Atomic updates to quiz content
- Flexible question schema (can add new fields without migrations)

### 2. Separate Student and Teacher Tables

**Decision:** Use separate `students` and `teachers` tables instead of a single `users` table with roles.

**Benefits:**
- Different fields for each user type (students have roll_no, year, semester)
- Clearer foreign key relationships
- Type-safe code with distinct models
- Easier to extend with role-specific features

### 3. Audio Storage as File Paths

**Decision:** Store audio files on the file system and keep only the path in the database.

**Benefits:**
- Database remains lightweight
- Easier backup and CDN integration
- Better streaming performance
- Simpler audio processing pipeline

### 4. One Evaluation Per Quiz Attempt

**Decision:** Store all question evaluations for a quiz attempt in a single JSON column.

**Benefits:**
- Atomic evaluation storage
- Easy retrieval of complete results
- Reduced join complexity
- Better performance for result display

### 5. Cascade Deletes

**Decision:** All foreign key relationships use `ON DELETE CASCADE`.

**Benefits:**
- Automatic cleanup of related records
- Data integrity maintained
- Simplified deletion logic in application code

---

## Common Database Queries

### Get All Quizzes for a Teacher

```javascript
const quizzes = await prisma.quiz.findMany({
  where: { teacherId: teacherId },
  orderBy: { createdAt: 'desc' }
});
```

### Get Quiz with Questions

```javascript
const quiz = await prisma.quiz.findUnique({
  where: { id: quizId },
  include: { teacher: true }
});
// quiz.questions is the JSON array of questions
```

### Create Student Submission

```javascript
const submission = await prisma.studentSubmission.create({
  data: {
    studentId: studentId,
    quizId: quizId,
    questionId: questionId,
    audioPath: '/uploads/audio/file.wav',
    transcribedAnswer: 'The answer is...'
  }
});
```

### Get Student's Quiz Results

```javascript
const evaluation = await prisma.submissionEvaluation.findUnique({
  where: {
    studentId_quizId: {
      studentId: studentId,
      quizId: quizId
    }
  }
});
```

### Get All Submissions for a Quiz

```javascript
const submissions = await prisma.studentSubmission.findMany({
  where: { quizId: quizId },
  include: { student: true },
  orderBy: { submittedAt: 'desc' }
});
```

### Get Quiz Statistics

```javascript
const stats = await prisma.submissionEvaluation.aggregate({
  where: { quizId: quizId },
  _avg: { totalMarks: true, totalSimilarity: true },
  _max: { totalMarks: true },
  _min: { totalMarks: true },
  _count: true
});
```

---

## Prisma Model Reference

The database is managed via Prisma ORM. The schema file is located at:
```
Backend/prisma/schema.prisma
```

### Running Migrations

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# View database in Prisma Studio
npx prisma studio
```

---

## Database Connection

The PostgreSQL database connection is configured via environment variables:

| Variable       | Description              | Example                                    |
|----------------|--------------------------|------------------------------------------|
| `DATABASE_URL` | Full connection string   | `postgresql://user:pass@localhost:5432/db` |

The connection is established in `Backend/config/prisma.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
module.exports = prisma;
```

---

## Version History

| Version | Date       | Changes                                    |
|---------|------------|------------------------------------------|
| 1.0     | 2026-02-03 | Initial 5-table schema                   |
| 1.1     | 2026-02-04 | Added audio_path column to submissions   |
| 1.2     | 2026-02-24 | Documentation created                    |

---

## Summary

| Table                    | Purpose                           | Key Fields                        |
|--------------------------|-----------------------------------|-----------------------------------|
| `students`               | Student authentication & profile  | email, roll_no, branch, semester  |
| `teachers`               | Teacher authentication & profile  | email, branch                     |
| `quizzes`                | Quiz configuration & questions    | questions (JSON), correct_answers |
| `student_submissions`    | Per-question audio submissions    | audio_path, transcribed_answer    |
| `submission_evaluations` | AI-evaluated quiz results         | question_results (JSON), total_marks |
