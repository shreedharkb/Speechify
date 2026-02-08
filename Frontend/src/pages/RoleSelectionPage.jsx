import React from 'react';

export default function RoleSelectionPage({ setPage }) {
  const handleRoleSelection = (role) => {
    // Store the selected role in localStorage or pass it to signup page
    localStorage.setItem('selectedRole', role);
    setPage('signup');
  };

  return (
    <div className="page-container">
      <div className="role-selection-window">
        {/* Close button */}
        <button className="close-btn" onClick={() => setPage('home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <h1 className="role-selection-title">Sign in to Your Account</h1>
        
        <div className="role-cards-container">
          {/* Teacher Card */}
          <div className="role-card">
            <div className="role-icon teacher-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 4V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <button 
              className="role-btn teacher-btn"
              onClick={() => handleRoleSelection('teacher')}
            >
              I am a Teacher
            </button>
          </div>

          {/* Student Card */}
          <div className="role-card">
            <div className="role-icon student-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 17L8 14L10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <button 
              className="role-btn student-btn"
              onClick={() => handleRoleSelection('student')}
            >
              I am a Student
            </button>
          </div>
        </div>

        <div className="role-selection-links">
          <p className="account-text">Haven't signed into your Scholastic account before?</p>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage('signup'); }} className="create-account-link">
            Create an account
          </a>
          
          <div className="divider"></div>
          
          <p className="subscriber-text">Teachers, not yet a subscriber?</p>
          <a href="#" className="subscribe-link">Subscribe now</a>
          
          <p className="subscriber-note">Subscribers receive access to the website and print magazine.</p>
        </div>
      </div>
    </div>
  );
}
