import React, { useEffect, useState } from 'react';
import QuizList from '../components/quiz/QuizList';

export default function StudentDashboard({ setPage, user }) {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Get user info from props or localStorage
    if (user) {
      setUserName(user.name || 'Student');
    } else {
      try {
        const userString = localStorage.getItem('user');
        if (userString) {
          const storedUser = JSON.parse(userString);
          setUserName(storedUser.name || 'Student');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [user]);

  const handleQuizSelect = async (quizEvent) => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if student has already attempted this quiz
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/quiz-attempt/check/${quizEvent.id || quizEvent._id}`,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.attempted) {
          alert('You have already completed this quiz. You cannot take it again.');
          return;
        }
      }

      // Store the selected quiz event in localStorage for the quiz page to use
      localStorage.setItem('currentQuizEvent', JSON.stringify(quizEvent));
      setPage('quiz');
    } catch (error) {
      console.error('Error checking quiz attempt:', error);
      // Allow them to proceed if check fails
      localStorage.setItem('currentQuizEvent', JSON.stringify(quizEvent));
      setPage('quiz');
    }
  };

  return (
    <div style={{ margin: 0, padding: 0 }}>
      {/* Quiz List Component */}
      <QuizList onQuizSelect={handleQuizSelect} user={user || { name: userName }} setPage={setPage} />
    </div>
  );
}