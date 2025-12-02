import React from 'react';

const QuizEventCard = ({ quizEvent, onParticipate }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return {
          bgColor: '#D1FAE5',
          textColor: '#065F46',
          iconColor: '#10B981',
          text: '● Active',
          gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
        };
      case 'upcoming':
        return {
          bgColor: '#DBEAFE',
          textColor: '#1E40AF',
          iconColor: '#3B82F6',
          text: '● Upcoming',
          gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
        };
      default:
        return {
          bgColor: '#F3F4F6',
          textColor: '#6B7280',
          iconColor: '#9CA3AF',
          text: `● ${status}`,
          gradient: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
        };
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const status = getStatusConfig(quizEvent.status);
  const isActive = quizEvent.status === 'active';

  return (
    <div 
      style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '1.75rem', 
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        transition: 'all 0.3s',
        cursor: isActive ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        if (isActive) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 24px rgba(14,120,255,0.15)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
      }}
    >
      {/* Top accent bar */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '4px', 
        background: status.gradient 
      }}></div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <h3 style={{ 
          fontSize: '1.375rem', 
          fontWeight: '700', 
          color: '#1E293B', 
          margin: 0,
          flex: 1,
          lineHeight: '1.4'
        }}>
          {quizEvent.title}
        </h3>
        <span style={{ 
          padding: '0.5rem 1rem', 
          borderRadius: '20px', 
          fontSize: '0.875rem', 
          fontWeight: '600',
          background: status.bgColor,
          color: status.textColor,
          whiteSpace: 'nowrap',
          marginLeft: '1rem'
        }}>
          {status.text}
        </span>
      </div>

      {/* Content */}
      <div style={{ marginBottom: '1.5rem' }}>
        {/* Subject */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.875rem' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            background: '#E8F2FF', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginRight: '0.75rem'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E78FF" strokeWidth="2.5">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '500', marginBottom: '0.125rem' }}>Subject</div>
            <div style={{ fontSize: '0.9375rem', color: '#1E293B', fontWeight: '600' }}>{quizEvent.subject}</div>
          </div>
        </div>

        {/* Start Time */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.875rem' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            background: '#D1FAE5', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginRight: '0.75rem'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '500', marginBottom: '0.125rem' }}>Starts</div>
            <div style={{ fontSize: '0.9375rem', color: '#1E293B', fontWeight: '600' }}>{formatTime(quizEvent.startTime)}</div>
          </div>
        </div>

        {/* End Time */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.875rem' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            background: '#FEE2E2', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginRight: '0.75rem'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '500', marginBottom: '0.125rem' }}>Ends</div>
            <div style={{ fontSize: '0.9375rem', color: '#1E293B', fontWeight: '600' }}>{formatTime(quizEvent.endTime)}</div>
          </div>
        </div>

        {/* Time Remaining (Active) */}
        {isActive && quizEvent.timeRemaining && (
          <div style={{ 
            marginTop: '1.25rem',
            padding: '1.25rem', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
            border: '2px solid #BBF7D0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#065F46' }}>⏱️ Time Remaining</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10B981' }}>
                {Math.floor(quizEvent.timeRemaining / 60)}h {quizEvent.timeRemaining % 60}m
              </span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: '#E5E7EB', 
              borderRadius: '4px', 
              overflow: 'hidden' 
            }}>
              <div style={{ 
                height: '100%', 
                background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                width: `${Math.min(100, Math.max(0, (quizEvent.timeRemaining / (24 * 60)) * 100))}%`,
                transition: 'width 0.3s ease',
                borderRadius: '4px'
              }}></div>
            </div>
          </div>
        )}

        {/* Starts In (Upcoming) */}
        {quizEvent.status === 'upcoming' && quizEvent.startsIn && (
          <div style={{ 
            marginTop: '1.25rem',
            padding: '1.25rem', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            border: '2px solid #BFDBFE'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E40AF' }}>🕐 Starts in</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#3B82F6' }}>
                {quizEvent.startsIn.hours}h {quizEvent.startsIn.minutes}m
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={() => isActive && onParticipate(quizEvent)}
        disabled={!isActive}
        style={{ 
          width: '100%', 
          padding: '0.875rem', 
          borderRadius: '10px', 
          fontSize: '1rem',
          fontWeight: '700',
          border: 'none',
          cursor: isActive ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          background: isActive 
            ? 'linear-gradient(135deg, #0E78FF 0%, #0A4FB8 100%)'
            : '#F3F4F6',
          color: isActive ? 'white' : '#9CA3AF',
          boxShadow: isActive ? '0 4px 12px rgba(14,120,255,0.3)' : 'none',
          transform: 'scale(1)'
        }}
        onMouseEnter={(e) => {
          if (isActive) {
            e.target.style.transform = 'scale(1.02)';
            e.target.style.boxShadow = '0 6px 16px rgba(14,120,255,0.4)';
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          if (isActive) {
            e.target.style.boxShadow = '0 4px 12px rgba(14,120,255,0.3)';
          }
        }}
      >
        {isActive ? '🚀 Start Quiz Now' : '🔒 Coming Soon'}
      </button>
    </div>
  );
};

export default QuizEventCard;
