import React from 'react';

// SVG icon for the microphone
const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '20px', height: '20px'}}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5a6 6 0 00-12 0v1.5a6 6 0 006 6zM12 12.75V15m0-6.75v2.25m0-4.5v2.25m0 0A2.25 2.25 0 009.75 6.75h-1.5a2.25 2.25 0 00-2.25 2.25v1.5a2.25 2.25 0 002.25 2.25h1.5A2.25 2.25 0 0012 9V6.75z" />
    </svg>
);

export default function QuizPage({ setPage }) {
  // Array of question objects
  const questions = [
    { id: 1, text: "What is the capital of France?" },
    { id: 2, text: "Who wrote 'To Kill a Mockingbird'?" },
    { id: 3, text: "What is the chemical symbol for water?" },
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    // In a real app, you would process the answers here.
    alert('Quiz submitted successfully!');
    setPage('home'); // Navigate back to the home page after submission
  };

  return (
    <div className="page-container">
      <h1 style={{ textAlign: 'center' }}>Quiz in Progress</h1>
      <form onSubmit={handleSubmit}>
        {questions.map((q, index) => (
          <div key={q.id} className="form-group">
            <label style={{ fontWeight: '500', marginBottom: '1rem' }}>{index + 1}. {q.text}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="text" placeholder="Type or record your answer..." style={{ flexGrow: 1 }} />
              <button 
                type="button" 
                onClick={() => alert('Mic recording not implemented yet.')} 
                style={{ border: '1px solid #d1d5db', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', background: 'none' }}
              >
                <MicIcon />
              </button>
            </div>
          </div>
        ))}
        <button type="submit" className="btn">Submit Quiz</button>
      </form>
    </div>
  );
}
