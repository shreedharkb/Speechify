import React, { useState } from 'react';

export default function DashboardPage({ setPage }) {
  const [quizData, setQuizData] = useState({
    title: '',
    subject: '',
    startTime: '',
    endTime: '',
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    correctAnswer: '',
    points: 1
  });

  const [message, setMessage] = useState("");

  // Function to add a question to the quiz
  const handleAddQuestion = () => {
    if (!currentQuestion.questionText || !currentQuestion.correctAnswer) {
      setMessage('Please fill in both question text and correct answer.');
      return;
    }
    
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));

    // Reset current question form
    setCurrentQuestion({
      questionText: '',
      correctAnswer: '',
      points: 1
    });
    setMessage('Question added to quiz');
  };

  // Function to remove a question from the quiz
  const handleRemoveQuestion = (index) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
    setMessage('Question removed from quiz');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    // Validate quiz data
    if (!quizData.title || !quizData.subject || !quizData.startTime || !quizData.endTime) {
      setMessage('Please fill in all quiz details');
      return;
    }

    if (quizData.questions.length === 0) {
      setMessage('Please add at least one question to the quiz');
      return;
    }

    if (new Date(quizData.startTime) >= new Date(quizData.endTime)) {
      setMessage('End time must be after start time');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/quiz/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(quizData)
      });

      if (res.ok) {
        setMessage('Quiz created successfully!');
        // Reset the form
        setQuizData({
          title: '',
          subject: '',
          startTime: '',
          endTime: '',
          questions: []
        });
      } else {
        const err = await res.json();
        setMessage(err.msg || 'Error creating quiz');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  return (
    <div className="page-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Professional Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '2.5rem',
        color: 'white',
        marginBottom: '2rem',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', margin: 0 }}>Create New Quiz</h1>
        <p style={{ fontSize: '1rem', opacity: 0.9, margin: 0 }}>Design and schedule your quiz with customizable questions</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Quiz Details Section - Professional Design */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: '600', color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
              Quiz Details
            </h2>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="quizTitle" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Quiz Title</label>
              <input
                type="text"
                id="quizTitle"
                value={quizData.title}
                onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter quiz title"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="subject" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Subject</label>
              <input
                type="text"
                id="subject"
                value={quizData.subject}
                onChange={(e) => setQuizData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter subject"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label htmlFor="startTime" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Start Time</label>
                <input
                  type="datetime-local"
                  id="startTime"
                  value={quizData.startTime}
                  onChange={(e) => setQuizData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="endTime" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>End Time</label>
                <input
                  type="datetime-local"
                  id="endTime"
                  value={quizData.endTime}
                  onChange={(e) => setQuizData(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Question Creation Section */}
        <div className="question-creation">
          <h4>Add New Question</h4>
          <div className="form-group">
            <label htmlFor="questionText">Question Text</label>
            <textarea
              id="questionText"
              rows="3"
              value={currentQuestion.questionText}
              onChange={(e) => setCurrentQuestion(prev => ({ ...prev, questionText: e.target.value }))}
              placeholder="e.g., What is the capital of France?"
            />
          </div>

          <div className="form-group">
            <label htmlFor="correctAnswer">Correct Answer</label>
            <textarea
              id="correctAnswer"
              rows="3"
              value={currentQuestion.correctAnswer}
              onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
              placeholder="e.g., Paris is the capital of France."
            />
          </div>

          <div className="form-group">
            <label htmlFor="points">Points</label>
            <input
              type="number"
              id="points"
              min="1"
              value={currentQuestion.points}
              onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) }))}
            />
          </div>

          <button type="button" className="btn add-question" onClick={handleAddQuestion}>
            Add Question
          </button>
        </div>

        {/* Questions List Section */}
        {quizData.questions.length > 0 && (
          <div className="questions-list">
            <h4>Quiz Questions</h4>
            {quizData.questions.map((question, index) => (
              <div key={index} className="question-item">
                <div className="question-content">
                  <strong>Question {index + 1}:</strong> {question.questionText}
                  <br />
                  <span className="points-badge">{question.points} points</span>
                </div>
                <button
                  type="button"
                  className="btn remove-btn"
                  onClick={() => handleRemoveQuestion(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="btn submit-btn">Create Quiz</button>
      </form>
      {message && (
        <div className="message" style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          borderRadius: '0.5rem',
          backgroundColor: message.includes('error') ? '#fee2e2' : '#ecfdf5',
          color: message.includes('error') ? '#dc2626' : '#059669'
        }}>
          {message}
        </div>
      )}

      <style>{`
        .quiz-details {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 0.5rem;
          margin-bottom: 2rem;
        }
        
        .datetime-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .question-creation {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 0.5rem;
          margin-bottom: 2rem;
        }

        .questions-list {
          margin-top: 2rem;
        }

        .question-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .question-content {
          flex: 1;
        }

        .points-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #e0e7ff;
          color: #4f46e5;
          border-radius: 1rem;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .remove-btn {
          background: #ef4444;
          color: white;
          padding: 0.25rem 0.75rem;
          margin-left: 1rem;
          width: auto;
        }

        .remove-btn:hover {
          background: #dc2626;
        }

        .add-question {
          background: #4f46e5;
          color: white;
          width: 100%;
          margin-top: 1rem;
        }

        .add-question:hover {
          background: #4338ca;
        }

        .submit-btn {
          background: #059669;
          color: white;
          width: 100%;
          margin-top: 2rem;
        }

        .submit-btn:hover {
          background: #047857;
        }

        input[type="datetime-local"] {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
        }

        @media (max-width: 640px) {
          .datetime-group {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
