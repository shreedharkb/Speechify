<div align="center">

# Speechify

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

### 🚀 [Live Demo: Try Speechify Here](https://speechify-psi.vercel.app)

AI-powered semantic quiz grading platform. Teachers can create quizzes and students can answer them via text or voice. Instead of traditional exact-string matching, Speechify leverages state-of-the-art NLP (`all-MiniLM-L6-v2` via Sentence-BERT) to grade answers based on contextual meaning and similarity, coupled with OpenAI Whisper for seamless voice transcription.

</div>

---

## Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Workflows](#workflows)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
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

### Role-Based Access & Authentication
Secure, separated Teacher & Student portals via JWT and Role-Based Access Control (RBAC). Supports traditional email/password login as well as **Google OAuth Authentication** for quick access. Teachers can schedule quizzes with automated start and end times.

---

## System Architecture

Below is the high-level system architecture of Speechify, showcasing the robust separation between the React Frontend, Node.js API Gateway, Redis Job Queues, and the Python AI Microservices.

<div align="center">
  <img src="assets/system-architecture.png" alt="System Architecture" width="100%" loading="lazy">
</div>

---

## Database Schema

The database uses PostgreSQL managed via Prisma ORM. It tracks users, quiz events, individual questions, and student attempts with granular grading metrics.

<div align="center">
  <img src="assets/database_schema.png" alt="Database Schema" width="100%" loading="lazy">
</div>

---

## Workflows

### Voice Submission & Grading
Displays the exact asynchronous flow of capturing voice answers, transcribing them, and calculating semantic similarity in the background.

<div align="center">
  <img src="assets/voice-submission.png" alt="Voice Submission Sequence" width="100%" loading="lazy">
</div>

### Teacher's Journey
Illustrates the logical decision tree and event triggers from the moment a teacher logs in to publishing an active quiz.

<div align="center">
  <img src="assets/teacher-journey.png" alt="Teacher Flowchart" width="100%" loading="lazy">
</div>

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 19, Vite, Axios | Modern SPA workflow |
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
| `GOOGLE_CLIENT_ID` | No | Required for Google Auth (Backend) |
| `VITE_GOOGLE_CLIENT_ID`| No | Required for Google Auth (Frontend) |
| `SBERT_SERVICE_URL` | No | Defaults to `http://localhost:5002` |
| `WHISPER_SERVICE_URL`| No | Defaults to `http://localhost:5000` |

---

## API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login & receive JWT | ❌ |
| `POST` | `/api/auth/google` | Google OAuth Login/Signup | ❌ |
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

## Author

**Shreedhar K B**

---

## License

MIT
