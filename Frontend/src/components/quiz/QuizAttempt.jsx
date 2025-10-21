import React, { useState, useEffect } from 'react';

// SVG icon for the microphone
const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3" fill="none" stroke="#4f46e5" />
    <line x1="12" y1="14" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
    <path d="M19 10a7 7 0 0 1-14 0" />
  </svg>
);

const QuizAttempt = ({ quiz, onSubmit, onCancel }) => {
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (quiz) {
      // Initialize answers
      const initialAnswers = {};
      quiz.questions.forEach((q, index) => {
        initialAnswers[index] = '';
      });
      setAnswers(initialAnswers);

      // Set up timer
      const endTime = new Date(quiz.endTime).getTime();
      const now = new Date().getTime();
      setTimeRemaining(Math.max(0, endTime - now));
    }
  }, [quiz]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1000));
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0) {
      handleSubmit();
    }
  }, [timeRemaining]);

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const handleSubmit = () => {
    const formattedAnswers = quiz.questions.map((question, index) => ({
      question: question.questionText,
      studentAnswer: answers[index] || '',
      isCorrect: false, // This will be determined by the backend
    }));

    onSubmit(formattedAnswers);
  };

  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!quiz) return <div>Loading quiz...</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="quiz-attempt">
      <div className="quiz-header">
        <div className="quiz-info">
          <h2>{quiz.title}</h2>
          <span className="subject-badge">{quiz.subject}</span>
        </div>
        <div className="timer">Time Remaining: {formatTime(timeRemaining)}</div>
      </div>

      <div className="progress-info">
        <p>Total Questions: {quiz.questions.length}</p>
        <p>Total Points: {quiz.questions.reduce((sum, q) => sum + q.points, 0)}</p>
      </div>

      <div className="question-navigator">
        {quiz.questions.map((_, index) => (
          <button
            key={index}
            className={`nav-button ${currentQuestionIndex === index ? 'active' : ''} ${answers[index] ? 'answered' : ''}`}
            onClick={() => setCurrentQuestionIndex(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="question-container">
        <div className="question-header">
          <h3>Question {currentQuestionIndex + 1} of {quiz.questions.length}</h3>
          <p className="points">Points: {currentQuestion.points}</p>
        </div>
        
        <p className="question-text">{currentQuestion.questionText}</p>

        <div className="answer-section">
          <textarea
            value={answers[currentQuestionIndex] || ''}
            onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
            placeholder="Type your answer here..."
            disabled={recording}
          />
          <div className="input-controls">
            <button
              type="button"
              className={`mic-button ${recording ? 'recording' : ''}`}
              onClick={() => setRecording(!recording)}
            >
              <MicIcon />
              {recording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <span className="recording-status">
              {recording ? 'Recording in progress...' : 'Click microphone to record'}
            </span>
          </div>
        </div>

        <div className="navigation-buttons">
          {currentQuestionIndex > 0 && (
            <button
              className="btn"
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            >
              Previous
            </button>
          )}
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button
              className="btn"
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            >
              Next
            </button>
          ) : (
            <button className="btn submit-btn" onClick={handleSubmit}>
              Submit Quiz
            </button>
          )}
        </div>
      </div>

      <style>{`
        .quiz-attempt {
          padding: 1rem;
          max-width: 800px;
          margin: 0 auto;
        }
        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .timer {
          font-size: 1.25rem;
          font-weight: bold;
          color: #4f46e5;
        }
        .question-navigator {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .nav-button {
          width: 40px;
          height: 40px;
          border: 2px solid #4f46e5;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }
        .nav-button.active {
          background: #4f46e5;
          color: white;
        }
        .nav-button.answered {
          background: #e0e7ff;
        }
        .question-container {
          background: white;
          padding: 2rem;
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .question-text {
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }
        .points {
          color: #6b7280;
          margin-bottom: 1rem;
        }
        .answer-section {
          margin-bottom: 2rem;
        }
        textarea {
          width: 100%;
          min-height: 150px;
          padding: 1rem;
          margin-bottom: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
        }
        .mic-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.25rem;
          background: #4f46e5;
          color: white;
          cursor: pointer;
        }
        .mic-button.recording {
          background: #ef4444;
          animation: pulse 1.5s infinite;
        }
        .navigation-buttons {
          display: flex;
          justify-content: space-between;
        }
        .submit-btn {
          background: #059669;
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default QuizAttempt;