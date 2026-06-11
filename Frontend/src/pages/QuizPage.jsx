import React, { useState, useRef, useEffect } from 'react';
import QuizAttempt from '../components/quiz/QuizAttempt';
import QuizResults from '../components/quiz/QuizResults';
import { io } from 'socket.io-client';

export default function QuizPage({ setPage }) {
  const [quizEvent, setQuizEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [quizStartTime] = useState(new Date().toISOString());
  const [isGrading, setIsGrading] = useState(false);
  const [socket, setSocket] = useState(null);

  // Initialize Socket Connection
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const newSocket = io(import.meta.env.VITE_API_URL);
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      newSocket.emit('join', user.id);
    });

    return () => newSocket.close();
  }, []);

  // Listen for Quiz Grading Result
  useEffect(() => {
    if (!socket || !isGrading || !quizEvent) return;
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const quizId = quizEvent.id || quizEvent._id;
    const eventName = `quizGraded:${user.id}:${quizId}`;
    
    console.log(`Listening for socket event: ${eventName}`);

    const handleGraded = (data) => {
      console.log('Received graded data via websocket!', data);
      if (data.status === 'completed') {
        setResults(data.results);
        setSubmitted(true);
        setIsGrading(false);
        localStorage.removeItem('currentQuizEvent');
      } else {
        alert('Grading failed: ' + data.error);
        setIsGrading(false);
      }
    };

    socket.on(eventName, handleGraded);

    return () => {
      socket.off(eventName, handleGraded);
    };
  }, [socket, isGrading, quizEvent]);

  useEffect(() => {
    try {
      const storedQuizEvent = localStorage.getItem('currentQuizEvent');
      if (storedQuizEvent) {
        const parsedQuiz = JSON.parse(storedQuizEvent);
        setQuizEvent(parsedQuiz);
      } else {
        alert('No quiz selected. Redirecting to dashboard.');
        setPage('dashboard');
      }
    } catch (error) {
      alert('Error loading quiz. Redirecting to dashboard.');
      setPage('dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQuizSubmit = async (answers) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to submit the quiz.');
        setPage('login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quiz-attempt/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          quizEventId: quizEvent.id || quizEvent._id,
          answers: answers,
          startedAt: quizStartTime
        })
      });

      if (response.status === 202) {
        const data = await response.json();
        console.log('Quiz queued for grading:', data);
        setIsGrading(true);
      } else if (response.ok) {
        // Fallback for synchronous API if changed back
        const data = await response.json();
        setResults(data.results || data);
        setSubmitted(true);
        localStorage.removeItem('currentQuizEvent');
      } else {
        const errorData = await response.json();
        alert(`Failed to submit quiz: ${errorData.msg || errorData.error}`);
      }
    } catch (error) {
      alert(`An error occurred while submitting the quiz: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCancelQuiz = () => {
    if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
      localStorage.removeItem('currentQuizEvent');
      setPage('dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-[#0f172a] mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-sm text-[#94a3b8] font-medium">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (isGrading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-6" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing your answers...</h2>
          <p className="text-slate-500">
            Our AI is securely transcribing your audio and grading your responses. This will only take a few moments. Please don't close this page.
          </p>
        </div>
      </div>
    );
  }

  if (submitted && results) {
    return <QuizResults results={results} onBackToDashboard={() => setPage('dashboard')} />;
  }

  return (
    <div>
      {quizEvent ? (
        <QuizAttempt 
          quiz={quizEvent} 
          onSubmit={handleQuizSubmit} 
          onCancel={handleCancelQuiz} 
        />
      ) : (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">No quiz available</h2>
            <button
              onClick={() => setPage('dashboard')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0f172a] text-white rounded-full text-sm font-medium hover:bg-[#1e293b] transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}