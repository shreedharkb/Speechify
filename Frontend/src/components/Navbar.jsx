import React from 'react';

// The Navbar now receives the 'user' object and 'onLogout' function as props.
export default function Navbar({ setPage, user, onLogout }) {
  
  // We check if the user object exists to see if someone is logged in.
  const isLoggedIn = !!user;

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => setPage('home')}>
        QuizMaster
      </div>
      <div className="nav-links">
        <button onClick={() => setPage('home')}>Home</button>
        {isLoggedIn ? (
          <>
            {/* This logic is the same, but it's now more reliable */}
            {user.role === 'teacher' && (
              <button onClick={() => setPage('dashboard')}>Dashboard</button>
            )}
            
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => setPage('login')}>Login</button>
            <button onClick={() => setPage('signup')}>Sign Up</button>
          </>
        )}
      </div>
    </nav>
  );
}

