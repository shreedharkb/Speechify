import React, { useState, useEffect } from 'react';

const QuizEditor = ({ quiz, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    questions: [
      {
        questionText: '',
        correctAnswer: '',
        points: 10
      }
    ]
  });

  useEffect(() => {
    if (quiz) {
      setFormData({
        ...quiz,
        startTime: new Date(quiz.startTime).toISOString().slice(0, 16),
        endTime: new Date(quiz.endTime).toISOString().slice(0, 16)
      });
    }
  }, [quiz]);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    setFormData({ ...formData, questions: newQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          questionText: '',
          correctAnswerText: '',
          points: 10
        }
      ]
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime)
    });
  };

  return (
    <div className="quiz-editor">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Quiz Title</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startTime">Start Time</label>
            <input
              type="datetime-local"
              id="startTime"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">End Time</label>
            <input
              type="datetime-local"
              id="endTime"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>
        </div>

        <h3>Questions</h3>
        {formData.questions.map((question, index) => (
          <div key={index} className="question-card">
            <div className="form-group">
              <label>Question {index + 1}</label>
              <input
                type="text"
                value={question.questionText}
                onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                placeholder="Enter question text"
                required
              />
            </div>

            <div className="form-group">
              <label>Correct Answer</label>
              <input
                type="text"
                value={question.correctAnswer}
                onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                placeholder="Enter correct answer"
                required
              />
            </div>

            <div className="form-group">
              <label>Points</label>
              <input
                type="number"
                min="1"
                value={question.points}
                onChange={(e) => handleQuestionChange(index, 'points', parseInt(e.target.value))}
                required
              />
            </div>

            {formData.questions.length > 1 && (
              <button
                type="button"
                className="btn-danger"
                onClick={() => removeQuestion(index)}
              >
                Remove Question
              </button>
            )}
          </div>
        ))}

        <button type="button" className="btn" onClick={addQuestion}>
          Add Question
        </button>

        <button type="submit" className="btn">
          Save Quiz
        </button>
      </form>

      <style>{`
        .quiz-editor {
          padding: 1rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .question-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 1rem 0;
        }
        .btn-danger {
          background-color: #ef4444;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
          margin-top: 1rem;
        }
        .btn-danger:hover {
          background-color: #dc2626;
        }
      `}</style>
    </div>
  );
};

export default QuizEditor;