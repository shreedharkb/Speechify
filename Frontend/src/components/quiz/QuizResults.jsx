import React from 'react';

const QuizResults = ({ results }) => {
  const totalPoints = results.questions.reduce((sum, q) => sum + q.points, 0);
  const earnedPoints = results.questions.reduce((sum, q) => sum + (q.isCorrect ? q.points : 0), 0);
  const percentage = ((earnedPoints / totalPoints) * 100).toFixed(1);

  return (
    <div className="quiz-results">
      <div className="results-header">
        <h2>{results.quizTitle}</h2>
        <div className="score-summary">
          <div className="score">
            <h3>Final Score</h3>
            <div className="score-circle">
              <span className="percentage">{percentage}%</span>
              <span className="points">{earnedPoints}/{totalPoints}</span>
            </div>
          </div>
          <div className="completion-time">
            <p>Completed on: {new Date(results.submittedAt).toLocaleString()}</p>
            <p>Time taken: {results.timeTaken}</p>
          </div>
        </div>
      </div>

      <div className="questions-review">
        {results.questions.map((question, index) => (
          <div 
            key={index} 
            className={`question-result ${question.isCorrect ? 'correct' : 'incorrect'}`}
          >
            <div className="question-header">
              <h4>Question {index + 1}</h4>
              <span className="points">{question.points} points</span>
            </div>
            
            <div className="question-content">
              <p className="question-text">{question.questionText}</p>
              
              <div className="answers">
                <div className="student-answer">
                  <h5>Your Answer:</h5>
                  <p>{question.studentAnswer || 'No answer provided'}</p>
                </div>
                
                <div className="correct-answer">
                  <h5>Correct Answer:</h5>
                  <p>{question.correctAnswer}</p>
                </div>
              </div>

              {question.feedback && (
                <div className="feedback">
                  <h5>Feedback:</h5>
                  <p>{question.feedback}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .quiz-results {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        .results-header {
          margin-bottom: 3rem;
        }
        .score-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2rem;
          padding: 2rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .score {
          text-align: center;
        }
        .score-circle {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          border: 8px solid #4f46e5;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          margin: 1rem auto;
        }
        .percentage {
          font-size: 2rem;
          font-weight: bold;
          color: #4f46e5;
        }
        .points {
          font-size: 1rem;
          color: #6b7280;
        }
        .completion-time {
          color: #6b7280;
        }
        .questions-review {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .question-result {
          background: white;
          border-radius: 0.5rem;
          padding: 2rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border-left: 4px solid;
        }
        .question-result.correct {
          border-left-color: #059669;
        }
        .question-result.incorrect {
          border-left-color: #ef4444;
        }
        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .question-header .points {
          background: #f3f4f6;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
        }
        .question-text {
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
        }
        .answers {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }
        .student-answer, .correct-answer {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
        }
        .student-answer h5, .correct-answer h5 {
          margin-bottom: 0.5rem;
          color: #4b5563;
        }
        .feedback {
          background: #fffbeb;
          padding: 1rem;
          border-radius: 0.5rem;
        }
        .feedback h5 {
          color: #92400e;
          margin-bottom: 0.5rem;
        }
        @media (max-width: 640px) {
          .score-summary {
            flex-direction: column;
            text-align: center;
          }
          .answers {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default QuizResults;