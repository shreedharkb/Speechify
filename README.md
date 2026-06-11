# Speechify

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) ![Express](https://img.shields.io/badge/Express.js-404D59?style=flat&logo=express&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white) ![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

AI-powered semantic quiz grading platform. Teachers can create quizzes and students can answer them via text or voice. Instead of traditional exact-string matching, Speechify leverages state-of-the-art NLP (`all-MiniLM-L6-v2` via Sentence-BERT) to grade answers based on contextual meaning and similarity, coupled with OpenAI Whisper for seamless voice transcription.

---

## Table of Contents

- [Features](#features)
- [Architecture & Workflows](#architecture--workflows)
- [Database Schema](#database-schema)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)

---

## Features

### AI Semantic Grading
Evaluates student answer meaning using cosine similarity. Student answers and expected answers are encoded into 768-dimensional semantic vectors using Sentence-BERT and evaluated instantly.

### Real-time Processing & Background Jobs
Instant grading with detailed feedback powered by Redis Queues and WebSockets, ensuring the Node.js main thread remains unblocked during heavy ML workloads.

### Voice Transcription
Built-in speech-to-text capabilities utilizing OpenAI Whisper, allowing students to verbally answer quiz questions for accessibility and speed.

### Role-Based Access
Secure, separated Teacher & Student portals via JWT and Role-Based Access Control (RBAC). Teachers can schedule quizzes with automated start and end times.

---

## Architecture & Workflows

Below is the high-level system architecture of Speechify, showcasing the separation between the React Frontend, Node.js API Gateway, Redis Job Queues, and the Python AI Microservices.

![System Architecture](assets/system_architecture.png)

<details>
<summary><b>View Eraser.io Code: System Architecture</b></summary>

Copy this into Eraser's **Cloud Architecture** template:

```eraser
// Users & Devices
Client Devices [icon: monitor, color: blue] {
  Web Browser [icon: chrome]
  Mobile Device [icon: smartphone]
}

// Security & Edge
Edge Layer [icon: shield, color: grey] {
  Nginx Reverse Proxy [icon: nginx]
  Rate Limiter [icon: activity]
}

// Application Layer
Node.js Core Services [icon: nodejs, color: green] {
  Auth Middleware (JWT) [icon: key]
  Express REST API [icon: code]
  WebSocket Server [icon: radio]
}

// Message Broker
Event Bus [icon: layers, color: red] {
  Redis Message Queue [icon: redis]
}

// Background Processing
Async Workers [icon: server, color: green] {
  BullMQ Job Processor [icon: zap]
}

// AI Infrastructure
Machine Learning Cluster [icon: cpu, color: yellow] {
  SBERT Semantic Engine [icon: pytorch]
  Whisper Audio Engine [icon: openai]
}

// Data Persistence
Database Tier [icon: database, color: blue] {
  Prisma ORM [icon: prisma]
  PostgreSQL Primary [icon: postgresql]
  PostgreSQL Replica [icon: postgresql]
}

// ==================================
// Data Flow & Network Connections
// ==================================

Client Devices > Nginx Reverse Proxy: HTTPS Request
Nginx Reverse Proxy > Rate Limiter: IP Check
Rate Limiter > Auth Middleware (JWT): Validate Token
Auth Middleware (JWT) > Express REST API: Route Request
Auth Middleware (JWT) > WebSocket Server: Establish WSS Connection
Express REST API > Prisma ORM: Query Data
Prisma ORM > PostgreSQL Primary: Write Operations (INSERT/UPDATE)
Prisma ORM > PostgreSQL Replica: Read Operations (SELECT)
Express REST API > Redis Message Queue: Dispatch Grading Job
BullMQ Job Processor < Redis Message Queue: Consume Jobs
BullMQ Job Processor > Prisma ORM: Save Grading Results
Express REST API > Whisper Audio Engine: Sync Speech-to-Text
BullMQ Job Processor > SBERT Semantic Engine: Async Batch Grading
Express REST API > SBERT Semantic Engine: Instant Live Grading
```
</details>

<details>
<summary><b>View Eraser.io Code: Voice Grading Sequence Diagram</b></summary>

Copy this into Eraser's **Sequence Diagram** template to see exactly how audio answers are processed:

```eraser
title Student Voice Answer & Grading Flow

Student -> React Frontend: 1. Record Audio & Submit
React Frontend -> Express API: 2. POST /api/whisper/transcribe
Express API -> Whisper Service: 3. Forward Audio Blob
Whisper Service -> Express API: 4. Return Transcribed Text
React Frontend -> Express API: 5. POST /api/quiz-attempt/submit
Express API -> Redis Queue: 6. Enqueue Grading Job
Express API --> React Frontend: 7. Return 202 "Processing"
Redis Queue -> Background Worker: 8. Dequeue Job
Background Worker -> SBERT Service: 9. Compare Answers (Vector Math)
SBERT Service -> Background Worker: 10. Return Similarity Score
Background Worker -> PostgreSQL DB: 11. Save Final Score
Background Worker -> WebSocket Server: 12. Emit "Grading Complete" Event
WebSocket Server --> React Frontend: 13. Push Real-time Update
React Frontend --> Student: 14. Display Score & Explanation
```
</details>

<details>
<summary><b>View Eraser.io Code: Teacher Journey Flow Chart</b></summary>

Copy this into Eraser's **Flow Chart** template:

```eraser
Start [shape: oval, icon: user, color: blue]
Valid Login? [shape: diamond, color: yellow]
Teacher Dashboard [shape: rectangle, icon: monitor]
Create Quiz Event [shape: rectangle, icon: calendar]
Add Questions & Expected Answers [shape: rectangle, icon: list]
Publish to Database [shape: cylinder, icon: postgresql, color: blue]
Quiz Becomes Active [shape: rectangle, icon: check-circle, color: green]
Reject Access [shape: oval, icon: x-circle, color: red]

Start > Valid Login?: Authenticate via JWT
Valid Login? > Teacher Dashboard: Yes
Valid Login? > Reject Access: No (Invalid Token)
Teacher Dashboard > Create Quiz Event: Click "New Quiz"
Create Quiz Event > Add Questions & Expected Answers: Input details
Add Questions & Expected Answers > Publish to Database: Save via Prisma
Publish to Database > Quiz Becomes Active: Timer triggers Start Time
```
</details>

---

## Database Schema

The database uses PostgreSQL managed via Prisma ORM. It tracks users, quiz events, individual questions, and student attempts with granular grading metrics.

![Database Schema](assets/database_schema.png)

<details>
<summary><b>View Eraser.io Code: Entity Relationship Diagram (ERD)</b></summary>

Copy this into Eraser's **Entity Relationship** template:

```eraser
Users {
  id UUID PK
  email VARCHAR
  password_hash VARCHAR
  role ENUM // teacher, student
  created_at TIMESTAMP
}

Quiz_Events {
  id UUID PK
  teacher_id UUID FK
  title VARCHAR
  subject VARCHAR
  start_time TIMESTAMP
  end_time TIMESTAMP
}

Questions {
  id UUID PK
  quiz_id UUID FK
  question_text TEXT
  correct_answer_text TEXT
  points INT
}

Quiz_Attempts {
  id UUID PK
  student_id UUID FK
  quiz_id UUID FK
  started_at TIMESTAMP
  completed_at TIMESTAMP
  total_score FLOAT
}

Attempt_Answers {
  id UUID PK
  attempt_id UUID FK
  question_id UUID FK
  student_answer_text TEXT
  similarity_score FLOAT
  is_correct BOOLEAN
  points_earned FLOAT
  explanation TEXT
}

Users.id < Quiz_Events.teacher_id
Quiz_Events.id < Questions.quiz_id
Users.id < Quiz_Attempts.student_id
Quiz_Events.id < Quiz_Attempts.quiz_id
Quiz_Attempts.id < Attempt_Answers.attempt_id
Questions.id < Attempt_Answers.question_id
```
</details>

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 19, Vite, Axios, React Router | Modern SPA workflow |
| Backend | Node.js 18+, Express.js, JWT | Handles routing, RBAC, and rate limiting |
| AI / Grading | Sentence-BERT (`all-MiniLM-L6-v2`) | Python Flask app using PyTorch |
| AI / Audio | OpenAI Whisper | Python FastAPI app for speech-to-text |
| Database | PostgreSQL 16, Prisma ORM | Relational storage for quizzes and users |
| Cache & Queue | Redis | Async task processing for background grading |
| DevOps & CI | Docker, Jenkins, GitHub Actions | Full containerization orchestration |

---

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Python 3.9+ (if running AI services bare-metal)

### Running Locally with Docker

```bash
git clone https://github.com/shreedharkb/Speechify.git
cd Speechify

# Start PostgreSQL, Redis, SBERT, and Whisper services
docker-compose up -d
```

### Backend Setup

```bash
cd Backend
npm install
# Configure your .env file
npx prisma migrate dev
npm run dev
```

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

Application is accessible at `http://localhost:5173`.

---

## Project Structure

```text
Speechify/
├── Frontend/              # React 19 application (Vite)
├── Backend/               # Express.js API & Prisma ORM
│   ├── config/            # Database and queue configurations
│   ├── controllers/       # Business logic (Quizzes, Attempts)
│   ├── routes/            # Express routers
│   └── prisma/            # Prisma schema and migrations
├── sbert-service/         # Flask ML app for Sentence-BERT grading
├── whisper-service/       # FastAPI ML app for transcription
├── Jenkinsfile            # Jenkins CI/CD pipeline definition
├── docker-compose.yml     # Local orchestration for dependencies
└── README.md              # Project documentation
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Backend API port. Defaults to `3001` |
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `DB_HOST` | Yes | PostgreSQL host |
| `DB_USER` | Yes | PostgreSQL user |
| `DB_PASSWORD` | Yes | PostgreSQL password |
| `DB_NAME` | Yes | PostgreSQL database name |
| `SBERT_SERVICE_URL` | No | Defaults to `http://localhost:5002` |
| `WHISPER_SERVICE_URL`| No | Defaults to `http://localhost:5000` |

---

## API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login & receive JWT | ❌ |
| `POST` | `/api/quiz` | Create a new quiz | 👨‍🏫 Teacher |
| `GET`  | `/api/quiz/active/student`| Get currently active quizzes | 👩‍🎓 Student |
| `POST` | `/api/quiz-attempt/submit`| Submit answers for AI semantic grading | 👩‍🎓 Student |
| `POST` | `/api/whisper/transcribe` | Convert speech audio to text | ✅ Yes |

---

## Deployment

Speechify utilizes Docker Compose for standard deployment and a `Jenkinsfile` for CI/CD automation.

```bash
# Start all services
docker-compose up -d --build

# View logs for AI grading
docker-compose logs -f sbert-service
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AwesomeFeature`
3. Commit your changes: `git commit -m 'Add AwesomeFeature'`
4. Push to the branch: `git push origin feature/AwesomeFeature`
5. Open a Pull Request

---

## Author

**Shreedhar K B**
*Full Stack Developer | Cloud Enthusiast*
* [GitHub](https://github.com/shreedharkb)
* [Email](mailto:shreedharkb4@gmail.com)

---

## License

MIT
