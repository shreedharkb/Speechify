import React, { useState, useEffect } from 'react';

function TeacherDashboard({ setPage }) {
  const [quizData, setQuizData] = useState({
    title: '',
    subject: '',
    startTime: '',
    endTime: '',
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    correctAnswer: '',
    points: 1
  });

  const [analytics, setAnalytics] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userName, setUserName] = useState('Teacher');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchTeacherAnalytics();
    fetchMyQuizzes();
    // Get user info from localStorage
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        setUserName(user.name || 'Teacher');
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, []);

  const fetchMyQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quiz`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        const quizzes = data.quizEvents || data;
        setMyQuizzes(quizzes);
        
        // Create recent activities from quiz creations
        const activities = quizzes.slice(0, 5).map(quiz => ({
          _id: quiz._id,
          quizTitle: quiz.title,
          action: 'created',
          createdAt: quiz.createdAt || quiz.startTime,
          studentsCount: quiz.studentsCount || 0
        }));
        setRecentActivities(activities);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const fetchTeacherAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quiz`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        const quizzes = data.quizEvents || data;
        const totalQuizzes = quizzes.length;
        const now = new Date();
        const activeQuizzes = quizzes.filter(q => {
          const start = new Date(q.startTime);
          const end = new Date(q.endTime);
          return now >= start && now <= end;
        }).length;
        const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0);
        const completedQuizzes = quizzes.filter(q => new Date(q.endTime) < now).length;
        const avgQuestionsPerQuiz = totalQuizzes > 0 ? (totalQuestions / totalQuizzes).toFixed(1) : 0;
        
        // Fetch total students who attempted quizzes
        console.log('Fetching quiz attempts from API...');
        const attemptResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/quiz-attempt/all`, {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        });
        
        console.log('Attempt response status:', attemptResponse.status);
        let totalStudents = 0;
        if (attemptResponse.ok) {
          const attemptData = await attemptResponse.json();
          console.log('Attempt data received:', attemptData);
          // Get unique student IDs
          const uniqueStudents = new Set();
          if (attemptData.attempts) {
            attemptData.attempts.forEach(attempt => {
              if (attempt.student) {
                uniqueStudents.add(attempt.student._id || attempt.student);
              }
            });
          }
          totalStudents = uniqueStudents.size;
          console.log('Total unique students:', totalStudents);
        } else {
          console.error('Failed to fetch attempts:', await attemptResponse.text());
        }
        
        setAnalytics({
          totalQuizzes,
          activeQuizzes,
          totalQuestions,
          totalStudents,
          completedQuizzes,
          avgQuestionsPerQuiz
        });
      }
    } catch (error) {
      console.error('Error fetching teacher analytics:', error);
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.questionText || !currentQuestion.correctAnswer) {
      alert('Please fill in both question text and correct answer.');
      return;
    }
    
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));

    setCurrentQuestion({
      questionText: '',
      correctAnswer: '',
      points: 1
    });
  };

  const handleRemoveQuestion = (index) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('You are not logged in. Please log in as a teacher.');
      setPage('login');
      return;
    }

    if (!quizData.title || !quizData.subject || !quizData.startTime || !quizData.endTime) {
      alert('Please fill in all quiz details');
      return;
    }

    if (quizData.questions.length === 0) {
      alert('Please add at least one question to the quiz');
      return;
    }

    if (new Date(quizData.startTime) >= new Date(quizData.endTime)) {
      alert('End time must be after start time');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quiz/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(quizData),
      });

      if (response.ok) {
        alert('🎉 Quiz created successfully!');
        setQuizData({
          title: '',
          subject: '',
          startTime: '',
          endTime: '',
          questions: []
        });
        // Refresh analytics after creating quiz
        fetchTeacherAnalytics();
        fetchMyQuizzes();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.msg}`);
      }
    } catch (error) {
      console.error('Failed to create quiz:', error);
      alert('An error occurred while creating the quiz.');
    }
  };

  // Calendar helper variables
  const currentDate = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const calendarMonth = monthNames[calendarDate.getMonth()];
  const calendarYear = calendarDate.getFullYear();
  const daysInMonth = new Date(calendarYear, calendarDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarYear, calendarDate.getMonth(), 1).getDay();

  const renderCalendar = () => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Day headers
    dayNames.forEach((day, idx) => {
      days.push(
        <div key={`header-${idx}`} style={{ 
          textAlign: 'center', 
          fontWeight: '600', 
          fontSize: '0.75rem', 
          color: '#9CA3AF',
          padding: '0.5rem 0',
          marginBottom: '0.25rem',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}>
          {day.substring(0, 2)}
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
          padding: '0.625rem',
          borderRadius: '8px',
          background: isToday ? '#3B82F6' : 'transparent',
          color: isToday ? '#FFFFFF' : '#1F2937',
          fontWeight: isToday ? '700' : '500',
          cursor: 'pointer',
          fontSize: '0.875rem',
          transition: 'all 0.15s ease',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}
        onMouseOver={(e) => {
          if (!isToday) {
            e.currentTarget.style.background = '#F3F4F6';
            e.currentTarget.style.fontWeight = '600';
          }
        }}
        onMouseOut={(e) => {
          if (!isToday) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.fontWeight = '500';
          }
        }}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  // Theme configuration (matching student dashboard)
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

  // Sidebar navigation items for teacher
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'create-quiz', label: 'Create Quiz', icon: 'create' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    { id: 'recent', label: 'Recent Activities', icon: 'recent' }
  ];

  const getIconSVG = (iconName, isActive) => {
    const color = isActive ? currentTheme.sidebarActive : currentTheme.sidebarText;
    switch(iconName) {
      case 'dashboard':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`;
      case 'create':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`;
      case 'analytics':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`;
      case 'calendar':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
      case 'recent':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
      default:
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
    }
  };

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
                    case 'create-quiz':
                      scrollToSection('quiz-form-section');
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
              {userName}
            </div>
            <div style={{ fontSize: '0.75rem', color: currentTheme.textSecondary }}>Teacher</div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
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
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
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
                Hello, {userName}!
              </h2>
              <p style={{ fontSize: '1rem', opacity: 0.95, color: '#FFFFFF', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Ready to create amazing quizzes? Manage your quizzes and track student progress all in one place.
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
                setActiveSection('create-quiz');
                setTimeout(() => {
                  const element = document.getElementById('quiz-form-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}>
                Create New Quiz
              </button>
            </div>
            
            {/* Professional Teacher Icon */}
            <div style={{ 
              position: 'relative', 
              zIndex: 1, 
              marginRight: '2rem',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
            }}>
              {/* You can replace this div with: <img src="/path-to-your-image.png" alt="Teacher" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> */}
              <div style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '80px'
              }}>
                👩‍🏫
              </div>
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
          {analytics && (
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: currentTheme.text, marginBottom: '0.25rem' }}>
                  {analytics.totalQuizzes}
                </div>
                <div style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, fontWeight: '500' }}>
                  Total Quizzes
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
                  {analytics.activeQuizzes}
                </div>
                <div style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, fontWeight: '500' }}>
                  Active Now
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
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: currentTheme.text, marginBottom: '0.25rem' }}>
                  {analytics.totalStudents}
                </div>
                <div style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, fontWeight: '500' }}>
                  Total Students
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
                    <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                  </svg>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: currentTheme.text, marginBottom: '0.25rem' }}>
                  {analytics.totalQuestions}
                </div>
                <div style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, fontWeight: '500' }}>
                  Total Questions
                </div>
              </div>
            </div>
          )}

          {/* Content based on active section */}
          {activeSection === 'create-quiz' || activeSection === 'dashboard' ? (
            <div id="quiz-form-section" style={{ background: currentTheme.cardBg, borderRadius: '16px', padding: '2.5rem', border: `1px solid ${currentTheme.border}`, scrollMarginTop: '100px' }}>
              <form onSubmit={handleSubmit}>
            {/* Quiz Details */}
            <div style={{ 
              marginBottom: '2.5rem'
            }}>
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #E5E7EB',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}>
                {/* Header with accent */}
                <div style={{
                  background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                  padding: '2rem 2.5rem',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '300px',
                    height: '300px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(40px)'
                  }}></div>
                  <h2 style={{ 
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    margin: '0 0 0.5rem 0',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    letterSpacing: '-0.03em',
                    color: 'white',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    Quiz Details
                  </h2>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.95)',
                    margin: '0',
                    fontSize: '1rem',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    fontWeight: '400',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    Configure the essential information for your quiz
                  </p>
                </div>
              
                <div style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
                  {/* Quiz Title Input */}
                  <div>
                    <label style={{ 
                      display: 'block',
                      marginBottom: '0.625rem', 
                      fontWeight: '600', 
                      color: '#111827',
                      fontSize: '0.9375rem',
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                      letterSpacing: '-0.01em'
                    }}>
                      Quiz Title
                    </label>
                    <input
                      type="text"
                      value={quizData.title}
                      onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter an engaging title for your quiz"
                      style={{ 
                        width: '100%', 
                        padding: '0.875rem 1.125rem', 
                        border: '2px solid #E5E7EB', 
                        borderRadius: '10px', 
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: '#F9FAFB',
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        color: '#111827',
                        fontWeight: '500',
                        lineHeight: '1.5'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667EEA';
                        e.target.style.background = '#FFFFFF';
                        e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E5E7EB';
                        e.target.style.background = '#F9FAFB';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>

                  {/* Subject Input */}
                  <div>
                    <label style={{ 
                      display: 'block',
                      marginBottom: '0.625rem', 
                      fontWeight: '600', 
                      color: '#111827',
                      fontSize: '0.9375rem',
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                      letterSpacing: '-0.01em'
                    }}>
                      Subject
                    </label>
                    <input
                      type="text"
                      value={quizData.subject}
                      onChange={(e) => setQuizData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Mathematics, Science, History..."
                      style={{ 
                        width: '100%', 
                        padding: '0.875rem 1.125rem', 
                        border: '2px solid #E5E7EB', 
                        borderRadius: '10px', 
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: '#F9FAFB',
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        color: '#111827',
                        fontWeight: '500',
                        lineHeight: '1.5'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667EEA';
                        e.target.style.background = '#FFFFFF';
                        e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E5E7EB';
                        e.target.style.background = '#F9FAFB';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                    {!quizData.subject && (
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#EF4444', 
                        fontSize: '0.875rem', 
                        marginTop: '0.625rem',
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        fontWeight: '500'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        This field is required
                      </div>
                    )}
                  </div>

                  {/* Time Inputs */}
                  <div style={{
                    background: 'linear-gradient(135deg, #F0F4FF 0%, #E9EEFF 100%)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '2px solid #D4DBFF'
                  }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '1.5rem'
                    }}>
                      <div>
                        <label style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.625rem', 
                          fontWeight: '600', 
                          color: '#111827',
                          fontSize: '0.9375rem',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                          letterSpacing: '-0.01em'
                        }}>
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="#10B981">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Start Time
                        </label>
                        <input
                          type="datetime-local"
                          value={quizData.startTime}
                          onChange={(e) => setQuizData(prev => ({ ...prev, startTime: e.target.value }))}
                          style={{ 
                            width: '100%', 
                            padding: '0.875rem 1.125rem', 
                            border: '2px solid #E5E7EB', 
                            borderRadius: '10px', 
                            fontSize: '0.9375rem',
                            outline: 'none',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            background: '#FFFFFF',
                            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                            color: '#111827',
                            fontWeight: '500'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#10B981';
                            e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#E5E7EB';
                            e.target.style.boxShadow = 'none';
                          }}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.625rem', 
                          fontWeight: '600', 
                          color: '#111827',
                          fontSize: '0.9375rem',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                          letterSpacing: '-0.01em'
                        }}>
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="#F59E0B">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          End Time
                        </label>
                        <input
                          type="datetime-local"
                          value={quizData.endTime}
                          onChange={(e) => setQuizData(prev => ({ ...prev, endTime: e.target.value }))}
                          style={{ 
                            width: '100%', 
                            padding: '0.875rem 1.125rem', 
                            border: '2px solid #E5E7EB', 
                            borderRadius: '10px', 
                            fontSize: '0.9375rem',
                            outline: 'none',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            background: '#FFFFFF',
                            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                            color: '#111827',
                            fontWeight: '500'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#F59E0B';
                            e.target.style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#E5E7EB';
                            e.target.style.boxShadow = 'none';
                          }}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Question Section */}
            <div style={{ 
              marginBottom: '2.5rem'
            }}>
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #E5E7EB',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}>
                {/* Header with accent */}
                <div style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  padding: '2rem 2.5rem',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '300px',
                    height: '300px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(40px)'
                  }}></div>
                  <h2 style={{ 
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    margin: '0 0 0.5rem 0',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    letterSpacing: '-0.03em',
                    color: 'white',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    Add Question
                  </h2>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.95)',
                    margin: '0',
                    fontSize: '1rem',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    fontWeight: '400',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    Build your quiz with custom questions
                  </p>
                </div>

                <div style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
                  <div>
                    <label style={{ 
                      display: 'block',
                      marginBottom: '0.625rem', 
                      fontWeight: '600', 
                      color: '#111827',
                      fontSize: '0.9375rem',
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                      letterSpacing: '-0.01em'
                    }}>
                      Question Text
                    </label>
                    <textarea
                      rows="4"
                      value={currentQuestion.questionText}
                      onChange={(e) => setCurrentQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                      placeholder="Enter your question here..."
                      style={{ 
                        width: '100%', 
                        padding: '0.875rem 1.125rem', 
                        border: '2px solid #E5E7EB', 
                        borderRadius: '10px', 
                        fontSize: '1rem',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        background: '#F9FAFB',
                        color: '#111827',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        lineHeight: '1.6',
                        fontWeight: '500'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#F59E0B';
                        e.target.style.background = '#FFFFFF';
                        e.target.style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E5E7EB';
                        e.target.style.background = '#F9FAFB';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block',
                      marginBottom: '0.625rem', 
                      fontWeight: '600', 
                      color: '#111827',
                      fontSize: '0.9375rem',
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                      letterSpacing: '-0.01em'
                    }}>
                      Correct Answer
                    </label>
                    <textarea
                      rows="4"
                      value={currentQuestion.correctAnswer}
                      onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                      placeholder="Enter the correct answer..."
                      style={{ 
                        width: '100%', 
                        padding: '0.875rem 1.125rem', 
                        border: '2px solid #E5E7EB', 
                        borderRadius: '10px', 
                        fontSize: '1rem',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        background: '#F9FAFB',
                        color: '#111827',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        lineHeight: '1.6',
                        fontWeight: '500'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#F59E0B';
                        e.target.style.background = '#FFFFFF';
                        e.target.style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E5E7EB';
                        e.target.style.background = '#F9FAFB';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '1.25rem', alignItems: 'end' }}>
                    <div>
                      <label style={{ 
                        display: 'block',
                        marginBottom: '0.625rem', 
                        fontWeight: '600', 
                        color: '#111827',
                        fontSize: '0.9375rem',
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        letterSpacing: '-0.01em'
                      }}>
                        Points
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={currentQuestion.points}
                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                        style={{ 
                          width: '100%', 
                          padding: '0.875rem 1.125rem', 
                          border: '2px solid #E5E7EB', 
                          borderRadius: '10px', 
                          fontSize: '1rem',
                          outline: 'none',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                          background: '#F9FAFB',
                          color: '#111827',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          fontWeight: '600',
                          textAlign: 'center'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#F59E0B';
                          e.target.style.background = '#FFFFFF';
                          e.target.style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#E5E7EB';
                          e.target.style.background = '#F9FAFB';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={handleAddQuestion}
                      style={{ 
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', 
                        color: 'white', 
                        padding: '0.875rem 1.75rem', 
                        borderRadius: '10px', 
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        letterSpacing: '0.01em'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                      }}
                    >
                      + Add Question
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions List */}
            {quizData.questions.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1E293B', marginBottom: '1rem' }}>
                  Quiz Questions ({quizData.questions.length})
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {quizData.questions.map((question, index) => (
                    <div key={index} style={{ 
                      background: 'white', 
                      padding: '1.5rem', 
                      borderRadius: '8px', 
                      border: '2px solid #E5E7EB',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0E78FF', marginBottom: '0.5rem' }}>
                          Question {index + 1}
                        </div>
                        <div style={{ color: '#1E293B', marginBottom: '0.5rem', fontWeight: '500' }}>
                          {question.questionText}
                        </div>
                        <div style={{ 
                          display: 'inline-block',
                          background: '#10B981', 
                          color: 'white', 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '20px', 
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {question.points} points
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(index)}
                        style={{ 
                          background: '#EF4444', 
                          color: 'white', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '6px', 
                          border: 'none',
                          fontWeight: '600',
                          cursor: 'pointer',
                          marginLeft: '1rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              style={{ 
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
                color: 'white', 
                padding: '1.125rem 2.5rem', 
                borderRadius: '12px', 
                border: 'none',
                fontWeight: '700',
                fontSize: '1.125rem',
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4), 0 4px 6px -2px rgba(16, 185, 129, 0.3)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 20px 25px -5px rgba(16, 185, 129, 0.4), 0 10px 10px -5px rgba(16, 185, 129, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 15px -3px rgba(16, 185, 129, 0.4), 0 4px 6px -2px rgba(16, 185, 129, 0.3)';
              }}
            >
              Create Quiz
            </button>
          </form>
        </div>
          ) : activeSection === 'analytics' ? (
            <div style={{ background: currentTheme.cardBg, borderRadius: '16px', padding: '2.5rem', border: `1px solid ${currentTheme.border}` }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: currentTheme.text, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={currentTheme.accent} strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="20" x2="12" y2="10"/>
                  <line x1="18" y1="20" x2="18" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="16"/>
                </svg>
                Analytics & Reports
              </h2>
              <p style={{ color: currentTheme.textSecondary, textAlign: 'center', padding: '3rem' }}>Detailed analytics and performance reports will be displayed here...</p>
            </div>
          ) : null}

          {/* Calendar and Recent Activities Section */}
          {(activeSection === 'dashboard' || activeSection === 'calendar' || activeSection === 'recent') && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '2.5rem',
              marginTop: activeSection === 'dashboard' ? '0' : '2.5rem'
            }}>
              {/* Left Column - Placeholder or can show quiz list */}
              <div></div>

              {/* Right Column - Calendar & Recent Activities */}
              <div>
                {/* Calendar */}
                <div id="calendar-section" style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '1.75rem',
                  marginBottom: '2rem',
                  scrollMarginTop: '100px',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                }}>
                  {/* Calendar Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '1.5rem'
                  }}>
                    <div>
                      <h3 style={{ 
                        fontSize: '1.625rem', 
                        fontWeight: '700', 
                        color: '#1F2937',
                        letterSpacing: '-0.025em',
                        margin: '0',
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                      }}>
                        {calendarMonth} {calendarYear}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => {
                          const newDate = new Date(calendarDate);
                          newDate.setMonth(newDate.getMonth() - 1);
                          setCalendarDate(newDate);
                        }}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB',
                          background: '#FFFFFF',
                          cursor: 'pointer',
                          color: '#6B7280',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#F3F4F6';
                          e.currentTarget.style.color = '#1F2937';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = '#FFFFFF';
                          e.currentTarget.style.color = '#6B7280';
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>
                      <button 
                        onClick={() => setCalendarDate(new Date())}
                        style={{
                          padding: '0 1rem',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB',
                          background: '#FFFFFF',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#374151',
                          transition: 'all 0.15s ease',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#F3F4F6';
                          e.currentTarget.style.color = '#1F2937';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = '#FFFFFF';
                          e.currentTarget.style.color = '#374151';
                        }}
                      >
                        Today
                      </button>
                      <button 
                        onClick={() => {
                          const newDate = new Date(calendarDate);
                          newDate.setMonth(newDate.getMonth() + 1);
                          setCalendarDate(newDate);
                        }}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB',
                          background: '#FFFFFF',
                          cursor: 'pointer',
                          color: '#6B7280',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#F3F4F6';
                          e.currentTarget.style.color = '#1F2937';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = '#FFFFFF';
                          e.currentTarget.style.color = '#6B7280';
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '0.5rem'
                  }}>
                    {renderCalendar()}
                  </div>
                </div>

                {/* Recent Activity */}
                <div id="recent-section" style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '0',
                  scrollMarginTop: '100px',
                  overflow: 'hidden'
                }}>
                  {/* Header */}
                  <div style={{
                    padding: '1.5rem 1.75rem',
                    borderBottom: '1px solid #F3F4F6',
                    background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <h3 style={{ 
                          fontSize: '1.125rem', 
                          fontWeight: '700', 
                          color: '#111827', 
                          margin: '0 0 0.25rem 0',
                          letterSpacing: '-0.02em',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                        }}>
                          Recent Activity
                        </h3>
                        <p style={{
                          fontSize: '0.8125rem',
                          color: '#6B7280',
                          margin: 0,
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                          fontWeight: '500'
                        }}>
                          Last {recentActivities.length} actions
                        </p>
                      </div>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Activities List */}
                  <div style={{ padding: '1rem' }}>
                    {recentActivities.length > 0 ? (
                      recentActivities.slice(0, 5).map((activity, idx) => (
                        <div key={activity._id || idx} style={{
                          padding: '1rem 1.25rem',
                          marginBottom: idx < Math.min(4, recentActivities.length - 1) ? '0.5rem' : '0',
                          borderRadius: '10px',
                          background: '#FAFBFC',
                          border: '1px solid #F3F4F6',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#FFFFFF';
                          e.currentTarget.style.borderColor = '#E5E7EB';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = '#FAFBFC';
                          e.currentTarget.style.borderColor = '#F3F4F6';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        >
                          {/* Status Indicator */}
                          <div style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '3px',
                            background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)'
                          }}></div>
                          
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: '1rem'
                          }}>
                            {/* Left Content */}
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontSize: '0.9375rem', 
                                fontWeight: '600', 
                                color: '#111827', 
                                marginBottom: '0.5rem',
                                lineHeight: '1.4',
                                letterSpacing: '-0.01em',
                                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                              }}>
                                {activity.quizTitle || 'Quiz Activity'}
                              </div>
                              
                              {/* Metadata Row */}
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: '1rem',
                                flexWrap: 'wrap'
                              }}>
                                <div style={{ 
                                  fontSize: '0.8125rem', 
                                  color: '#6B7280',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.375rem',
                                  fontWeight: '500',
                                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                                }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                  </svg>
                                  {new Date(activity.createdAt).toLocaleString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                                
                                {activity.subject && (
                                  <div style={{ 
                                    fontSize: '0.8125rem', 
                                    color: '#6B7280',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    fontWeight: '500',
                                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                                  }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                    </svg>
                                    {activity.subject}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Right Status Badge */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <div style={{ 
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#10B981',
                                background: 'rgba(16, 185, 129, 0.1)',
                                padding: '0.375rem 0.75rem',
                                borderRadius: '6px',
                                letterSpacing: '0.02em',
                                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                                whiteSpace: 'nowrap',
                                border: '1px solid rgba(16, 185, 129, 0.2)'
                              }}>
                                ✓ Created
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '3rem 1.5rem', 
                        color: '#9CA3AF', 
                        fontSize: '0.875rem',
                        lineHeight: '1.6',
                        background: '#FAFBFC',
                        borderRadius: '10px',
                        border: '1px dashed #E5E7EB'
                      }}>
                        <div style={{ 
                          width: '48px',
                          height: '48px',
                          margin: '0 auto 1rem',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                          </svg>
                        </div>
                        <div style={{ 
                          fontWeight: '600',
                          color: '#6B7280',
                          marginBottom: '0.25rem',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                        }}>
                          No Activity Yet
                        </div>
                        <div style={{
                          fontSize: '0.8125rem',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                        }}>
                          Your recent actions will appear here
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
