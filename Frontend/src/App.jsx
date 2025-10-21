import React, { useState, useEffect } from 'react';
import DashboardPage from './pages/DashboardPage.jsx';
import QuizPage from './pages/QuizPage.jsx';

// For this collaborative environment's preview to work, all components and styles
// must be consolidated into this single file. For your local project, you should 
// continue to use your separate, modular files as you have been doing.

// --- STYLES ---
// This contains all the styles from your styles.css file.
const GlobalStyles = () => (
  <style>{`
    :root {
      --primary-color: #4f46e5;
      --primary-hover: #4338ca;
      --secondary-color: #f9fafb;
      --text-color: #1f2937;
      --muted-text-color: #6b7280;
      --border-color: #d1d5db;
      --background-color: #ffffff;
    }
    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--secondary-color);
      color: var(--text-color);
      margin: 0;
    }
    #root {
      width: 100%;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    main {
      flex: 1;
      padding: 1rem;
    }
    .page-container {
      background-color: var(--background-color);
      border-radius: 1rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      padding: 2rem 2.5rem;
      width: 100%;
      max-width: 800px;
      margin: 2rem auto;
      border: 1px solid var(--border-color);
      box-sizing: border-box;
    }
    .form-window {
      max-width: 550px;
      margin-left: auto;
      margin-right: auto;
    }
    .btn {
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 0.5rem;
      background-color: var(--primary-color);
      color: white;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .btn:hover {
      background-color: var(--primary-hover);
    }
    .form-container {
      display: flex;
      flex-direction: column;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    .form-group input, .form-group textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid var(--border-color);
      font-size: 1rem;
      font-family: 'Inter', sans-serif;
      box-sizing: border-box;
    }
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background-color: var(--background-color);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .navbar-brand {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--primary-color);
      cursor: pointer;
    }
    .nav-links button {
      background: none;
      border: none;
      color: var(--muted-text-color);
      font-size: 1rem;
      font-weight: 500;
      margin-left: 1.5rem;
      cursor: pointer;
      transition: color 0.2s;
    }
    .nav-links button:hover {
      color: var(--primary-color);
    }
    h1, h2, h3 {
      text-align: center;
    }
    .form-container p a, .form-window p a {
        color: var(--primary-color);
        font-weight: 500;
        cursor: pointer;
        text-decoration: none;
    }
     .form-container p, .form-window p {
      text-align: center;
      margin-top: 1.5rem;
    }
  `}</style>
);


// --- NAVBAR COMPONENT ---
const Navbar = ({ setPage, user, onLogout }) => {
  const isLoggedIn = !!user;
  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => setPage('home')}>QuizMaster</div>
      <div className="nav-links">
        <button onClick={() => setPage('home')}>Home</button>
        {isLoggedIn ? (
          <>
            <button onClick={() => setPage('dashboard')}>Dashboard</button>
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
};

// --- FOOTER COMPONENT ---
const Footer = () => (
  <footer style={{ backgroundColor: '#f3f4f6', color: '#6b7280', textAlign: 'center', padding: '1.5rem', borderTop: '1px solid #e5e7eb', marginTop: 'auto' }}>
    <p>&copy; {new Date().getFullYear()} QuizMaster. All rights reserved.</p>
  </footer>
);

// --- HOME PAGE COMPONENT ---
const HomePage = ({ setPage, user }) => {
  const handleStartQuiz = () => {
    if (!user) {
      alert('You must log in or sign up before starting the quiz.');
      return;
    }
    setPage('quiz');
  };
  // If user is a teacher, do not show the quiz start section
  if (user && user.role === 'teacher') {
    return (
      <div className="page-container">
        <h1>Welcome, Teacher!</h1>
        <p>Go to the Dashboard to create or manage quizzes.</p>
      </div>
    );
  }
  return (
    <div className="page-container">
      <h1>Welcome to the Quiz!</h1>
      <div style={{ lineHeight: '1.6' }}><h3>Instructions:</h3><ul><li>This quiz consists of several questions you must answer.</li><li>For each question, you can either type your answer or use the microphone to record it.</li><li>Click "Start Quiz" when you are ready to begin.</li></ul></div>
      <button className="btn" style={{ width: 'fit-content', margin: '2rem auto 0', display: 'block' }} onClick={handleStartQuiz}>Start Quiz</button>
    </div>
  );
};


// --- LOGIN PAGE COMPONENT ---
const LoginPage = ({ setPage, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('Login successful!');
        onLoginSuccess(data.user);
      } else {
        const errorData = await response.json();
        alert(`Login failed: ${errorData.msg}`);
      }
    } catch (error) {
      alert('Login failed. Could not connect to the server.');
    }
  };
  return (
    <div className="page-container form-window"><h1>Login</h1><form className="form-container" onSubmit={handleSubmit}><div className="form-group"><label htmlFor="email">Email</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div><div className="form-group"><label htmlFor="password">Password</label><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div><button type="submit" className="btn">Log In</button><p><a href="#" onClick={() => setPage('signup')}>Don't have an account? Sign up</a></p></form></div>
  );
};

// --- SIGNUP PAGE COMPONENT ---
const SignupPage = ({ setPage }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      if (response.ok) {
        alert('Registration successful! Please log in.');
        setPage('login');
      } else {
        const errorData = await response.json();
        alert(`Registration failed: ${errorData.msg}`);
      }
    } catch (error) {
      alert('Registration failed. Could not connect to the server.');
    }
  };
  return (
    <div className="page-container form-window"><h1>Create an Account</h1><form className="form-container" onSubmit={handleSubmit}><div className="form-group"><label htmlFor="name">Name</label><input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required /></div><div className="form-group"><label htmlFor="email">Email</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div><div className="form-group"><label htmlFor="password">Password</label><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div><div className="form-group"><label>I am a:</label><div style={{ display: 'flex', gap: '1rem' }}><label><input type="radio" value="student" checked={role === 'student'} onChange={(e) => setRole(e.target.value)} />Student</label><label><input type="radio" value="teacher" checked={role === 'teacher'} onChange={(e) => setRole(e.target.value)} />Teacher</label></div></div><button type="submit" className="btn">Sign Up</button><p><a href="#" onClick={() => setPage('login')}>Already have an account? Log in</a></p></form></div>
  );
};

// Import dashboard components
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';


// --- MAIN APP COMPONENT ---
export default function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('You have been logged out.');
    setPage('home');
  };

  const renderPage = () => {
    switch (page) {
      case 'quiz':
        return <QuizPage setPage={setPage} />;
      case 'login':
        return <LoginPage setPage={setPage} onLoginSuccess={handleLogin} />;
      case 'signup':
        return <SignupPage setPage={setPage} />;
      case 'dashboard':
        if (user && user.role === 'teacher') {
          return <TeacherDashboard setPage={setPage} />;
        } else if (user && user.role === 'student') {
          return <StudentDashboard setPage={setPage} />;
        }
        return <HomePage setPage={setPage} user={user} />;
      case 'home':
        if (user && user.role === 'student') {
          return <StudentDashboard setPage={setPage} />;
        }
        return <HomePage setPage={setPage} user={user} />;
    }
  };

  return (
    <>
      <GlobalStyles />
      <Navbar setPage={setPage} user={user} onLogout={handleLogout} />
      <main>
        {renderPage()}
      </main>
      <Footer />
    </>
  );
}

