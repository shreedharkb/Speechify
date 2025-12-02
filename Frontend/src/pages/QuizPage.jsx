import React, { useState, useRef, useEffect } from 'react';
import QuizAttempt from '../components/quiz/QuizAttempt';
import QuizResults from '../components/quiz/QuizResults';

export default function QuizPage({ setPage }) {
  const [quizEvent, setQuizEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [quizStartTime] = useState(new Date().toISOString()); // Track when quiz started

  useEffect(() => {
    // Get the selected quiz event from localStorage
    try {
      const storedQuizEvent = localStorage.getItem('currentQuizEvent');
      if (storedQuizEvent) {
        const parsedQuiz = JSON.parse(storedQuizEvent);
        console.log('Loaded quiz event:', parsedQuiz);
        setQuizEvent(parsedQuiz);
      } else {
        console.error('No quiz event found in localStorage');
        alert('No quiz selected. Redirecting to dashboard.');
        setPage('dashboard');
      }
    } catch (error) {
      console.error('Error loading quiz event:', error);
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

      console.log('Submitting quiz with answers:', answers);

      // Submit the quiz attempt to the backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quiz-attempt/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          quizEventId: quizEvent._id,
          answers: answers,
          startedAt: quizStartTime // Include when quiz was started
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Quiz submission response:', data);
        
        // Transform the response to match QuizResults component expectations
        const formattedResults = {
          quizTitle: quizEvent.title,
          submittedAt: new Date().toISOString(),
          timeTaken: 'N/A', // Can be calculated if we track start time
          questions: data.answers.map((answer, index) => ({
            questionText: answer.question,
            studentAnswer: answer.studentAnswer,
            correctAnswer: answer.correctAnswer,
            isCorrect: answer.isCorrect,
            pointsEarned: answer.pointsEarned || 0,
            maxPoints: answer.maxPoints || 10,
            points: answer.maxPoints || 10,
            similarityScore: answer.similarityScore || 0,
            feedback: answer.explanation || (answer.isCorrect ? 'Correct!' : 'Incorrect')
          })),
          score: data.score,
          totalPossible: data.totalPossible,
          percentage: data.percentage
        };
        
        setResults(formattedResults);
        setSubmitted(true);
        // Clear the stored quiz event
        localStorage.removeItem('currentQuizEvent');
      } else {
        const errorData = await response.json();
        console.error('Submission error:', errorData);
        alert(`Failed to submit quiz: ${errorData.msg || errorData.error}`);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
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
      <div className="page-container" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Loading quiz...</h2>
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
        <div className="page-container" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>No quiz available</h2>
          <button onClick={() => setPage('dashboard')} className="btn">
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}