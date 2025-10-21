import React, { useEffect, useState } from 'react';
import QuizEventCard from './QuizEventCard';
import { getAuthToken, clearAuth, handleAuthError } from '../../utils/auth';

const QuizList = ({ onQuizSelect }) => {
  const [quizEvents, setQuizEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const initialFetch = async () => {
      await fetchQuizEvents();
    };
    initialFetch();
  }, []);

  const fetchQuizEvents = async () => {
    if (retryCount >= maxRetries) {
      setError('Session expired. Please log in again.');
      setLoading(false);
      clearAuth(); // This will redirect to login
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        setError('Please log in to view quizzes.');
        setLoading(false);
        clearAuth(); // This will redirect to login
        return;
      }
      
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/quiz`;
      console.log(`Fetching quizzes...`);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Token expired or invalid');
          clearAuth(); // This will redirect to login
          return;
        }
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to fetch quiz events: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Received quiz data:', data);
      
      // Reset retry count on successful fetch
      setRetryCount(0);
      setQuizEvents(data.quizEvents || data);
      setError(null);
    } catch (error) {
      console.error('Error fetching quiz events:', error);
      
      if (error.message && error.message.includes('401')) {
        clearAuth(); // Redirect to login if unauthorized
        return;
      }
      
      setRetryCount(prev => prev + 1);
      console.error('Error fetching quiz events:', error);
      setError('Failed to load available quizzes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleParticipate = (quizEvent) => {
    if (quizEvent.status === 'active') {
      onQuizSelect(quizEvent);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        {retryCount < maxRetries && (
          <div>
            <p className="retry-count">Attempt {retryCount + 1} of {maxRetries}</p>
            <button onClick={fetchQuizEvents} className="retry-button">
              Try Again
            </button>
          </div>
        )}
        {retryCount >= maxRetries && (
          <button onClick={() => window.location.reload()} className="retry-button">
            Refresh Page
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="quiz-list-container">
      <h2 className="quiz-list-title">Available Quizzes</h2>
      
      {quizEvents.length === 0 ? (
        <div className="no-quizzes-message">
          <p>No quizzes available at the moment.</p>
          <p>Check back later for new quizzes!</p>
        </div>
      ) : (
        <div className="quiz-grid">
          {quizEvents.map((quizEvent) => (
            <QuizEventCard
              key={quizEvent._id}
              quizEvent={quizEvent}
              onParticipate={handleParticipate}
            />
          ))}
        </div>
      )}

      <style>{`
        .quiz-list-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .quiz-list-title {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 2rem;
          color: #1f2937;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4f46e5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container {
          text-align: center;
          padding: 2rem;
        }

        .error-message {
          color: #dc2626;
          margin-bottom: 1rem;
        }

        .retry-button {
          background-color: #4f46e5;
          color: white;
          padding: 0.5rem 1.5rem;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .retry-button:hover {
          background-color: #4338ca;
        }

        .no-quizzes-message {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .no-quizzes-message p:first-child {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .quiz-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          padding: 1rem;
        }

        @media (max-width: 768px) {
          .quiz-list-container {
            padding: 1rem;
          }
          
          .quiz-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default QuizList;