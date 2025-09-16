import React, { useState } from 'react';

export default function DashboardPage({ setPage }) {
  const [questionText, setQuestionText] = useState("");
  const [correctAnswerText, setCorrectAnswerText] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/questions/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ questionText, correctAnswerText })
      });
      if (res.ok) {
        setMessage('Question posted successfully!');
        setQuestionText("");
        setCorrectAnswerText("");
      } else {
        const err = await res.json();
        setMessage(err.msg || 'Error posting question');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  return (
    <div className="page-container">
      <h1>Teacher Dashboard</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Question</label>
          <input
            type="text"
            value={questionText}
            onChange={e => setQuestionText(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Correct Answer</label>
          <input
            type="text"
            value={correctAnswerText}
            onChange={e => setCorrectAnswerText(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn">Post Question</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
