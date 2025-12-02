import React, { useState } from 'react';

// The HomePage receives the 'setPage' function as a prop to navigate to the quiz.
export default function HomePage({ setPage, user }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      icon: '☀️',
      title: 'The Sun',
      description: 'The Sun accounts for 99.86% of the mass in our solar system. It would take 1.3 million Earths to fill the volume of the Sun.'
    },
    {
      icon: '🧬',
      title: 'Human DNA',
      description: 'If you stretched out all the DNA in your body, it would reach from the Sun to Pluto and back - about 17 times. Each cell contains about 2 meters of DNA.'
    },
    {
      icon: '🌊',
      title: 'Ocean Depth',
      description: 'The deepest part of the ocean, the Mariana Trench, is about 11,000 meters deep. If Mount Everest were placed in it, the peak would still be over 2 kilometers underwater.'
    },
    {
      icon: '⚡',
      title: 'Lightning Power',
      description: 'A single lightning bolt carries enough energy to toast 100,000 slices of bread and can heat the air around it to 30,000°C - five times hotter than the surface of the sun.'
    },
    {
      icon: '🧠',
      title: 'Brain Capacity',
      description: 'The human brain has about 86 billion neurons and can store approximately 2.5 petabytes of information - equivalent to 3 million hours of TV shows.'
    },
    {
      icon: '🌍',
      title: 'Earth\'s Speed',
      description: 'Earth rotates at about 1,670 km/h at the equator and orbits the Sun at 107,000 km/h. We\'re traveling through space faster than you think!'
    },
    {
      icon: '💎',
      title: 'Diamond Planet',
      description: 'Scientists discovered a planet called 55 Cancri e that is twice the size of Earth and may be covered in graphite and diamond instead of water and granite.'
    },
    {
      icon: '🦠',
      title: 'Bacteria Count',
      description: 'There are more bacteria cells in your body than human cells. The average human body contains about 39 trillion bacterial cells and only 30 trillion human cells.'
    },
    {
      icon: '🌙',
      title: 'Moon Distance',
      description: 'The Moon is slowly moving away from Earth at a rate of 3.8 cm per year. In 50 billion years, it will take 47 days to orbit Earth instead of the current 27.3 days.'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(features.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(features.length / 3)) % Math.ceil(features.length / 3));
  };

  const visibleFeatures = features.slice(currentSlide * 3, currentSlide * 3 + 3);

  return (
    <div className="page-container">
      {/* What is Speechify Section */}
      <div className="hero-section" style={{ 
        background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
        padding: '4rem 2rem',
        borderRadius: '20px',
        marginBottom: '3rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '800', 
            marginBottom: '1rem', 
            color: '#1E293B',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            What is Speechify<sup style={{ fontSize: '1.5rem' }}>®</sup>?
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#334155', 
            maxWidth: '800px', 
            margin: '0 auto',
            lineHeight: '1.8',
            fontWeight: '500'
          }}>
            Explore fascinating facts about science, space, and nature that will expand your knowledge and spark curiosity.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          left: '-50px',
          top: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          right: '-80px',
          bottom: '-80px',
          width: '250px',
          height: '250px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '50%',
          filter: 'blur(70px)'
        }}></div>
      </div>

      {/* Feature Carousel */}
      <div style={{ position: 'relative', margin: '0 auto', maxWidth: '1200px' }}>
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          style={{
            position: 'absolute',
            left: '-60px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: '2px solid #E5E7EB',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: '#6366F1',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            zIndex: 10
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#6366F1';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#6366F1';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          ‹
        </button>

        <button
          onClick={nextSlide}
          style={{
            position: 'absolute',
            right: '-60px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: '2px solid #E5E7EB',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: '#6366F1',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            zIndex: 10
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#6366F1';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#6366F1';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          ›
        </button>

        {/* Feature Cards */}
        <div className="features-grid">
          {visibleFeatures.map((feature, index) => (
            <div key={index} className="feature-card" style={{
              background: 'white',
              padding: '2.5rem',
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              textAlign: 'center',
              minHeight: '320px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start'
            }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1.5rem',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              }}>
                {feature.icon}
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700',
                marginBottom: '1rem',
                color: '#1E293B'
              }}>
                {feature.title}
              </h3>
              <p style={{ 
                color: '#64748B', 
                fontSize: '1rem',
                lineHeight: '1.7',
                margin: 0
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
          gap: '0.75rem', 
          marginTop: '3rem' 
        }}>
          {[...Array(Math.ceil(features.length / 3))].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: currentSlide === index ? '32px' : '12px',
                height: '12px',
                borderRadius: '6px',
                border: 'none',
                background: currentSlide === index ? '#FCD34D' : '#E5E7EB',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem', color: '#1E293B' }}>
          Ready to Get Started?
        </h2>
        <p style={{ fontSize: '1.125rem', color: '#64748B', marginBottom: '2rem' }}>
          Join thousands of educators and students using Speechify
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn" 
            style={{ 
              padding: '1rem 2.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.3s ease'
            }} 
            onClick={() => setPage('signup')}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
            }}
          >
            Sign Up Now
          </button>
          <button 
            className="btn" 
            style={{ 
              padding: '1rem 2.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              background: 'white',
              color: '#6366F1',
              border: '2px solid #6366F1',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }} 
            onClick={() => setPage('login')}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#EFF6FF';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Login
          </button>
        </div>
      </div>

      <style>{`
        .page-container {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12) !important;
          border-color: #6366F1 !important;
        }

        @media (max-width: 968px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .page-container {
            padding: 1rem;
          }
          
          button[style*="position: absolute"] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
