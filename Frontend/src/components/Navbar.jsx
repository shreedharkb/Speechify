import React from 'react';

// The Navbar receives the 'setPage' function as a prop to change the current view.
export default function Navbar({ setPage }) {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5', cursor: 'pointer' }} onClick={() => setPage('home')}>
        QuizMaster
      </div>
      <div>
        <button style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '1rem', marginLeft: '1.5rem', cursor: 'pointer' }} onClick={() => setPage('home')}>
          Home
        </button>
        <button style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '1rem', marginLeft: '1.5rem', cursor: 'pointer' }} onClick={() => setPage('login')}>
          Login
        </button>
        <button style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '1rem', marginLeft: '1.5rem', cursor: 'pointer' }} onClick={() => setPage('signup')}>
          Sign Up
        </button>
      </div>
    </nav>
  );
}
