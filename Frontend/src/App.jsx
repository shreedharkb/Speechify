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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    
    :root {
      --primary-color: #0E78FF;
      --primary-hover: #0C5FD1;
      --primary-dark: #0A4FB8;
      --secondary-color: #F3F7FA;
      --text-color: #1E293B;
      --muted-text-color: #64748B;
      --border-color: #E2E8F0;
      --background-color: #FFFFFF;
      --light-blue: #E8F2FF;
      --success-color: #10B981;
      --danger-color: #EF4444;
      --warning-color: #F59E0B;
      --pink-gradient: linear-gradient(135deg, #FF3366 0%, #FF0050 100%);
      --blue-gradient: linear-gradient(135deg, #0E78FF 0%, #0A4FB8 100%);
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #F8FAFC;
      color: var(--text-color);
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      font-feature-settings: 'kern' 1, 'liga' 1;
      text-rendering: optimizeLegibility;
    }
    
    #root {
      width: 100%;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    main {
      flex: 1;
      padding: 0;
    }
    
    .page-container {
      background: var(--background-color);
      padding: 3rem;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .form-window {
      max-width: 480px;
      margin: 4rem auto;
      padding: 3rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid var(--border-color);
    }
    
    .btn {
      width: 100%;
      padding: 0.875rem 1.5rem;
      border: none;
      border-radius: 8px;
      background: var(--primary-color);
      color: white;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .btn:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
      box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
    }
    
    .btn:active {
      transform: translateY(0);
    }

    .btn-secondary {
      background: white;
      color: var(--primary-color);
      border: 2px solid var(--primary-color);
    }

    .btn-secondary:hover {
      background: var(--light-blue);
    }
    
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .form-group {
      margin-bottom: 0;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--text-color);
      font-size: 0.875rem;
    }
    
    .form-group input, .form-group textarea, .form-group select {
      width: 100%;
      padding: 0.875rem 1rem;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      font-size: 1rem;
      font-family: 'Inter', sans-serif;
      transition: all 0.2s ease;
      background: var(--background-color);
    }
    
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      background: white;
    }
    
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 5%;
      background: linear-gradient(135deg, #0E78FF 0%, #0A4FB8 100%);
      box-shadow: 0 2px 8px rgba(14, 120, 255, 0.3);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .navbar-brand {
      font-size: 1.75rem;
      font-weight: 800;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      letter-spacing: -0.02em;
      transition: transform 0.2s ease;
    }
    
    .navbar-brand:hover {
      transform: scale(1.02);
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.2;
      margin: 0;
    }
    
    p {
      margin: 0;
      line-height: 1.7;
    }
    
    .nav-links {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
    
    .nav-links button {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.9rem;
      font-weight: 600;
      padding: 0.625rem 1.25rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border-radius: 8px;
    }
    
    .nav-links button:hover {
      color: white;
      background: rgba(255, 255, 255, 0.15);
    }

    .nav-links .btn-primary {
      background: white;
      color: var(--primary-color);
    }
    
    .nav-links .btn-primary:hover {
      background: rgba(255, 255, 255, 0.95);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
    }

    .nav-links .btn-primary:hover {
      background: var(--primary-hover);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    
    h1 {
      font-size: 3rem;
      font-weight: 900;
      color: var(--text-color);
      line-height: 1.1;
      letter-spacing: -0.02em;
    }
    
    h2 {
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--text-color);
      line-height: 1.2;
    }
    
    h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-color);
    }

    h4 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-color);
    }
    
    .form-container p a, .form-window p a {
      color: var(--primary-color);
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    
    .form-container p a:hover, .form-window p a:hover {
      color: var(--primary-hover);
    }
    
    .form-container p, .form-window p {
      text-align: center;
      margin: 0;
      color: var(--muted-text-color);
      font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
      .page-container { padding: 2rem 1rem; }
      .navbar { padding: 1rem 5%; }
      .navbar-brand { font-size: 1.25rem; }
      .nav-links { gap: 0.5rem; }
      .nav-links button { padding: 0.5rem 0.875rem; font-size: 0.85rem; }
      h1 { font-size: 2rem; }
      h2 { font-size: 1.75rem; }
      main { padding: 0; }
      .form-window { margin: 2rem 1rem; padding: 2rem; }
    }
  `}</style>
);


// --- NAVBAR COMPONENT ---
const Navbar = ({ setPage, user, onLogout }) => {
  const isLoggedIn = !!user;
  
  const handleLogoClick = () => {
    window.location.reload();
  };
  
  return (
    <nav className="navbar">
      <div 
        className="navbar-brand" 
        onClick={handleLogoClick}
        style={{ cursor: 'pointer' }}
      >
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="white"/>
          <path d="M8 12h16M8 16h16M8 20h10" stroke="#0E78FF" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize: '1.75rem' }}>Speechify</span>
      </div>
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
            <button onClick={() => setPage('role-selection')} className="btn-primary" style={{ padding: '0.625rem 1.5rem' }}>
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

// --- FOOTER COMPONENT ---
const Footer = () => (
  <footer style={{ 
    backgroundColor: '#1E293B', 
    color: 'white', 
    padding: '4rem 5% 2rem', 
    marginTop: 'auto'
  }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#0E78FF"/>
              <path d="M8 12h16M8 16h16M8 20h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Speechify
          </div>
          <p style={{ fontSize: '0.875rem', opacity: 0.7, lineHeight: 1.6, maxWidth: '280px' }}>
            AI-powered quiz platform for intelligent assessment and learning. Transform education with smart technology.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            {['M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z', 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z', 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z'].map((d, i) => (
              <div key={i} style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d={d}/>
                </svg>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>Useful Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['Features', 'About', 'Service', 'Team'].map(item => (
              <li key={item} style={{ marginBottom: '0.75rem' }}>
                <a href="#" style={{ color: 'white', opacity: 0.7, textDecoration: 'none', fontSize: '0.9rem', transition: 'opacity 0.2s' }}>{item}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>Help & Support</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['FAQ', 'Blog', 'Contact Us', 'Support'].map(item => (
              <li key={item} style={{ marginBottom: '0.75rem' }}>
                <a href="#" style={{ color: 'white', opacity: 0.7, textDecoration: 'none', fontSize: '0.9rem', transition: 'opacity 0.2s' }}>{item}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>Resources</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['Guides and resources', 'Team', 'Tools', 'Support'].map(item => (
              <li key={item} style={{ marginBottom: '0.75rem' }}>
                <a href="#" style={{ color: 'white', opacity: 0.7, textDecoration: 'none', fontSize: '0.9rem', transition: 'opacity 0.2s' }}>{item}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.6 }}>© {new Date().getFullYear()} All Right Reserved</p>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', opacity: 0.6 }}>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

// --- HOME PAGE COMPONENT ---
const HomePage = ({ setPage, user }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const features = [
    { 
      icon: '☀️', 
      title: 'The Sun', 
      description: 'The Sun accounts for 99.86% of the mass in our solar system. If the Sun were as tall as a typical front door, Earth would be the size of a nickel.' 
    },
    { 
      icon: '🧬', 
      title: 'Human DNA', 
      description: 'If you stretched out all the DNA in your body, it would reach to the Sun and back over 300 times, or to Pluto and back 17 times.' 
    },
    { 
      icon: '🌊', 
      title: 'Ocean Depth', 
      description: 'The deepest part of the ocean, the Mariana Trench, is about 11 kilometers deep. If Mount Everest were placed there, its peak would still be over 2 kilometers underwater.' 
    },
    { 
      icon: '⚡', 
      title: 'Lightning Power', 
      description: 'A single bolt of lightning contains enough energy to toast 100,000 slices of bread and reaches temperatures of about 30,000°C, five times hotter than the surface of the Sun.' 
    },
    { 
      icon: '🧠', 
      title: 'Brain Capacity', 
      description: 'The human brain has about 86 billion neurons and can store an estimated 2.5 petabytes of information—equivalent to about 3 million hours of TV shows.' 
    },
    { 
      icon: '🌍', 
      title: 'Earth\'s Speed', 
      description: 'Earth rotates at approximately 1,670 kilometers per hour at the equator and orbits the Sun at around 107,000 kilometers per hour.' 
    },
    { 
      icon: '💎', 
      title: 'Diamond Planet', 
      description: 'There\'s a planet called 55 Cancri e that is twice the size of Earth and may be covered in graphite and diamonds. It orbits so close to its star that a year there lasts only 18 hours.' 
    },
    { 
      icon: '🦠', 
      title: 'Bacteria Count', 
      description: 'Your body contains about 39 trillion bacterial cells and only 30 trillion human cells, meaning you are technically more bacteria than human.' 
    },
    { 
      icon: '🌙', 
      title: 'Moon Distance', 
      description: 'The Moon is moving away from Earth at a rate of about 3.8 centimeters per year. In about 50 billion years, it will take 47 days to orbit Earth instead of the current 27.3 days.' 
    }
  ];

  const testimonials = [
    {
      name: 'Shreedhar K B',
      role: 'Student',
      initial: 'S',
      image: 'https://ui-avatars.com/api/?name=Shreedhar+KB&background=0E78FF&color=fff&size=200&bold=true',
      feedback: 'As an educator, Speechify has been a game-changer for my classroom. The teacher dashboard makes it incredibly easy to create and manage quizzes, and the real-time analytics help me understand each student\'s progress. Highly recommended for teachers!'
    },
    {
      name: 'Sarah Johnson',
      role: 'Student',
      initial: 'S',
      image: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=0E78FF&color=fff&size=200&bold=true',
      feedback: 'Speechify has transformed the way I study! The interactive quizzes helped me identify my weak areas, and the instant feedback kept me motivated. My grades have improved significantly since I started using this platform.'
    },
    {
      name: 'Michael Chen',
      role: 'Student',
      initial: 'M',
      image: 'https://ui-avatars.com/api/?name=Michael+Chen&background=0E78FF&color=fff&size=200&bold=true',
      feedback: 'The progress tracking feature is amazing! I can see exactly where I need to improve and the scientific facts section makes learning fun. This platform has everything I need for exam preparation.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Teacher',
      initial: 'E',
      image: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=0E78FF&color=fff&size=200&bold=true',
      feedback: 'Managing multiple classes has never been easier. The analytics dashboard gives me insights into student performance at a glance, and creating quizzes is intuitive. My students love the interactive format!'
    },
    {
      name: 'David Kumar',
      role: 'Student',
      initial: 'D',
      image: 'https://ui-avatars.com/api/?name=David+Kumar&background=0E78FF&color=fff&size=200&bold=true',
      feedback: 'Best quiz platform I\'ve used! The instant results and detailed feedback help me learn from my mistakes immediately. The interface is clean and easy to navigate.'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(features.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(features.length / 3)) % Math.ceil(features.length / 3));
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      {/* Hero Section with CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #0E78FF 0%, #0A4FB8 100%)',
        padding: '8rem 5%',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '900',
            color: 'white',
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em',
            textShadow: '0 4px 12px rgba(0,0,0,0.2)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            Master Your Knowledge with Speechify
          </h1>
          <p style={{
            fontSize: '1.375rem',
            color: 'rgba(255, 255, 255, 0.95)',
            maxWidth: '700px',
            margin: '0 auto 3rem',
            lineHeight: 1.7,
            fontWeight: '400',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            Your intelligent quiz platform for interactive learning, real-time analytics, and comprehensive assessment tools
          </p>
          <button
            onClick={() => setPage('signup')}
            style={{
              background: 'white',
              color: '#0E78FF',
              padding: '1.25rem 3rem',
              borderRadius: '12px',
              border: 'none',
              fontSize: '1.25rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
            }}
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* What is Speechify Section */}
      <section style={{
        background: '#F9FAFB',
        padding: '4rem 5%',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.75rem',
            fontWeight: '800',
            color: '#1E293B',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            What is Speechify?
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: '#64748B',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: 1.8,
            fontWeight: '400',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            Speechify is a cutting-edge quiz platform that transforms the way students learn and teachers assess. 
            With voice-enabled features, AI-powered grading, and comprehensive analytics, we make education more 
            interactive, efficient, and engaging for everyone.
          </p>
        </div>
      </section>

      {/* Carousel Section */}
      <section style={{
        padding: '5rem 5%',
        background: '#F9FAFB',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
          
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            style={{
              position: 'absolute',
              left: '-60px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
              border: 'none',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
              transition: 'all 0.3s ease',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(251, 191, 36, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.4)';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            style={{
              position: 'absolute',
              right: '-60px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
              border: 'none',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
              transition: 'all 0.3s ease',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(251, 191, 36, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.4)';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          {/* Feature Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2.5rem',
            marginBottom: '3rem'
          }}>
            {features.slice(currentSlide * 3, currentSlide * 3 + 3).map((feature, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  padding: '3rem 2rem',
                  borderRadius: '20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #E5E7EB',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                }}
              >
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '1.5rem',
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  color: '#1E293B',
                  marginBottom: '1rem',
                  letterSpacing: '-0.01em'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#64748B',
                  lineHeight: 1.7,
                  fontWeight: '400'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '2.5rem'
          }}>
            {Array.from({ length: Math.ceil(features.length / 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  width: currentSlide === index ? '40px' : '12px',
                  height: '12px',
                  borderRadius: '6px',
                  background: currentSlide === index 
                    ? 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' 
                    : '#D1D5DB',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: currentSlide === index ? '0 2px 8px rgba(251, 191, 36, 0.4)' : 'none'
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '5rem 5%',
        background: '#FFFFFF'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.75rem',
            fontWeight: '800',
            color: '#1E293B',
            textAlign: 'center',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            Features
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: '#64748B',
            textAlign: 'center',
            marginBottom: '4rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: '400'
          }}>
            Everything you need for effective learning and assessment
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '3rem'
          }}>
            {/* Interactive Quizzes */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                  <rect x="25" y="20" width="50" height="60" rx="5" fill="#0E78FF" stroke="#0A4FB8" strokeWidth="3"/>
                  <circle cx="50" cy="35" r="8" fill="#FCD34D"/>
                  <rect x="35" y="50" width="8" height="8" rx="2" fill="#FFFFFF" stroke="#0A4FB8" strokeWidth="2"/>
                  <rect x="35" y="62" width="8" height="8" rx="2" fill="#FFFFFF" stroke="#0A4FB8" strokeWidth="2"/>
                  <rect x="48" y="50" width="18" height="3" rx="1" fill="#FFFFFF"/>
                  <rect x="48" y="62" width="18" height="3" rx="1" fill="#FFFFFF"/>
                  <path d="M36 56 L38 54 L42 58" stroke="#10B981" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1E293B',
                marginBottom: '1rem',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '-0.01em'
              }}>
                Interactive Quizzes
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#64748B',
                lineHeight: 1.7,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: '400'
              }}>
                Engage with dynamic quizzes designed to test your knowledge and enhance learning outcomes.
              </p>
            </div>

            {/* Real-time Analytics */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="30" fill="#F0F9FF" stroke="#0E78FF" strokeWidth="3"/>
                  <rect x="38" y="55" width="6" height="20" rx="2" fill="#0E78FF"/>
                  <rect x="47" y="45" width="6" height="30" rx="2" fill="#FCD34D"/>
                  <rect x="56" y="38" width="6" height="37" rx="2" fill="#10B981"/>
                  <path d="M35 42 L45 35 L55 38 L65 30" stroke="#EF5350" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="35" cy="42" r="3" fill="#EF5350"/>
                  <circle cx="45" cy="35" r="3" fill="#EF5350"/>
                  <circle cx="55" cy="38" r="3" fill="#EF5350"/>
                  <circle cx="65" cy="30" r="3" fill="#EF5350"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1E293B',
                marginBottom: '1rem',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '-0.01em'
              }}>
                Real-time Analytics
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#64748B',
                lineHeight: 1.7,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: '400'
              }}>
                Track performance metrics and gain insights with comprehensive analytics dashboards.
              </p>
            </div>

            {/* Teacher Dashboard */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                  <rect x="20" y="25" width="60" height="50" rx="4" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="3"/>
                  <circle cx="50" cy="42" r="8" fill="#F59E0B"/>
                  <path d="M50 50 Q50 58, 42 58 L58 58 Q50 58, 50 50" fill="#F59E0B"/>
                  <rect x="28" y="62" width="44" height="3" rx="1" fill="#F59E0B"/>
                  <rect x="28" y="68" width="35" height="2" rx="1" fill="#F59E0B"/>
                  <path d="M75 30 L85 30 L80 40 Z" fill="#10B981"/>
                  <circle cx="80" cy="28" r="3" fill="#10B981"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1E293B',
                marginBottom: '1rem',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '-0.01em'
              }}>
                Teacher Dashboard
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#64748B',
                lineHeight: 1.7,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: '400'
              }}>
                Create, manage, and monitor quizzes with powerful tools designed for educators.
              </p>
            </div>

            {/* Instant Results */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                  <rect x="30" y="25" width="40" height="50" rx="4" fill="#ECFDF5" stroke="#10B981" strokeWidth="3"/>
                  <circle cx="50" cy="40" r="10" fill="#10B981"/>
                  <path d="M45 40 L48 43 L56 35" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="38" y="56" width="24" height="3" rx="1" fill="#10B981"/>
                  <rect x="38" y="62" width="18" height="2" rx="1" fill="#10B981"/>
                  <path d="M72 45 L78 45 L75 35 Z" fill="#FCD34D"/>
                  <path d="M72 45 L78 45 L75 55 Z" fill="#FCD34D"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1E293B',
                marginBottom: '1rem',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '-0.01em'
              }}>
                Instant Results
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#64748B',
                lineHeight: 1.7,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: '400'
              }}>
                Get immediate feedback with detailed scoring and performance breakdowns after each quiz.
              </p>
            </div>

            {/* Voice Answer Input */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="35" fill="#E8F2FF" stroke="#0E78FF" strokeWidth="3"/>
                  <rect x="45" y="30" width="10" height="25" rx="5" fill="#0E78FF"/>
                  <path d="M37 50 Q37 62, 50 62 Q63 62, 63 50" stroke="#0E78FF" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  <line x1="50" y1="62" x2="50" y2="70" stroke="#0E78FF" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="42" y1="70" x2="58" y2="70" stroke="#0E78FF" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="40" cy="45" r="3" fill="#EF5350">
                    <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="50" cy="40" r="3" fill="#EF5350">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="60" cy="45" r="3" fill="#EF5350">
                    <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
                  </circle>
                </svg>
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1E293B',
                marginBottom: '1rem',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '-0.01em'
              }}>
                Voice Answer Input
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#64748B',
                lineHeight: 1.7,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: '400'
              }}>
                Answer long questions using your voice with our speech-to-text feature for faster and more natural responses.
              </p>
            </div>

            {/* AI Smart Grading */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="35" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="3"/>
                  <path d="M35 50 L45 60 L65 35" stroke="#10B981" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="30" cy="30" r="8" fill="#E8F2FF" stroke="#0E78FF" strokeWidth="2"/>
                  <path d="M28 30 L30 32 L33 28" stroke="#0E78FF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="70" cy="70" r="8" fill="#E8F2FF" stroke="#0E78FF" strokeWidth="2"/>
                  <text x="70" y="74" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0E78FF">AI</text>
                  <path d="M25 65 Q20 55, 25 45" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M75 35 Q80 45, 75 55" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1E293B',
                marginBottom: '1rem',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '-0.01em'
              }}>
                AI Smart Grading
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#64748B',
                lineHeight: 1.7,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: '400'
              }}>
                Intelligent AI-powered grading system that evaluates answers accurately and provides detailed feedback instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Testimonials Section */}
      <section style={{
        padding: '5rem 5%',
        background: 'linear-gradient(135deg, #0E78FF 0%, #0A4FB8 100%)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          <h2 style={{
            fontSize: '2.75rem',
            fontWeight: '800',
            color: 'white',
            textAlign: 'center',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            What Our Community Says
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
            marginBottom: '4rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: '400'
          }}>
            Real feedback from students and teachers using Speechify
          </p>

          {/* Left Arrow */}
          <button
            onClick={prevTestimonial}
            style={{
              position: 'absolute',
              left: '-60px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={nextTestimonial}
            style={{
              position: 'absolute',
              right: '-60px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          {/* Testimonial Card */}
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '4rem 3rem',
            textAlign: 'left',
            maxWidth: '900px',
            margin: '0 auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            position: 'relative'
          }}>
            {/* SVG Quote Icon */}
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="#0E78FF" 
              style={{
                position: 'absolute',
                top: '2rem',
                left: '2rem',
                opacity: 0.2
              }}
            >
              <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
            </svg>

            {/* Feedback Text */}
            <div style={{
              fontSize: '1.125rem',
              color: '#475569',
              lineHeight: 1.8,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: '400',
              marginBottom: '2.5rem',
              paddingLeft: '1rem',
              paddingTop: '0.5rem',
              position: 'relative',
              zIndex: 1
            }}>
              {testimonials[currentTestimonial].feedback}
            </div>

            {/* User Info Section */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              paddingLeft: '1rem'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0E78FF 0%, #0A4FB8 100%)',
                padding: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1E293B',
                  marginBottom: '0.25rem',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '-0.01em'
                }}>
                  {testimonials[currentTestimonial].name}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#0E78FF',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontWeight: '600'
                }}>
                  {testimonials[currentTestimonial].role}
                </p>
              </div>
            </div>
          </div>

          {/* Pagination Dots */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '3rem'
          }}>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                style={{
                  width: currentTestimonial === index ? '32px' : '12px',
                  height: '12px',
                  borderRadius: '6px',
                  background: currentTestimonial === index ? 'white' : 'rgba(255, 255, 255, 0.4)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: 'none'
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '5rem 5%',
        background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            color: 'white',
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            Ready to Learn More?
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: '#CBD5E1',
            marginBottom: '3rem',
            lineHeight: 1.7,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: '400'
          }}>
            Join Speechify today and explore a world of knowledge through interactive quizzes and engaging content
          </p>
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setPage('signup')}
              style={{
                background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                color: '#1E293B',
                padding: '1rem 2.5rem',
                borderRadius: '12px',
                border: 'none',
                fontSize: '1.125rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(251, 191, 36, 0.4)',
                transition: 'all 0.3s ease',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(251, 191, 36, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(251, 191, 36, 0.4)';
              }}
            >
              Sign Up Now
            </button>
            <button
              onClick={() => setPage('login')}
              style={{
                background: 'transparent',
                color: 'white',
                padding: '1rem 2.5rem',
                borderRadius: '12px',
                border: '2px solid white',
                fontSize: '1.125rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#1E293B';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Login
            </button>
          </div>
        </div>
      </section>
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0E78FF 0%, #0A4FB8 100%)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '3rem 2.5rem', 
        maxWidth: '450px', 
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '72px', 
            height: '72px', 
            background: 'linear-gradient(135deg, #0E78FF 0%, #0A4FB8 100%)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '800', color: '#1E293B' }}>Welcome Back!</h1>
          <p style={{ color: '#64748B', fontSize: '1rem' }}>
            Login to Speechify to continue
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>Email Address</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              style={{ 
                width: '100%', 
                padding: '0.875rem 1rem', 
                border: '2px solid #E5E7EB', 
                borderRadius: '8px', 
                fontSize: '1rem',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6366F1'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              required 
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>Password</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password"
              style={{ 
                width: '100%', 
                padding: '0.875rem 1rem', 
                border: '2px solid #E5E7EB', 
                borderRadius: '8px', 
                fontSize: '1rem',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6366F1'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              required 
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', fontSize: '0.875rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#64748B' }}>
              <input type="checkbox" style={{ marginRight: '0.5rem' }} />
              Remember me
            </label>
            <a href="#" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: '600' }}>Forgot Password?</a>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginBottom: '1.5rem' }}>
            Login
          </button>
          
          <p style={{ textAlign: 'center', margin: 0, color: '#64748B', fontSize: '0.95rem' }}>
            New to Speechify? <a href="#" onClick={(e) => { e.preventDefault(); setPage('role-selection'); }} style={{ color: '#6366F1', textDecoration: 'none', fontWeight: '600' }}>Sign Up</a>
          </p>
        </form>
      </div>
    </div>
  );
};

// --- ROLE SELECTION PAGE COMPONENT ---
const RoleSelectionPage = ({ setPage }) => {
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [teacherData, setTeacherData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: ''
  });
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNo: '',
    branch: '',
    year: '',
    semester: ''
  });

  const handleStudentSelection = () => {
    setShowStudentForm(true);
  };

  const handleTeacherSelection = () => {
    setShowTeacherForm(true);
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    
    // Check if passwords match
    if (teacherData.password !== teacherData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: teacherData.name, 
          email: teacherData.email, 
          password: teacherData.password, 
          role: 'teacher',
          department: teacherData.department
        }),
      });
      
      if (response.ok) {
        alert('Teacher registration successful! Please log in.');
        setPage('login');
      } else {
        const errorData = await response.json();
        alert(`Registration failed: ${errorData.msg}`);
      }
    } catch (error) {
      alert('Registration failed. Could not connect to the server.');
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    
    // Check if passwords match
    if (studentData.password !== studentData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: studentData.name, 
          email: studentData.email, 
          password: studentData.password, 
          role: 'student',
          rollNo: studentData.rollNo,
          branch: studentData.branch,
          year: studentData.year,
          semester: studentData.semester
        }),
      });
      
      if (response.ok) {
        alert('Student registration successful! Please log in.');
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
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0E78FF 0%, #0A4FB8 100%)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem',
      overflow: 'hidden'
    }}>
      <div style={{ 
        display: 'flex',
        flexDirection: showStudentForm ? 'row-reverse' : 'row',
        background: 'white', 
        borderRadius: '20px', 
        maxWidth: (showTeacherForm || showStudentForm) ? '1200px' : '700px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative',
        transition: 'all 0.5s ease',
        overflow: 'hidden',
        minHeight: '600px'
      }}>
        {/* Left/Right Side - Role Selection */}
        <div style={{ 
          flex: (showTeacherForm || showStudentForm) ? '0 0 45%' : '1',
          padding: '3rem 2.5rem',
          transition: 'all 0.5s ease',
          position: 'relative'
        }}>
          {/* Close button */}
          <button 
            onClick={() => {
              if (showTeacherForm) setShowTeacherForm(false);
              else if (showStudentForm) setShowStudentForm(false);
              else setPage('home');
            }}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F1F5F9';
              e.currentTarget.style.color = '#1E293B';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#64748B';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <h1 style={{ 
            fontSize: (showTeacherForm || showStudentForm) ? '1.75rem' : '2.25rem', 
            fontWeight: '800', 
            color: '#1E293B', 
            marginBottom: '3rem',
            textAlign: 'center',
            letterSpacing: '-0.02em',
            transition: 'all 0.5s ease'
          }}>
            Sign in to Your Account
          </h1>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: (showTeacherForm || showStudentForm) ? '1fr' : 'repeat(2, 1fr)', 
            gap: '2rem', 
            marginBottom: '3rem',
            transition: 'all 0.5s ease'
          }}>
            {/* Teacher Card */}
            <div style={{ display: showStudentForm ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{
                width: showTeacherForm ? '100px' : '140px',
                height: showTeacherForm ? '100px' : '140px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #C2E7FF 0%, #A5D8FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0E78FF',
                transition: 'all 0.5s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <svg width={showTeacherForm ? "50" : "70"} height={showTeacherForm ? "50" : "70"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                  <path d="M14 14h3"></path>
                  <path d="M14 18h2"></path>
                </svg>
              </div>
              <button 
                onClick={handleTeacherSelection}
                disabled={showTeacherForm}
                style={{
                  width: '100%',
                  padding: '1rem 2rem',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: showTeacherForm ? 'default' : 'pointer',
                  background: showTeacherForm ? '#94A3B8' : '#0E78FF',
                  color: 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Inter, sans-serif',
                  opacity: showTeacherForm ? 0.6 : 1
                }}
              >
                I am a Teacher
              </button>
            </div>

            {/* Student Card */}
            {!showTeacherForm && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{
                  width: showStudentForm ? '100px' : '140px',
                  height: showStudentForm ? '100px' : '140px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C2E7FF 0%, #A5D8FF 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0E78FF',
                  transition: 'all 0.5s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <svg width={showStudentForm ? "50" : "70"} height={showStudentForm ? "50" : "70"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <button 
                  onClick={handleStudentSelection}
                  disabled={showStudentForm}
                  style={{
                    width: '100%',
                    padding: '1rem 2rem',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: showStudentForm ? 'default' : 'pointer',
                    background: showStudentForm ? '#94A3B8' : '#0E78FF',
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    fontFamily: 'Inter, sans-serif',
                    opacity: showStudentForm ? 0.6 : 1
                  }}
                >
                  I am a Student
                </button>
              </div>
            )}
          </div>

          {!(showTeacherForm || showStudentForm) && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <p style={{ color: '#64748B', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                Haven't signed into your Scholastic account before?
              </p>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setPage('signup'); }}
                style={{ 
                  display: 'inline-block',
                  color: '#0E78FF', 
                  fontWeight: '600', 
                  textDecoration: 'none',
                  fontSize: '1rem',
                  marginBottom: '1.5rem',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#0C5FD1';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#0E78FF';
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                Create an account
              </a>
              
              <div style={{ height: '1px', background: '#E2E8F0', margin: '2rem 0' }}></div>
              
              <p style={{ color: '#1E293B', fontSize: '0.95rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                Teachers, not yet a subscriber?
              </p>
              <a 
                href="#"
                style={{ 
                  display: 'inline-block',
                  color: '#0E78FF', 
                  fontWeight: '600', 
                  textDecoration: 'none',
                  fontSize: '1rem',
                  marginBottom: '1rem',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#0C5FD1';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#0E78FF';
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                Subscribe now
              </a>
              
              <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Subscribers receive access to the website and print magazine.
              </p>
            </div>
          )}
        </div>

        {/* Right Side - Teacher Registration Form */}
        {showTeacherForm && (
          <div style={{ 
            flex: '0 0 55%',
            padding: '3rem 2.5rem',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
            borderLeft: '1px solid #E2E8F0',
            animation: 'slideInRight 0.5s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <h2 style={{ 
              fontSize: '1.75rem', 
              fontWeight: '800', 
              color: '#1E293B', 
              marginBottom: '0.5rem',
              textAlign: 'center'
            }}>
              Teacher Registration
            </h2>
            <p style={{ 
              color: '#64748B', 
              fontSize: '0.95rem', 
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              Fill in your details to create an account
            </p>

            <form onSubmit={handleTeacherSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label htmlFor="teacher-name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>
                  Name
                </label>
                <input 
                  type="text" 
                  id="teacher-name" 
                  value={teacherData.name}
                  onChange={(e) => setTeacherData({...teacherData, name: e.target.value})}
                  placeholder="Enter your full name"
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.875rem 1rem', 
                    border: '2px solid #E5E7EB', 
                    borderRadius: '8px', 
                    fontSize: '1rem',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'border 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0E78FF'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              <div>
                <label htmlFor="teacher-email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>
                  Email
                </label>
                <input 
                  type="email" 
                  id="teacher-email" 
                  value={teacherData.email}
                  onChange={(e) => setTeacherData({...teacherData, email: e.target.value})}
                  placeholder="Enter your email address"
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.875rem 1rem', 
                    border: '2px solid #E5E7EB', 
                    borderRadius: '8px', 
                    fontSize: '1rem',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'border 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0E78FF'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              <div>
                <label htmlFor="teacher-password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>
                  Password
                </label>
                <input 
                  type="password" 
                  id="teacher-password" 
                  value={teacherData.password}
                  onChange={(e) => setTeacherData({...teacherData, password: e.target.value})}
                  placeholder="Create a strong password"
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.875rem 1rem', 
                    border: '2px solid #E5E7EB', 
                    borderRadius: '8px', 
                    fontSize: '1rem',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'border 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0E78FF'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              <div>
                <label htmlFor="teacher-confirm-password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>
                  Confirm Password
                </label>
                <input 
                  type="password" 
                  id="teacher-confirm-password" 
                  value={teacherData.confirmPassword}
                  onChange={(e) => setTeacherData({...teacherData, confirmPassword: e.target.value})}
                  placeholder="Re-enter your password"
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.875rem 1rem', 
                    border: '2px solid #E5E7EB', 
                    borderRadius: '8px', 
                    fontSize: '1rem',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'border 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0E78FF'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              <div>
                <label htmlFor="teacher-department" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>
                  Department
                </label>
                <select 
                  id="teacher-department" 
                  value={teacherData.department}
                  onChange={(e) => setTeacherData({...teacherData, department: e.target.value})}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.875rem 1rem', 
                    border: '2px solid #E5E7EB', 
                    borderRadius: '8px', 
                    fontSize: '1rem',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'border 0.2s',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0E78FF'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                >
                  <option value="">Select your department</option>
                  <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                  <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                  <option value="Data Science and Artificial Intelligence">Data Science and Artificial Intelligence</option>
                  <option value="Arts, Science, and Design">Arts, Science, and Design</option>
                </select>
              </div>

              <button 
                type="submit"
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: '#0E78FF',
                  color: 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Inter, sans-serif',
                  marginTop: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0C5FD1';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px -2px rgba(14, 120, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0E78FF';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                Register as Teacher
              </button>
            </form>
          </div>
        )}

        {/* Student Registration Form - Slides from left */}
        {showStudentForm && (
          <div style={{ 
            flex: '0 0 55%',
            padding: '3rem 2.5rem',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
            borderRight: showStudentForm ? '1px solid #E2E8F0' : 'none',
            animation: 'slideInLeft 0.5s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            overflowY: 'auto'
          }}>
            <h2 style={{ 
              fontSize: '1.75rem', 
              fontWeight: '800', 
              color: '#1E293B', 
              marginBottom: '0.5rem',
              textAlign: 'center'
            }}>
              Student Registration
            </h2>
            <p style={{ 
              color: '#64748B', 
              fontSize: '0.95rem', 
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              Fill in your details to create an account
            </p>

            <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label htmlFor="student-name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>
                  Name
                </label>
                <input 
                  type="text" 
                  id="student-name" 
                  value={studentData.name}
                  onChange={(e) => setStudentData({...studentData, name: e.target.value})}
                  placeholder="Enter your full name"
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem 1rem', 
                    border: '2px solid #E5E7EB', 
                    borderRadius: '8px', 
                    fontSize: '0.95rem',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'border 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0E78FF'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              <div>
                <label htmlFor="student-email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>
                  Email
                </label>
                <input 
                  type="email" 
                  id="student-email" 
                  value={studentData.email}
                  onChange={(e) => setStudentData({...studentData, email: e.target.value})}
                  placeholder="Enter your email address"
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem 1rem', 
                    border: '2px solid #E5E7EB', 
                    borderRadius: '8px', 
                    fontSize: '0.95rem',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'border 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0E78FF'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label htmlFor="student-password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>
                    Password
                  </label>
                  <input 
                    type="password" 
                    id="student-password" 
                    value={studentData.password}
                    onChange={(e) => setStudentData({...studentData, password: e.target.value})}
                    placeholder="Create password"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem 1rem', 
                      border: '2px solid #E5E7EB', 
                      borderRadius: '8px', 
                      fontSize: '0.95rem',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'border 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0E78FF'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>

                <div>
                  <label htmlFor="student-confirm-password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>
                    Confirm Password
                  </label>
                  <input 
                    type="password" 
                    id="student-confirm-password" 
                    value={studentData.confirmPassword}
                    onChange={(e) => setStudentData({...studentData, confirmPassword: e.target.value})}
                    placeholder="Re-enter password"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem 1rem', 
                      border: '2px solid #E5E7EB', 
                      borderRadius: '8px', 
                      fontSize: '0.95rem',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'border 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0E78FF'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="student-roll" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>
                  Roll No.
                </label>
                <input 
                  type="text" 
                  id="student-roll" 
                  value={studentData.rollNo}
                  onChange={(e) => setStudentData({...studentData, rollNo: e.target.value})}
                  placeholder="Enter your roll number"
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem 1rem', 
                    border: '2px solid #E5E7EB', 
                    borderRadius: '8px', 
                    fontSize: '0.95rem',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'border 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0E78FF'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              <div>
                <label htmlFor="student-branch" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>
                  Branch
                </label>
                <select 
                  id="student-branch" 
                  value={studentData.branch}
                  onChange={(e) => setStudentData({...studentData, branch: e.target.value})}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem 1rem', 
                    border: '2px solid #E5E7EB', 
                    borderRadius: '8px', 
                    fontSize: '0.95rem',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'border 0.2s',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0E78FF'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                >
                  <option value="">Select your branch</option>
                  <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                  <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                  <option value="Data Science and Artificial Intelligence">Data Science and Artificial Intelligence</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label htmlFor="student-year" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>
                    Year
                  </label>
                  <select 
                    id="student-year" 
                    value={studentData.year}
                    onChange={(e) => setStudentData({...studentData, year: e.target.value})}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem 1rem', 
                      border: '2px solid #E5E7EB', 
                      borderRadius: '8px', 
                      fontSize: '0.95rem',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'border 0.2s',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0E78FF'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  >
                    <option value="">Select year</option>
                    <option value="1st year">1st year</option>
                    <option value="2nd year">2nd year</option>
                    <option value="3rd year">3rd year</option>
                    <option value="4th year">4th year</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="student-semester" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>
                    Semester
                  </label>
                  <select 
                    id="student-semester" 
                    value={studentData.semester}
                    onChange={(e) => setStudentData({...studentData, semester: e.target.value})}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem 1rem', 
                      border: '2px solid #E5E7EB', 
                      borderRadius: '8px', 
                      fontSize: '0.95rem',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'border 0.2s',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0E78FF'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  >
                    <option value="">Select semester</option>
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                    <option value="V">V</option>
                    <option value="VI">VI</option>
                    <option value="VII">VII</option>
                    <option value="VIII">VIII</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: '#0E78FF',
                  color: 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Inter, sans-serif',
                  marginTop: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0C5FD1';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px -2px rgba(14, 120, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0E78FF';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                Register as Student
              </button>
            </form>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

// --- SIGNUP PAGE COMPONENT ---
const SignupPage = ({ setPage }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  
  // Get the selected role from localStorage if it exists
  useEffect(() => {
    const selectedRole = localStorage.getItem('selectedRole');
    if (selectedRole) {
      setRole(selectedRole);
      // Clear the stored role after using it
      localStorage.removeItem('selectedRole');
    }
  }, []);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0E78FF 0%, #0A4FB8 100%)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '3rem 2.5rem', 
        maxWidth: '500px', 
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '72px', 
            height: '72px', 
            background: 'linear-gradient(135deg, #0E78FF 0%, #0A4FB8 100%)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '800', color: '#1E293B' }}>Create Account</h1>
          <p style={{ color: '#64748B', fontSize: '1rem' }}>
            Join Speechify to get started
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>Full Name</label>
            <input 
              type="text" 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter your full name"
              style={{ 
                width: '100%', 
                padding: '0.875rem 1rem', 
                border: '2px solid #E5E7EB', 
                borderRadius: '8px', 
                fontSize: '1rem',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6366F1'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              required 
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>Email Address</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              style={{ 
                width: '100%', 
                padding: '0.875rem 1rem', 
                border: '2px solid #E5E7EB', 
                borderRadius: '8px', 
                fontSize: '1rem',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6366F1'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              required 
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>Password</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Create a password (min. 8 characters)"
              style={{ 
                width: '100%', 
                padding: '0.875rem 1rem', 
                border: '2px solid #E5E7EB', 
                borderRadius: '8px', 
                fontSize: '1rem',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6366F1'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              required 
            />
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>Account Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                border: `2px solid ${role === 'student' ? '#6366F1' : '#E5E7EB'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                background: role === 'student' ? '#EEF2FF' : 'white',
                transition: 'all 0.2s ease',
                fontWeight: 600,
                color: role === 'student' ? '#6366F1' : '#64748B'
              }}>
                <input 
                  type="radio" 
                  value="student" 
                  checked={role === 'student'} 
                  onChange={(e) => setRole(e.target.value)}
                  style={{ marginRight: '0.5rem', accentColor: '#6366F1' }}
                />
                Student
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                border: `2px solid ${role === 'teacher' ? '#6366F1' : '#E5E7EB'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                background: role === 'teacher' ? '#EEF2FF' : 'white',
                transition: 'all 0.2s ease',
                fontWeight: 600,
                color: role === 'teacher' ? '#6366F1' : '#64748B'
              }}>
                <input 
                  type="radio" 
                  value="teacher" 
                  checked={role === 'teacher'} 
                  onChange={(e) => setRole(e.target.value)}
                  style={{ marginRight: '0.5rem', accentColor: '#6366F1' }}
                />
                Teacher
              </label>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginBottom: '1.5rem' }}>
            Create Account
          </button>
          
          <p style={{ textAlign: 'center', margin: 0, color: '#64748B', fontSize: '0.95rem' }}>
            Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setPage('login'); }} style={{ color: '#6366F1', textDecoration: 'none', fontWeight: '600' }}>Login</a>
          </p>
        </form>
      </div>
    </div>
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
    // Redirect teachers directly to dashboard, students go to home
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
    }
  };

  // Check if current page is student dashboard or teacher dashboard
  const isStudentDashboard = (page === 'dashboard' && user?.role === 'student') || (page === 'home' && user?.role === 'student') || (page === 'quiz');
  const isTeacherDashboard = (page === 'dashboard' && user?.role === 'teacher') || (page === 'home' && user?.role === 'teacher');
  const hideNavbarAndFooter = isStudentDashboard || isTeacherDashboard;

  return (
    <>
      <GlobalStyles />
      {!hideNavbarAndFooter && <Navbar setPage={setPage} user={user} onLogout={handleLogout} />}
      <main style={hideNavbarAndFooter ? { padding: 0, margin: 0 } : {}}>
        {renderPage()}
      </main>
      {!hideNavbarAndFooter && <Footer />}
    </>
  );
}

