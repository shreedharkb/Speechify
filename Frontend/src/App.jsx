import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import RoleSelectionPage from './pages/RoleSelectionPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import { Toaster } from 'sonner';

export default function App() {
  const [page, setPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') || 'home';
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);

      // Verify token is still valid
      fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
        headers: { 'x-auth-token': token }
      }).catch(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      });
    } catch (e) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === 'teacher') {
      setPage('dashboard');
    } else {
      setPage('home');
    }
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
      case 'role-selection':
        return <RoleSelectionPage setPage={setPage} />;
      case 'signup':
        return <SignupPage setPage={setPage} />;
      case 'forgot-password':
        return <ForgotPasswordPage setPage={setPage} />;
      case 'reset-password':
        return <ResetPasswordPage setPage={setPage} />;
      case 'dashboard':
        if (user && user.role === 'teacher') {
          return <TeacherDashboard setPage={setPage} />;
        } else if (user && user.role === 'student') {
          return <StudentDashboard setPage={setPage} user={user} />;
        }
        return <HomePage setPage={setPage} user={user} />;
      case 'home':
        if (user && user.role === 'student') {
          return <StudentDashboard setPage={setPage} user={user} />;
        } else if (user && user.role === 'teacher') {
          return <TeacherDashboard setPage={setPage} />;
        }
        return <HomePage setPage={setPage} user={user} />;
      default:
        return <HomePage setPage={setPage} user={user} />;
    }
  };

  // Hide navbar/footer on dashboard/quiz pages
  const isStudentDashboard = (page === 'dashboard' && user?.role === 'student') || (page === 'home' && user?.role === 'student') || (page === 'quiz');
  const isTeacherDashboard = (page === 'dashboard' && user?.role === 'teacher') || (page === 'home' && user?.role === 'teacher');
  const hideNavbarAndFooter = isStudentDashboard || isTeacherDashboard;

  return (
    <>
      {!hideNavbarAndFooter && <Navbar setPage={setPage} user={user} onLogout={handleLogout} />}
      <main className={hideNavbarAndFooter ? 'p-0 m-0' : ''}>
        {renderPage()}
      </main>
      {!hideNavbarAndFooter && <Footer />}
      <Toaster position="bottom-right" />
    </>
  );
}
