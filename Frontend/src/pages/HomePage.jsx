import React from 'react';

// The HomePage receives the 'setPage' function as a prop to navigate to the quiz.
export default function HomePage({ setPage }) {
  return (
    <div className="page-container">
      <h1 style={{ fontSize: '2.5rem', textAlign: 'center' }}>Welcome to the Quiz!</h1>
      <div style={{ lineHeight: '1.6', color: '#6b7280' }}>
        <h3>Instructions:</h3>
        <ul>
          <li>This quiz consists of several questions you must answer.</li>
          <li>For each question, you can either type your answer or use the microphone to record it.</li>
          <li>Once you submit your answers, you cannot change them.</li>
          <li>Click "Start Quiz" when you are ready to begin.</li>
        </ul>
      </div>
      {/* This button correctly calls setPage with 'quiz' to trigger the page change */}
      <button className="btn" style={{ width: 'fit-content', margin: '2rem auto 0' }} onClick={() => setPage('quiz')}>
        Start Quiz
      </button>
    </div>
  );
}

