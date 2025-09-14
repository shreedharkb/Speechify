import React, { useState } from 'react';

export default function TeacherDashboard({ setPage }) {
  // State to hold the text for the new question and its answer
  const [questionText, setQuestionText] = useState('');
  const [correctAnswerText, setCorrectAnswerText] = useState('');

  // This function runs when the teacher submits the form
  const handleSubmit = async (event) => {
    event.preventDefault();

    // 1. Get the authentication token from browser's localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in. Please log in as a teacher.');
      setPage('login');
      return;
    }

    try {
      // 2. Make the API call to our protected backend route
      const response = await fetch('http://localhost:5000/api/questions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ** CRUCIAL SECURITY STEP **
          // We include the token in the 'x-auth-token' header.
          // This proves to the backend that we are an authenticated teacher.
          'x-auth-token': token,
        },
        body: JSON.stringify({ questionText, correctAnswerText }),
      });

      if (response.ok) {
        alert('Question created successfully!');
        // Clear the form fields after successful submission
        setQuestionText('');
        setCorrectAnswerText('');
      } else {
        // If the token is invalid or the user is not a teacher,
        // our backend will send an error.
        const errorData = await response.json();
        alert(`Error: ${errorData.msg}`);
      }
    } catch (error) {
      console.error('Failed to create question:', error);
      alert('An error occurred while creating the question.');
    }
  };

  return (
    <div className="page-container">
      <h1 style={{ textAlign: 'center' }}>Teacher Dashboard</h1>
      <h3 style={{ color: '#6b7280' }}>Create a New Question</h3>
      
      <form className="form-container" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="questionText">Question Text</label>
          <textarea
            id="questionText"
            rows="3"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="e.g., What is the capital of France?"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="correctAnswerText">Correct Answer</label>
          <textarea
            id="correctAnswerText"
            rows="3"
            value={correctAnswerText}
            onChange={(e) => setCorrectAnswerText(e.target.value)}
            placeholder="e.g., Paris is the capital of France."
            required
          />
        </div>
        <button type="submit" className="btn">Add Question</button>
      </form>
    </div>
  );
}
