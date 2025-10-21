import React, { useState } from 'react';

export default function TeacherDashboard({ setPage }) {
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

  // Function to add a question to the quiz
  const handleAddQuestion = () => {
    if (!currentQuestion.questionText || !currentQuestion.correctAnswer) {
      alert('Please fill in both question text and correct answer.');
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
  };

  // Function to remove a question from the quiz
  const handleRemoveQuestion = (index) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

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
      // Validate quiz data
      if (!quizData.title || !quizData.subject || !quizData.startTime || !quizData.endTime) {
        alert('Please fill in all quiz details');
        return;
      }

      if (quizData.questions.length === 0) {
        alert('Please add at least one question to the quiz');
        return;
      }

      if (new Date(quizData.startTime) >= new Date(quizData.endTime)) {
        alert('End time must be after start time');
        return;
      }

      // Make the API call to create the quiz
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quiz/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(quizData),
      });

      if (response.ok) {
        alert('Quiz created successfully!');
        // Reset the form
        setQuizData({
          title: '',
          subject: '',
          startTime: '',
          endTime: '',
          questions: []
        });
      } else {
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
      <h3 style={{ color: '#6b7280' }}>Create a New Quiz</h3>
      
      <form className="form-container" onSubmit={handleSubmit}>
        {/* Quiz Details Section */}
        <div className="quiz-details">
          <div className="form-group">
            <label htmlFor="quizTitle">Quiz Title</label>
            <input
              type="text"
              id="quizTitle"
              value={quizData.title}
              onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter quiz title"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              value={quizData.subject}
              onChange={(e) => setQuizData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter subject"
              required
            />
          </div>

          <div className="datetime-group">
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input
                type="datetime-local"
                id="startTime"
                value={quizData.startTime}
                onChange={(e) => setQuizData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <input
                type="datetime-local"
                id="endTime"
                value={quizData.endTime}
                onChange={(e) => setQuizData(prev => ({ ...prev, endTime: e.target.value }))}
                required
              />
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
