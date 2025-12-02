import React, { useEffect, useState } from 'react';
import QuizEventCard from './QuizEventCard';
import { getAuthToken, clearAuth } from '../../utils/auth';

const QuizList = ({ onQuizSelect, user, setPage }) => {
  const [quizEvents, setQuizEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    fetchQuizEvents();
    fetchStudentAnalytics();
  }, []);

  const fetchStudentAnalytics = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quiz-attempt/history`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.attempts && data.attempts.length > 0) {
          const totalAttempts = data.attempts.length;
          const totalScore = data.attempts.reduce((sum, att) => sum + (att.score || 0), 0);
          const totalPossible = data.attempts.reduce((sum, att) => {
            const possible = att.answers?.reduce((s, a) => s + (a.maxPoints || a.points || 0), 0) || 0;
            return sum + possible;
          }, 0);
          const avgPercentage = totalPossible > 0 ? ((totalScore / totalPossible) * 100).toFixed(1) : 0;
          const totalQuestions = data.attempts.reduce((sum, att) => sum + (att.answers?.length || 0), 0);
          const correctAnswers = data.attempts.reduce((sum, att) => sum + (att.answers?.filter(a => a.isCorrect).length || 0), 0);
          const wrongAnswers = data.attempts.reduce((sum, att) => sum + (att.answers?.filter(a => !a.isCorrect && a.pointsEarned === 0).length || 0), 0);
          const partialAnswers = data.attempts.reduce((sum, att) => sum + (att.answers?.filter(a => !a.isCorrect && a.pointsEarned > 0).length || 0), 0);
          
          setAnalytics({
            totalAttempts,
            avgPercentage,
            totalQuestions,
            totalScore: totalScore.toFixed(1),
            correctAnswers,
            wrongAnswers,
            partialAnswers,
            accuracy: totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0
          });
        } else {
          setAnalytics({
            totalAttempts: 0,
            avgPercentage: 0,
            totalQuestions: 0,
            totalScore: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            partialAnswers: 0,
            accuracy: 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchQuizEvents = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Please log in to view quizzes.');
        setLoading(false);
        clearAuth();
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quiz`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          clearAuth();
          return;
        }
        throw new Error(`Failed to fetch quiz events`);
      }
      
      const data = await response.json();
      setQuizEvents(data.quizEvents || data);
      setError(null);
    } catch (error) {
      console.error('Error fetching quiz events:', error);
      setError('Failed to load available quizzes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Theme configuration
  const theme = {
    light: {
      bg: '#F5F7FA',
      cardBg: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      sidebarBg: '#FFFFFF',
      sidebarText: '#6B7280',
      sidebarActive: '#0E78FF',
      sidebarActiveBg: '#EFF6FF',
      border: '#E5E7EB',
      accent: '#0E78FF',
      accentLight: '#EFF6FF'
    },
    dark: {
      bg: '#0F172A',
      cardBg: '#1E293B',
      text: '#F1F5F9',
      textSecondary: '#94A3B8',
      sidebarBg: '#1E293B',
      sidebarText: '#94A3B8',
      sidebarActive: '#3B82F6',
      sidebarActiveBg: '#1E3A5F',
      border: '#334155',
      accent: '#3B82F6',
      accentLight: '#1E3A5F'
    }
  };

  const currentTheme = darkMode ? theme.dark : theme.light;

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'explore', label: 'Explore', icon: 'explore' },
    { id: 'courses', label: 'My Courses', icon: 'courses' },
    { id: 'schedule', label: 'Schedule', icon: 'schedule' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'grades', label: 'Grades', icon: 'grades' },
    { id: 'resources', label: 'Resources', icon: 'resources' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  // Calculate stats
  const totalQuizzes = quizEvents.length;
  const activeQuizzes = quizEvents.filter(q => q.status === 'active').length;
  const completedQuizzes = quizEvents.filter(q => q.status === 'completed').length;

  // Get calendar data
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1).getDay();

  const getIconSVG = (iconName, isActive) => {
    const color = isActive ? currentTheme.sidebarActive : currentTheme.sidebarText;
    switch(iconName) {
      case 'dashboard':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`;
      case 'explore':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;
      case 'courses':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;
      case 'schedule':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
      case 'analytics':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`;
      case 'grades':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`;
      case 'resources':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`;
      case 'settings':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M1 12h6m6 0h6m-2.636-7.364L15 9.364m-6 6L4.636 19.636m10.728 0L9.636 15.364m6-6L19.636 4.636"/></svg>`;
      default:
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
    }
  };

  const handleParticipate = (quizEvent) => {
    if (quizEvent.status === 'active') {
      onQuizSelect(quizEvent);
    }
  };

  const renderCalendar = () => {
    const days = [];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    // Day headers
    dayNames.forEach((day, idx) => {
      days.push(
        <div key={`header-${idx}`} style={{ 
          textAlign: 'center', 
          fontWeight: '600', 
          fontSize: '0.75rem', 
          color: currentTheme.textSecondary,
          padding: '0.5rem 0'
        }}>
          {day}
        </div>
      );
    });

    // Empty cells before first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`}></div>);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === currentDate.getDate();
      days.push(
        <div key={`day-${day}`} style={{ 
          textAlign: 'center', 
          padding: '0.5rem',
          borderRadius: '8px',
          background: isToday ? currentTheme.accent : 'transparent',
          color: isToday ? 'white' : currentTheme.text,
          fontWeight: isToday ? '600' : '400',
          cursor: 'pointer',
          fontSize: '0.875rem',
          transition: 'all 0.2s'
        }}>
          {day}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: currentTheme.bg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: `4px solid ${currentTheme.border}`, 
            borderTop: `4px solid ${currentTheme.accent}`, 
            borderRadius: '50%', 
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: currentTheme.textSecondary, fontSize: '1rem' }}>Loading dashboard...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: currentTheme.bg, padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ color: currentTheme.text, fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Oops!</h3>
          <p style={{ color: '#EF4444', marginBottom: '1.5rem' }}>{error}</p>
          <button 
            onClick={fetchQuizEvents}
            style={{ 
              background: currentTheme.accent, 
              color: 'white', 
              padding: '0.75rem 2rem', 
              borderRadius: '10px', 
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: currentTheme.bg }}>
      {/* Modern Sidebar */}
      <div style={{ 
        width: '280px',
        background: currentTheme.sidebarBg,
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${currentTheme.border}`,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Logo & Brand */}
        <div style={{ marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: '800', 
            color: currentTheme.accent,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${currentTheme.accent} 0%, #EC4899 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.25rem',
              fontWeight: '700'
            }}>
              S
            </div>
            Speechify
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, marginBottom: '2rem' }}>
          {sidebarItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  marginBottom: '0.25rem',
                  background: isActive ? currentTheme.sidebarActiveBg : 'transparent',
                  border: 'none',
                  borderRadius: '12px',
                  color: isActive ? currentTheme.sidebarActive : currentTheme.sidebarText,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: getIconSVG(item.icon, isActive) }} style={{ display: 'flex', alignItems: 'center' }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div style={{
          padding: '1rem',
          background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${currentTheme.accent} 0%, #EC4899 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700'
          }}>
            {(user?.name || 'S')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontWeight: '600', color: currentTheme.text, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Student'}
            </div>
            <div style={{ fontSize: '0.75rem', color: currentTheme.textSecondary }}>Student</div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            clearAuth();
            setPage('login');
          }}
          style={{
            width: '100%',
            padding: '0.875rem 1rem',
            background: darkMode ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
            border: 'none',
            borderRadius: '12px',
            color: '#DC2626',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = darkMode ? 'rgba(239, 68, 68, 0.25)' : '#FECACA';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = darkMode ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Top Header */}
        <div style={{ 
          background: currentTheme.cardBg,
          borderBottom: `1px solid ${currentTheme.border}`,
          padding: '1.5rem 2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: currentTheme.text, marginBottom: '0.25rem' }}>
              Dashboard
            </h1>
            <p style={{ fontSize: '0.875rem', color: currentTheme.textSecondary }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: `1px solid ${currentTheme.border}`,
                background: currentTheme.cardBg,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.125rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = currentTheme.accentLight;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = currentTheme.cardBg;
              }}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: `1px solid ${currentTheme.border}`,
                background: currentTheme.cardBg,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={currentTheme.text} strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#EF4444',
                color: 'white',
                fontSize: '0.625rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {activeQuizzes}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: '2.5rem' }}>
          {/* Welcome Card */}
          <div style={{
            background: `linear-gradient(135deg, ${currentTheme.accent} 0%, #EC4899 100%)`,
            borderRadius: '20px',
            padding: '2.5rem',
            marginBottom: '2.5rem',
            position: 'relative',
            overflow: 'hidden',
            color: 'white'
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Hello, {user?.name || 'Student'}! 👋
              </h2>
              <p style={{ fontSize: '1rem', opacity: 0.9 }}>
                Ready to tackle some quizzes today? You have {activeQuizzes} active quiz{activeQuizzes !== 1 ? 'es' : ''} waiting.
              </p>
            </div>
            {/* Decorative circles */}
            <div style={{
              position: 'absolute',
              right: '-50px',
              top: '-50px',
              width: '200px',
              height: '200px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              filter: 'blur(40px)'
            }}></div>
            <div style={{
              position: 'absolute',
              right: '80px',
              bottom: '-30px',
              width: '150px',
              height: '150px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              filter: 'blur(30px)'
            }}></div>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            <div style={{
              background: currentTheme.cardBg,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '16px',
              padding: '1.5rem',
              transition: 'all 0.2s'
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0E78FF" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: currentTheme.text, marginBottom: '0.25rem' }}>
                {activeQuizzes}
              </div>
              <div style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, fontWeight: '500' }}>
                Active Quizzes
              </div>
            </div>

            <div style={{
              background: currentTheme.cardBg,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '16px',
              padding: '1.5rem',
              transition: 'all 0.2s'
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: '#F0FDF4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: currentTheme.text, marginBottom: '0.25rem' }}>
                {completedQuizzes}
              </div>
              <div style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, fontWeight: '500' }}>
                Completed
              </div>
            </div>

            <div style={{
              background: currentTheme.cardBg,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '16px',
              padding: '1.5rem',
              transition: 'all 0.2s'
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: currentTheme.text, marginBottom: '0.25rem' }}>
                {analytics?.totalScore || '0'}
              </div>
              <div style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, fontWeight: '500' }}>
                Total Points
              </div>
            </div>

            <div style={{
              background: currentTheme.cardBg,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '16px',
              padding: '1.5rem',
              transition: 'all 0.2s'
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: '#FCE7F3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: currentTheme.text, marginBottom: '0.25rem' }}>
                {analytics?.avgPercentage || '0'}%
              </div>
              <div style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, fontWeight: '500' }}>
                Average Score
              </div>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '2.5rem',
            marginBottom: '2.5rem'
          }}>
            {/* Left Column - Quizzes */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: currentTheme.text }}>
                  Available Quizzes
                </h2>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: currentTheme.accent,
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}>
                  View All →
                </button>
              </div>

              {quizEvents.length === 0 ? (
                <div style={{
                  background: currentTheme.cardBg,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '16px',
                  padding: '3rem 2rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: currentTheme.text, marginBottom: '0.5rem' }}>
                    No quizzes available
                  </h3>
                  <p style={{ color: currentTheme.textSecondary }}>
                    Check back later for new quizzes!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {quizEvents.slice(0, 5).map((quiz, idx) => (
                    <div
                      key={quiz._id}
                      style={{
                        background: currentTheme.cardBg,
                        border: `1px solid ${currentTheme.border}`,
                        borderRadius: '16px',
                        padding: '1.5rem',
                        display: 'flex',
                        gap: '1.5rem',
                        alignItems: 'flex-start',
                        transition: 'all 0.2s',
                        cursor: quiz.status === 'active' ? 'pointer' : 'default'
                      }}
                      onClick={() => quiz.status === 'active' && handleParticipate(quiz)}
                      onMouseOver={(e) => {
                        if (quiz.status === 'active') {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.borderColor = currentTheme.accent;
                        }
                      }}
                      onMouseOut={(e) => {
                        if (quiz.status === 'active') {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = currentTheme.border;
                        }
                      }}
                    >
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '12px',
                        background: quiz.status === 'active' 
                          ? `linear-gradient(135deg, ${currentTheme.accent} 0%, #EC4899 100%)`
                          : currentTheme.border,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        flexShrink: 0
                      }}>
                        📝
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: currentTheme.text }}>
                            {quiz.title}
                          </h3>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: quiz.status === 'active' ? '#D1FAE5' : quiz.status === 'completed' ? '#E5E7EB' : '#FEF3C7',
                            color: quiz.status === 'active' ? '#059669' : quiz.status === 'completed' ? '#6B7280' : '#D97706'
                          }}>
                            {quiz.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, marginBottom: '0.75rem' }}>
                          {quiz.subject}
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: currentTheme.textSecondary }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            {new Date(quiz.startTime).toLocaleDateString()}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {quiz.questions?.length || 0} Questions
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Calendar & Schedule */}
            <div>
              {/* Calendar */}
              <div style={{
                background: currentTheme.cardBg,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: currentTheme.text }}>
                    {currentMonth} {currentYear}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: `1px solid ${currentTheme.border}`,
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}>←</button>
                    <button style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: `1px solid ${currentTheme.border}`,
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}>→</button>
                  </div>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '0.25rem'
                }}>
                  {renderCalendar()}
                </div>
              </div>

              {/* My Schedule */}
              <div style={{
                background: currentTheme.cardBg,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '16px',
                padding: '1.5rem'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: currentTheme.text, marginBottom: '1.5rem' }}>
                  My Schedule
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {quizEvents.filter(q => q.status === 'active').slice(0, 3).map((quiz, idx) => (
                    <div key={quiz._id} style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderLeft: `3px solid ${currentTheme.accent}`
                    }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: currentTheme.text, marginBottom: '0.25rem' }}>
                        {quiz.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: currentTheme.textSecondary }}>
                        {new Date(quiz.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  {quizEvents.filter(q => q.status === 'active').length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: currentTheme.textSecondary, fontSize: '0.875rem' }}>
                      No upcoming quizzes
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Performance Analytics (if available) */}
          {analytics && analytics.totalAttempts > 0 && (
            <div style={{
              background: currentTheme.cardBg,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '16px',
              padding: '2rem'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: currentTheme.text, marginBottom: '1.5rem' }}>
                Performance Analytics
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem'
              }}>
                <div style={{ padding: '1rem', borderRadius: '12px', background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, marginBottom: '0.5rem' }}>
                    Accuracy
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '700', color: currentTheme.accent }}>
                    {analytics.accuracy}%
                  </div>
                </div>
                <div style={{ padding: '1rem', borderRadius: '12px', background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, marginBottom: '0.5rem' }}>
                    Correct Answers
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#059669' }}>
                    {analytics.correctAnswers}
                  </div>
                </div>
                <div style={{ padding: '1rem', borderRadius: '12px', background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, marginBottom: '0.5rem' }}>
                    Partial Credit
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F59E0B' }}>
                    {analytics.partialAnswers}
                  </div>
                </div>
                <div style={{ padding: '1rem', borderRadius: '12px', background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, marginBottom: '0.5rem' }}>
                    Wrong Answers
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#EF4444' }}>
                    {analytics.wrongAnswers}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizList;
