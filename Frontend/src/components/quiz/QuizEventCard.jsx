import React from 'react';

const QuizEventCard = ({ quizEvent, onParticipate }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'active':
        return {
          container: 'status-badge status-active',
          text: 'Active'
        };
      case 'upcoming':
        return {
          container: 'status-badge status-upcoming',
          text: 'Upcoming'
        };
      default:
        return {
          container: 'status-badge',
          text: status
        };
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const status = getStatusStyle(quizEvent.status);

  return (
    <div className="quiz-event-card">
      <div className="card-header">
        <h3>{quizEvent.title}</h3>
        <span className={status.container}>{status.text}</span>
      </div>
      
      <div className="card-content">
        <p><strong>Subject:</strong> {quizEvent.subject}</p>
        <p><strong>Starts:</strong> {formatTime(quizEvent.startTime)}</p>
        <p><strong>Ends:</strong> {formatTime(quizEvent.endTime)}</p>
        
        {quizEvent.status === 'active' && (
          <div className="time-remaining active">
            <div className="time-info">
              <strong>Time Remaining:</strong>
              <span className="time">
                {Math.floor(quizEvent.timeRemaining / 60)}h {quizEvent.timeRemaining % 60}m
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ 
                  width: `${Math.min(100, Math.max(0, (quizEvent.timeRemaining / (24 * 60)) * 100))}%`
                }}
              ></div>
            </div>
          </div>
        )}
        
        {quizEvent.status === 'upcoming' && quizEvent.startsIn && (
          <div className="time-remaining upcoming">
            <div className="time-info">
              <strong>Starts in:</strong>
              <span className="time">{quizEvent.startsIn.hours}h {quizEvent.startsIn.minutes}m</span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => onParticipate(quizEvent)}
        className={`card-button ${quizEvent.status === 'active' ? 'button-active' : 'button-upcoming'}`}
        disabled={quizEvent.status !== 'active'}
      >
        {quizEvent.status === 'active' ? 'Start Quiz' : 'Coming Soon'}
      </button>

      <style>{`
        .quiz-event-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .quiz-event-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .card-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-active {
          background-color: #dcfce7;
          color: #15803d;
        }

        .status-upcoming {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .card-content {
          margin-bottom: 1.5rem;
        }

        .card-content p {
          margin: 0.5rem 0;
          color: #4b5563;
        }

        .card-content strong {
          color: #1f2937;
        }

        .card-button {
          width: 100%;
          padding: 0.75rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          border: none;
        }

        .button-active {
          background-color: #4f46e5;
          color: white;
        }

        .button-active:hover {
          background-color: #4338ca;
        }

        .button-upcoming {
          background-color: #e5e7eb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .time-remaining {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 6px;
        }

        .time-remaining.active {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
        }

        .time-remaining.upcoming {
          background-color: #eff6ff;
          border: 1px solid #bfdbfe;
        }

        .time-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .time {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background-color: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress {
          height: 100%;
          background-color: #22c55e;
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default QuizEventCard;