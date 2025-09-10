import React, { useState } from 'react';

// To resolve the import errors in this environment, all styles and components
// have been consolidated into this single file. You can copy the individual
// component code from here back into your separate local files.

// --- STYLES ---
const GlobalStyles = () => (
  <style>{`
    /* Basic Reset & Font */
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-color: #f9fafb;
      color: #1f2937;
    }

    /* Main App Container */
    main {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    /* Page Container */
    .page-container {
      background-color: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    /* Specific container for auth pages */
    .auth-container {
        max-width: 550px;
        margin-left: auto;
        margin-right: auto;
    }

    /* Button Styling */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      border: 1px solid transparent;
      font-weight: 600;
      cursor: pointer;
      background-color: #4f46e5;
      color: white;
      transition: background-color 0.2s;
    }

    .btn:hover {
      background-color: #4338ca;
    }

    /* Form Styling */
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .form-group input,
    .form-group textarea {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 1rem;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 2px #c7d2fe;
    }

    /* Input with Mic Button */
    .input-with-mic {
      position: relative;
    }

    .input-with-mic textarea {
      width: calc(100% - 4rem); /* Adjust width to make space for button */
      padding-right: 3.5rem;
    }

    .mic-button {
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
    }
  `}</style>
);


// --- NAVBAR COMPONENT ---
const Navbar = ({ setPage }) => {
  const navStyle = {
    backgroundColor: 'white',
    padding: '1rem 2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const navLinkStyle = {
    margin: '0 1rem',
    cursor: 'pointer',
    fontWeight: '600',
    color: '#4f46e5',
    textDecoration: 'none'
  };

  return (
    <nav style={navStyle}>
      <a href="#" style={{ ...navLinkStyle, fontSize: '1.5rem' }} onClick={() => setPage('home')}>
        QuizMaster
      </a>
      <div>
        <a href="#" style={navLinkStyle} onClick={() => setPage('home')}>Home</a>
        <a href="#" style={navLinkStyle} onClick={() => setPage('login')}>Login</a>
        <a href="#" style={navLinkStyle} onClick={() => setPage('signup')}>Signup</a>
      </div>
    </nav>
  );
};


// --- FOOTER COMPONENT ---
const Footer = () => {
  const footerStyle = {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    textAlign: 'center',
    padding: '1.5rem',
    marginTop: 'auto',
    borderTop: '1px solid #e5e7eb'
  };

  return (
    <footer style={footerStyle}>
      <p>&copy; {new Date().getFullYear()} QuizMaster. All rights reserved.</p>
    </footer>
  );
};


// --- HOME PAGE COMPONENT ---
const HomePage = ({ setPage }) => {
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
      <button className="btn" style={{ width: 'fit-content', margin: '2rem auto 0', display: 'block' }} onClick={() => setPage('quiz')}>
        Start Quiz
      </button>
    </div>
  );
};


// --- QUIZ PAGE COMPONENT ---
const QuizPage = ({ setPage }) => {
  const questions = [
    "What is the capital of France?",
    "Explain the theory of relativity in simple terms.",
    "What are the main causes of climate change?",
  ];

  return (
    <div className="page-container">
      <h1 style={{ textAlign: 'center' }}>Quiz Questions</h1>
      <form className="form-container" onSubmit={(e) => e.preventDefault()}>
        {questions.map((q, index) => (
          <div key={index} className="form-group">
            <label htmlFor={`question-${index}`}>{`${index + 1}. ${q}`}</label>
            <div className="input-with-mic">
              <textarea id={`question-${index}`} rows="3"></textarea>
              <button className="mic-button" title="Record Answer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
              </button>
            </div>
          </div>
        ))}
        <button type="submit" className="btn">Submit Answers</button>
      </form>
    </div>
  );
};


// --- LOGIN PAGE COMPONENT ---
const LoginPage = ({ setPage }) => {
  return (
    <div className="page-container auth-container">
      <h1 style={{ textAlign: 'center' }}>Login</h1>
      <form className="form-container" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" required />
        </div>
        <button type="submit" className="btn">Log In</button>
        <p style={{ textAlign: 'center' }}>
          Don't have an account? <a href="#" onClick={() => setPage('signup')}>Sign up</a>
        </p>
      </form>
    </div>
  );
};


// --- SIGNUP PAGE COMPONENT ---
const SignupPage = ({ setPage }) => {
  return (
    <div className="page-container auth-container">
      <h1 style={{ textAlign: 'center' }}>Create an Account</h1>
      <form className="form-container" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" required />
        </div>
        <button type="submit" className="btn">Sign Up</button>
        <p style={{ textAlign: 'center' }}>
          Already have an account? <a href="#" onClick={() => setPage('login')}>Log in</a>
        </p>
      </form>
    </div>
  );
};


// --- MAIN APP COMPONENT ---
export default function App() {
  const [page, setPage] = useState('home');

  const renderPage = () => {
    switch (page) {
      case 'quiz':
        return <QuizPage setPage={setPage} />;
      case 'login':
        return <LoginPage setPage={setPage} />;
      case 'signup':
        return <SignupPage setPage={setPage} />;
      case 'home':
      default:
        return <HomePage setPage={setPage} />;
    }
  };

  const appStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <div style={appStyle}>
      <GlobalStyles />
      <Navbar setPage={setPage} />
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

