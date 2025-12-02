import React, { useEffect, useState } from 'react';
import { getAuthToken, clearAuth } from '../../utils/auth';

const QuizList = ({ onQuizSelect, user, setPage }) => {
  const [quizEvents, setQuizEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalAttempts: 0,
    avgPercentage: 0,
    totalQuestions: 0,
    totalScore: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    partialAnswers: 0,
    accuracy: 0,
    totalTimeMinutes: 0
  });
  const [quizHistory, setQuizHistory] = useState([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [currentDate] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [quizFilter, setQuizFilter] = useState('available');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchQuizEvents();
    fetchStudentAnalytics();
  }, []);

  // Refresh analytics when coming back from quiz
  useEffect(() => {
    const handleFocus = () => {
      console.log('[QuizList] Window focus - Refreshing analytics');
      fetchStudentAnalytics();
      fetchQuizEvents();
    };
    const handleQuizCompleted = () => {
      console.log('[QuizList] Quiz completed event received - Force refreshing all data');
      // Force immediate refresh with a slight delay to ensure backend has processed
      setTimeout(() => {
        fetchStudentAnalytics();
        fetchQuizEvents();
      }, 500);
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('quizCompleted', handleQuizCompleted);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('quizCompleted', handleQuizCompleted);
    };
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
        console.log('[QuizList] Analytics data received:', data);
        
        if (data.attempts && data.attempts.length > 0) {
          // Store quiz history
          setQuizHistory(data.attempts);
          
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
          
          // Calculate total time spent (in minutes)
          const totalTimeMs = data.attempts.reduce((sum, att) => {
            if (att.submittedAt && att.startedAt) {
              const duration = new Date(att.submittedAt) - new Date(att.startedAt);
              console.log('[QuizList] Quiz time:', { 
                quiz: att.quizTitle || att._id, 
                duration: Math.round(duration / 60000), 
                submittedAt: att.submittedAt, 
                startedAt: att.startedAt 
              });
              return sum + duration;
            } else if (att.submittedAt && !att.startedAt) {
              // For old records without startedAt, estimate 15 minutes per quiz
              console.log('[QuizList] No startedAt for quiz, using 15min estimate:', att.quizTitle);
              return sum + (15 * 60 * 1000); // 15 minutes in milliseconds
            }
            return sum;
          }, 0);
          const totalTimeMinutes = Math.max(0, Math.round(totalTimeMs / 60000));
          
          console.log('[QuizList] Total time calculated:', totalTimeMinutes, 'minutes');
          
          const analyticsData = {
            totalAttempts,
            avgPercentage,
            totalQuestions,
            totalScore: totalScore.toFixed(1),
            correctAnswers,
            wrongAnswers,
            partialAnswers,
            accuracy: totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0,
            totalTimeMinutes
          };
          
          console.log('[QuizList] Setting analytics:', analyticsData);
          setAnalytics(analyticsData);
        } else {
          console.log('[QuizList] No attempts found, setting default analytics');
          setAnalytics({
            totalAttempts: 0,
            avgPercentage: 0,
            totalQuestions: 0,
            totalScore: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            partialAnswers: 0,
            accuracy: 0,
            totalTimeMinutes: 0
          });
        }
      } else {
        // If endpoint doesn't exist or returns error, set default analytics
        setAnalytics({
          totalAttempts: 0,
          avgPercentage: 0,
          totalQuestions: 0,
          totalScore: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          partialAnswers: 0,
          accuracy: 0,
          totalTimeMinutes: 0
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set default analytics on error
      setAnalytics({
        totalAttempts: 0,
        avgPercentage: 0,
        totalQuestions: 0,
        totalScore: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        partialAnswers: 0,
        accuracy: 0,
        totalTimeMinutes: 0
      });
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
      
      if (response.ok) {
        const data = await response.json();
        // Backend returns { quizEvents: [...], timestamp: ... }
        const quizData = data.quizEvents || data;
        const quizArray = Array.isArray(quizData) ? quizData : [];
        console.log('Received quizzes:', quizArray);
        setQuizEvents(quizArray);
      } else if (response.status === 401) {
        clearAuth();
        setError('Session expired. Please log in again.');
      }
    } catch (error) {
      setError('Failed to fetch quizzes.');
    } finally {
      setLoading(false);
    }
  };

  const getQuizStatus = (quiz) => {
    const now = new Date();
    const endTime = new Date(quiz.endTime);
    const hasAttempted = quiz.participants?.some(p => p.userId === user?._id);
    
    // If student attended OR quiz is active, show Active
    if (hasAttempted || quiz.status === 'active') {
      return { status: 'active', label: 'Active', color: '#10B981' };
    }
    
    // If not attended and time is over, show Missing
    if (now > endTime) {
      return { status: 'missing', label: 'Missing', color: '#EF4444' };
    }
    
    return { status: 'inactive', label: 'Inactive', color: '#6B7280' };
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
    { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    { id: 'quizzes', label: 'My Quizzes', icon: 'quizzes' },
    { id: 'recent', label: 'Recent', icon: 'recent' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' }
  ];

  // Helper function to format time
  const formatTime = (minutes) => {
    if (!minutes || minutes === 0) return '0 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}m`;
  };

  // Calculate stats
  const totalQuizzes = Array.isArray(quizEvents) ? quizEvents.length : 0;
  const activeQuizzes = Array.isArray(quizEvents) ? quizEvents.filter(q => q.status === 'active').length : 0;
  const completedQuizzes = Array.isArray(quizEvents) ? quizEvents.filter(q => q.status === 'completed').length : 0;
  const missedQuizzes = Array.isArray(quizEvents) ? quizEvents.filter(q => getQuizStatus(q).label === 'Missing').length : 0;

  // Get calendar data
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const calendarMonth = monthNames[calendarDate.getMonth()];
  const calendarYear = calendarDate.getFullYear();
  const daysInMonth = new Date(calendarYear, calendarDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarYear, calendarDate.getMonth(), 1).getDay();

  // Get subject-specific icons for quizzes
  const getSubjectIcon = (subject) => {
    const subjectLower = (subject || '').toLowerCase();
    
    // Biology-related subjects
    if (subjectLower.includes('bio') || subjectLower.includes('anatomy') || subjectLower.includes('physiology')) {
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5"/>
          <path d="M12 2C12 2 8 6 8 12s4 10 4 10" stroke="white" strokeWidth="1.5"/>
          <path d="M12 2C12 2 16 6 16 12s-4 10-4 10" stroke="white" strokeWidth="1.5"/>
          <ellipse cx="12" cy="12" rx="10" ry="4" stroke="white" strokeWidth="1.5"/>
          <circle cx="12" cy="12" r="2" fill="white"/>
        </svg>
      );
    }
    
    // Physics-related subjects
    if (subjectLower.includes('physics') || subjectLower.includes('mechanics') || subjectLower.includes('quantum')) {
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="2" fill="white"/>
          <circle cx="12" cy="5" r="1.5" fill="white"/>
          <circle cx="12" cy="19" r="1.5" fill="white"/>
          <circle cx="5" cy="12" r="1.5" fill="white"/>
          <circle cx="19" cy="12" r="1.5" fill="white"/>
          <circle cx="7.5" cy="7.5" r="1.2" fill="white"/>
          <circle cx="16.5" cy="7.5" r="1.2" fill="white"/>
          <circle cx="7.5" cy="16.5" r="1.2" fill="white"/>
          <circle cx="16.5" cy="16.5" r="1.2" fill="white"/>
          <path d="M12 5V3M12 21v-2M5 12H3M21 12h-2M7.5 7.5L6 6M18 6l-1.5 1.5M7.5 16.5L6 18M18 18l-1.5-1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.3"/>
        </svg>
      );
    }
    
    // Chemistry
    if (subjectLower.includes('chem')) {
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
          <path d="M9 3h6M10 3v5.5a4 4 0 0 0 1 2.5l3.5 4.5a2 2 0 0 1 .5 1.5v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2a2 2 0 0 1 .5-1.5L9 11a4 4 0 0 0 1-2.5V3z"/>
          <circle cx="8" cy="15" r="1" fill="white"/>
          <circle cx="11" cy="17" r="1" fill="white"/>
          <circle cx="14" cy="15" r="1" fill="white"/>
        </svg>
      );
    }
    
    // Default - generic quiz icon
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M9 11H3v2h6m-6 4h6m8-8h6m-6 4h6m-6 4h6M9 7L7 3 5 7h4zM9 21v-2a2 2 0 012-2h2a2 2 0 012 2v2z"/>
      </svg>
    );
  };

  const getIconSVG = (iconName, isActive) => {
    const color = isActive ? currentTheme.sidebarActive : currentTheme.sidebarText;
    switch(iconName) {
      case 'dashboard':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`;
      case 'calendar':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
      case 'quizzes':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
      case 'recent':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
      case 'analytics':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`;
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
      const isToday = day === currentDate.getDate() && 
                      calendarDate.getMonth() === currentDate.getMonth() && 
                      calendarDate.getFullYear() === currentDate.getFullYear();
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
        <div 
          onClick={() => window.location.reload()}
          style={{ 
            marginBottom: '2.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.875rem',
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="white"/>
            <rect x="12" y="18" width="24" height="3" rx="1.5" fill="#0E78FF"/>
            <rect x="12" y="24" width="24" height="3" rx="1.5" fill="#0E78FF"/>
            <rect x="12" y="30" width="15" height="3" rx="1.5" fill="#0E78FF"/>
          </svg>
          <div style={{ 
            fontSize: '1.75rem', 
            fontWeight: '800', 
            color: darkMode ? '#F8FAFC' : '#0E78FF',
            letterSpacing: '-0.02em'
          }}>
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
                onClick={() => {
                  setActiveSection(item.id);
                  // Scroll to corresponding section
                  const scrollToSection = (sectionId) => {
                    const section = document.getElementById(sectionId);
                    if (section) {
                      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  };
                  
                  switch(item.id) {
                    case 'calendar':
                      scrollToSection('calendar-section');
                      break;
                    case 'quizzes':
                      scrollToSection('quiz-section');
                      break;
                    case 'recent':
                      scrollToSection('recent-section');
                      break;
                    case 'analytics':
                      scrollToSection('analytics-section');
                      break;
                    default:
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
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
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '0.875rem',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.2s',
                  textAlign: 'center'
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
                <div dangerouslySetInnerHTML={{ __html: getIconSVG(item.icon, isActive) }} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }} />
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
            background: currentTheme.cardBg,
            border: `2px solid ${currentTheme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: currentTheme.text
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
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
            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: darkMode ? '#F8FAFC' : '#0F172A', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Dashboard
            </h1>
            <p style={{ fontSize: '1rem', color: darkMode ? '#94A3B8' : '#64748B', fontWeight: '500' }}>
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

            {/* User Profile Menu */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: `2px solid ${currentTheme.border}`,
                  background: currentTheme.cardBg,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentTheme.text,
                  transition: 'all 0.2s',
                  boxShadow: showUserMenu ? `0 4px 12px ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` : 'none'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.background = currentTheme.accentLight;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = currentTheme.cardBg;
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
              
              {/* Dropdown Menu - Logout Only */}
              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '50px',
                  right: '0',
                  width: '160px',
                  background: currentTheme.cardBg,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '12px',
                  boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  zIndex: 1000
                }}>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      clearAuth();
                      setPage('login');
                    }}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#EF4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: '2.5rem' }}>
          {/* Welcome Card with Character */}
          <div style={{
            background: `linear-gradient(135deg, ${currentTheme.accent} 0%, #EC4899 100%)`,
            borderRadius: '20px',
            padding: '2.5rem',
            marginBottom: '2.5rem',
            position: 'relative',
            overflow: 'hidden',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '180px'
          }}>
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '60%' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.75rem', color: '#FFFFFF' }}>
                Hello, {user?.name?.split(' ')[0] || 'Student'}!
              </h2>
              <p style={{ fontSize: '1rem', opacity: 0.95, color: '#FFFFFF', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                We've missed you! Check out what's new and improved in your dashboard.
              </p>
              <button style={{
                background: 'white',
                color: currentTheme.accent,
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              onClick={() => {
                const quizzesSection = document.getElementById('quiz-section');
                if (quizzesSection) {
                  quizzesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}>
                View Available Quizzes
              </button>
            </div>
            
            {/* Character Illustration */}
            <div style={{ position: 'relative', zIndex: 1, marginRight: '2rem' }}>
              <img 
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 400'%3E%3Cdefs%3E%3ClinearGradient id='bg1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23a8c0ff'/%3E%3Cstop offset='100%25' style='stop-color:%23c4d9ff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cellipse cx='350' cy='120' rx='140' ry='120' fill='url(%23bg1)' opacity='0.5'/%3E%3Ccircle cx='120' cy='150' r='15' fill='none' stroke='%23a8c0ff' stroke-width='3' opacity='0.4'/%3E%3Ccircle cx='400' cy='80' r='10' fill='%23c4d9ff' opacity='0.5'/%3E%3Cg transform='translate(90,80)'%3E%3Ccircle r='35' fill='none' stroke='%236366F1' stroke-width='5' opacity='0.5'/%3E%3Cline x1='25' y1='25' x2='45' y2='45' stroke='%236366F1' stroke-width='5' opacity='0.5'/%3E%3C/g%3E%3Cg transform='translate(410,210)'%3E%3Cpath d='M-15,-5 L-15,25 L0,20 Z' fill='%23F97316'/%3E%3Cpath d='M0,20 L15,25 L15,-5 Z' fill='%23FB923C'/%3E%3C/g%3E%3Cg transform='translate(80,240)'%3E%3Crect width='70' height='100' rx='5' fill='%236366F1'/%3E%3Crect x='4' y='15' width='62' height='80' rx='3' fill='%23FEF3C7'/%3E%3Ccircle cx='35' cy='7' r='5' fill='%237C3AED'/%3E%3Cg stroke='%2310B981' stroke-width='3' fill='none'%3E%3Cpath d='M15,30 L22,37 L35,24'/%3E%3Cpath d='M15,52 L22,59 L35,46'/%3E%3Cpath d='M15,74 L22,81 L35,68'/%3E%3C/g%3E%3Cline x1='40' y1='30' x2='58' y2='30' stroke='%234B5563' stroke-width='2.5'/%3E%3Cline x1='40' y1='52' x2='58' y2='52' stroke='%234B5563' stroke-width='2.5'/%3E%3Cline x1='40' y1='74' x2='58' y2='74' stroke='%234B5563' stroke-width='2.5'/%3E%3C/g%3E%3Cg transform='translate(280,180)'%3E%3Cellipse rx='90' ry='25' fill='%233730A3'/%3E%3Cpath d='M0,-45 L75,-18 L75,-8 L0,18 L-75,-8 L-75,-18 Z' fill='%234338CA'/%3E%3Cpolygon points='0,-45 45,-25 0,-5 -45,-25' fill='%236366F1' opacity='0.9'/%3E%3Ccircle cx='50' cy='-32' r='5' fill='%23FCD34D'/%3E%3Cline x1='50' y1='-27' x2='50' y2='-15' stroke='%23FCD34D' stroke-width='3'/%3E%3Ccircle cx='50' cy='-10' r='6' fill='%23F59E0B'/%3E%3C/g%3E%3Cg transform='translate(200,280)'%3E%3Crect width='80' height='18' rx='2' fill='%233B82F6'/%3E%3Crect x='-3' y='20' width='80' height='18' rx='2' fill='%2310B981'/%3E%3Crect x='4' y='40' width='80' height='18' rx='2' fill='%23F59E0B'/%3E%3C/g%3E%3Cg transform='translate(360,300)'%3E%3Crect width='35' height='45' rx='3' fill='%23FBBF24'/%3E%3Crect x='6' y='-10' width='5' height='30' fill='%23F59E0B'/%3E%3Cpath d='M8.5,-12 L6,-10 L11,-10 Z' fill='%23DC2626'/%3E%3Crect x='15' y='-15' width='5' height='35' fill='%233B82F6'/%3E%3Cpath d='M17.5,-17 L15,-15 L20,-15 Z' fill='%231E40AF'/%3E%3Crect x='24' y='-12' width='5' height='32' fill='%2310B981'/%3E%3Cpath d='M26.5,-14 L24,-12 L29,-12 Z' fill='%23065F46'/%3E%3C/g%3E%3Cg transform='translate(160,190)'%3E%3Cellipse cx='20' cy='35' rx='25' ry='30' fill='%2367E8F9'/%3E%3Cellipse cx='20' cy='20' rx='22' ry='18' fill='%23FDE68A'/%3E%3Ccircle cx='14' cy='18' r='2' fill='%231F2937'/%3E%3Ccircle cx='26' cy='18' r='2' fill='%231F2937'/%3E%3Cpath d='M14,24 Q20,27 26,24' stroke='%231F2937' stroke-width='1.5' fill='none'/%3E%3Cellipse cx='20' cy='55' rx='22' ry='25' fill='%236366F1'/%3E%3Crect x='-2' y='35' width='44' height='25' fill='%236366F1'/%3E%3Crect x='-10' y='42' width='10' height='25' rx='5' fill='%23FDE68A'/%3E%3Crect x='40' y='42' width='10' height='25' rx='5' fill='%23FDE68A'/%3E%3Cellipse cx='8' cy='15' rx='30' ry='8' fill='%233730A3' opacity='0.8'/%3E%3Cellipse cx='32' cy='10' rx='28' ry='7' fill='%233730A3' opacity='0.7'/%3E%3Cpath d='M35,8 L50,15 L48,25 L55,30' stroke='%23FCD34D' stroke-width='2' fill='none'/%3E%3Ccircle cx='55' cy='30' r='4' fill='%23F59E0B'/%3E%3C/g%3E%3Crect x='50' y='360' width='400' height='8' rx='4' fill='%234B5563' opacity='0.3'/%3E%3C/svg%3E"
                alt="Student Dashboard Illustration" 
                style={{ 
                  width: '320px', 
                  height: 'auto',
                  filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.1))'
                }} 
              />
            </div>
            
            {/* Decorative circles */}
            <div style={{
              position: 'absolute',
              left: '-30px',
              top: '-30px',
              width: '150px',
              height: '150px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              filter: 'blur(40px)'
            }}></div>
            <div style={{
              position: 'absolute',
              right: '50px',
              bottom: '-40px',
              width: '180px',
              height: '180px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '50%',
              filter: 'blur(50px)'
            }}></div>
          </div>

          {/* Stats Grid */}
          <div id="analytics-section" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem',
            scrollMarginTop: '100px'
          }}>
            {/* Active Quizzes */}
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0E78FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                  <line x1="9" y1="11" x2="15" y2="11"/>
                </svg>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: currentTheme.text, marginBottom: '0.25rem' }}>
                {activeQuizzes}
              </div>
              <div style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, fontWeight: '500' }}>
                Active Quizzes
              </div>
            </div>

            {/* Completed */}
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: currentTheme.text, marginBottom: '0.25rem' }}>
                {completedQuizzes}
              </div>
              <div style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, fontWeight: '500' }}>
                Completed
              </div>
            </div>

            {/* Missed Quizzes */}
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
                background: '#FEF2F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: currentTheme.text, marginBottom: '0.25rem' }}>
                {missedQuizzes}
              </div>
              <div style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, fontWeight: '500' }}>
                Missed Quizzes
              </div>
            </div>

            {/* Total Quizzes */}
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: currentTheme.text, marginBottom: '0.25rem' }}>
                {totalQuizzes}
              </div>
              <div style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, fontWeight: '500' }}>
                Total Quizzes
              </div>
            </div>

            {/* Total Time Spent */}
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
                background: '#F3E8FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: currentTheme.text, marginBottom: '0.25rem' }}>
                {formatTime(analytics.totalTimeMinutes)}
              </div>
              <div style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, fontWeight: '500' }}>
                Total Time Spent
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
            <div id="quiz-section" style={{ scrollMarginTop: '100px' }}>
              {/* Filter Tabs */}
              <div style={{ 
                display: 'flex', 
                gap: '0.75rem',
                marginBottom: '1.5rem'
              }}>
                <button
                  onClick={() => setQuizFilter('available')}
                  style={{
                    padding: '0.625rem 1.75rem',
                    background: quizFilter === 'available' ? '#6366F1' : 'transparent',
                    border: quizFilter === 'available' ? 'none' : `1.5px solid ${currentTheme.border}`,
                    borderRadius: '24px',
                    color: quizFilter === 'available' ? 'white' : currentTheme.text,
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Active Quizzes
                </button>
                <button
                  onClick={() => setQuizFilter('all')}
                  style={{
                    padding: '0.625rem 1.75rem',
                    background: quizFilter === 'all' ? '#6366F1' : 'transparent',
                    border: quizFilter === 'all' ? 'none' : `1.5px solid ${currentTheme.border}`,
                    borderRadius: '24px',
                    color: quizFilter === 'all' ? 'white' : currentTheme.text,
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  All Quizzes
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(Array.isArray(quizEvents) ? quizEvents : [])
                    .filter(quiz => quizFilter === 'all' ? true : quiz.status === 'active')
                    .slice(0, 5)
                    .map((quiz, idx) => (
                    <div
                      key={quiz._id}
                      style={{
                        background: currentTheme.cardBg,
                        border: `1px solid ${currentTheme.border}`,
                        borderRadius: '12px',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        transition: 'all 0.2s',
                        cursor: quiz.status === 'active' ? 'pointer' : 'default'
                      }}
                      onClick={() => quiz.status === 'active' && handleParticipate(quiz)}
                      onMouseOver={(e) => {
                        if (quiz.status === 'active') {
                          e.currentTarget.style.boxShadow = darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (quiz.status === 'active') {
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {/* Header with title */}
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            fontSize: '0.9375rem', 
                            color: currentTheme.textSecondary, 
                            marginBottom: '0.625rem',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                            letterSpacing: '0.02em'
                          }}>
                            {quiz.subject || 'General'}
                          </div>
                          <h3 style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: '700', 
                            color: currentTheme.text, 
                            lineHeight: '1.4' 
                          }}>
                            {quiz.title}
                          </h3>
                        </div>
                        {/* Status Badge */}
                        <div style={{
                          padding: '0.375rem 0.875rem',
                          borderRadius: '20px',
                          background: `${getQuizStatus(quiz).color}15`,
                          border: `1.5px solid ${getQuizStatus(quiz).color}`,
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: getQuizStatus(quiz).color,
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem'
                        }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: getQuizStatus(quiz).color
                          }} />
                          {getQuizStatus(quiz).label}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)', 
                        gap: '1rem',
                        paddingTop: '0.5rem',
                        borderTop: `1px solid ${currentTheme.border}`
                      }}>
                        {/* Questions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: currentTheme.text }}>
                              {quiz.questions?.length || 0} Questions
                            </div>
                          </div>
                        </div>

                        {/* Total Points */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/>
                          </svg>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: currentTheme.text }}>
                              {quiz.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0} Points
                            </div>
                          </div>
                        </div>

                        {/* Duration */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: currentTheme.text }}>
                              {(() => {
                                const start = new Date(quiz.startTime);
                                const end = new Date(quiz.endTime);
                                const diffMinutes = Math.round((end - start) / (1000 * 60));
                                const hours = Math.floor(diffMinutes / 60);
                                const mins = diffMinutes % 60;
                                return hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer with date and Start button */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-end',
                        paddingTop: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: currentTheme.textSecondary }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            Started on {new Date(quiz.startTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(quiz.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </div>
                          {quiz.endTime && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: currentTheme.textSecondary }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                              </svg>
                              Ends on {new Date(quiz.endTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(quiz.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                          )}
                        </div>
                        {getQuizStatus(quiz).status === 'active' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleParticipate(quiz);
                            }}
                            style={{
                              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.625rem 1.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                              transition: 'all 0.2s',
                              flexShrink: 0
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            Start
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Calendar & Schedule */}
            <div>
              {/* Calendar */}
              <div id="calendar-section" style={{
                background: currentTheme.cardBg,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                scrollMarginTop: '100px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: currentTheme.text }}>
                    {calendarMonth} {calendarYear}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => {
                        const newDate = new Date(calendarDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setCalendarDate(newDate);
                      }}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: `1px solid ${currentTheme.border}`,
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: currentTheme.text,
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = currentTheme.accentLight;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >←</button>
                    <button 
                      onClick={() => {
                        const newDate = new Date(calendarDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setCalendarDate(newDate);
                      }}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: `1px solid ${currentTheme.border}`,
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: currentTheme.text,
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = currentTheme.accentLight;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >→</button>
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

              {/* Recent Activity */}
              <div id="recent-section" style={{
                background: currentTheme.cardBg,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '16px',
                padding: '1.5rem',
                scrollMarginTop: '100px'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: currentTheme.text, marginBottom: '1.5rem' }}>
                  Recent Activities
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {quizHistory.length > 0 ? (
                    quizHistory.slice(0, 5).map((attempt, idx) => (
                      <div key={attempt._id || idx} style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '12px',
                        background: darkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                        borderLeft: `3px solid ${currentTheme.accent}`,
                        transition: 'all 0.2s'
                      }}>
                        <div style={{ 
                          fontSize: '0.95rem', 
                          fontWeight: '600', 
                          color: currentTheme.text, 
                          marginBottom: '0.5rem',
                          lineHeight: '1.4'
                        }}>
                          {attempt.quizTitle || attempt.quiz?.title || 'Quiz'}
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.75rem',
                          flexWrap: 'wrap'
                        }}>
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: currentTheme.textSecondary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {new Date(attempt.submittedAt || attempt.createdAt).toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          {attempt.score !== undefined && (
                            <div style={{ 
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              color: '#10B981',
                              background: 'rgba(16, 185, 129, 0.1)',
                              padding: '0.25rem 0.625rem',
                              borderRadius: '6px'
                            }}>
                              Score: {attempt.score || 0}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '2.5rem 1rem', 
                      color: currentTheme.textSecondary, 
                      fontSize: '0.875rem',
                      lineHeight: '1.6'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                      No quiz attempts yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizList;
