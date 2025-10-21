import React, { useEffect, useState } from 'react';
import QuizList from '../components/quiz/QuizList';

export default function StudentDashboard({ setPage }) {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Get user info from localStorage
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        setUserName(user.name || 'Student');
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, []);

  const handleQuizSelect = (quizEvent) => {
    // Store the selected quiz event in localStorage for the quiz page to use
    localStorage.setItem('currentQuizEvent', JSON.stringify(quizEvent));
    setPage('quiz');
  };

  return (
    <div className="dashboard-container">
      <div className="welcome-header">
        <div className="header-content">
          <h1>Welcome back, {userName}!</h1>
          <p>Here are your available quizzes. Active quizzes can be taken immediately.</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setPage('home')} className="home-button">
            Home
          </button>
        </div>
      </div>

      {/* Quiz List Component */}
      <QuizList onQuizSelect={handleQuizSelect} />

      <style>{`
        .dashboard-container {
          min-height: calc(100vh - 64px);
          background-color: #f3f4f6;
          padding: 2rem 1rem;
        }

        .welcome-header {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
          margin-bottom: 0.5rem;
        }

        .header-content p {
          color: #6b7280;
          margin: 0;
        }

        .home-button {
          padding: 0.5rem 1rem;
          background-color: #4f46e5;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .home-button:hover {
          background-color: #4338ca;
        }

        @media (max-width: 640px) {
          .welcome-header {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .header-content h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}