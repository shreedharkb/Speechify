import React, { useState, useEffect } from 'react';

function StudentResponses({ quizId, quizTitle, onBack }) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAttempts();
  }, [quizId]);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/quiz-attempt/quiz/${quizId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Convert numeric strings to numbers
        const normalizedAttempts = (data.attempts || []).map(attempt => ({
          ...attempt,
          score: parseFloat(attempt.score) || 0,
          answers: (attempt.answers || []).map(answer => ({
            ...answer,
            pointsEarned: parseFloat(answer.pointsEarned) || 0,
            maxPoints: parseFloat(answer.maxPoints) || 10,
            similarityScore: parseFloat(answer.similarityScore) || 0
          }))
        }));
        setAttempts(normalizedAttempts);
      } else {
        setError('Failed to fetch student responses');
      }
    } catch (error) {
      console.error('Error fetching attempts:', error);
      setError('Error loading student responses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '2rem',
        textAlign: 'center',
        color: '#6B7280'
      }}>
        Loading student responses...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '2rem',
        textAlign: 'center',
        color: '#EF4444'
      }}>
        {error}
      </div>
    );
  }

  if (selectedAttempt) {
    return (
      <div style={{ padding: '2rem' }}>
        {/* Back Button */}
        <button
          onClick={() => setSelectedAttempt(null)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#F3F4F6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to List
        </button>

        {/* Student Info Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0E78FF 0%, #0056CC 100%)',
          padding: '2rem',
          borderRadius: '12px',
          color: 'white',
          marginBottom: '2rem'
        }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>
            {selectedAttempt.studentName}
          </h2>
          {selectedAttempt.studentEmail && (
            <p style={{ margin: '0 0 1rem 0', opacity: 0.9, fontSize: '0.875rem' }}>
              {selectedAttempt.studentEmail}
            </p>
          )}
          <div style={{ 
            display: 'flex', 
            gap: '2rem',
            fontSize: '0.875rem'
          }}>
            <div>
              <strong>Score:</strong> {(parseFloat(selectedAttempt.score) || 0).toFixed(2)} points
            </div>
            <div>
              <strong>Submitted:</strong> {new Date(selectedAttempt.submittedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Detailed Answers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {selectedAttempt.answers && selectedAttempt.answers.length > 0 ? (
            selectedAttempt.answers.map((answer, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  border: `2px solid ${answer.isCorrect ? '#10B981' : '#F59E0B'}`,
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Question Number & Status */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{ 
                    margin: 0,
                    fontSize: '1.125rem',
                    color: '#111827',
                    fontWeight: '600'
                  }}>
                    Question {index + 1}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <span style={{
                      padding: '0.375rem 0.875rem',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      background: answer.isCorrect ? '#D1FAE5' : '#FEF3C7',
                      color: answer.isCorrect ? '#065F46' : '#92400E'
                    }}>
                      {answer.isCorrect ? '✓ Correct' : '⚠ Partial/Incorrect'}
                    </span>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#6B7280'
                    }}>
                      {(parseFloat(answer.pointsEarned) || 0).toFixed(2)} / {parseFloat(answer.maxPoints) || 10} pts
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ 
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.5rem'
                  }}>
                    Question
                  </div>
                  <p style={{ 
                    margin: 0,
                    color: '#374151',
                    lineHeight: '1.6',
                    fontSize: '0.9375rem'
                  }}>
                    {answer.question}
                  </p>
                </div>

                {/* Student's Answer */}
                <div style={{ 
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: '#F9FAFB',
                  borderRadius: '8px',
                  borderLeft: '3px solid #3B82F6'
                }}>
                  <div style={{ 
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.5rem'
                  }}>
                    Student's Answer
                  </div>
                  <p style={{ 
                    margin: 0,
                    color: '#1F2937',
                    lineHeight: '1.6',
                    fontSize: '0.9375rem'
                  }}>
                    {answer.studentAnswer}
                  </p>
                </div>

                {/* Correct Answer */}
                <div style={{ 
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: '#F0FDF4',
                  borderRadius: '8px',
                  borderLeft: '3px solid #10B981'
                }}>
                  <div style={{ 
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.5rem'
                  }}>
                    Correct Answer
                  </div>
                  <p style={{ 
                    margin: 0,
                    color: '#065F46',
                    lineHeight: '1.6',
                    fontSize: '0.9375rem'
                  }}>
                    {answer.correctAnswer}
                  </p>
                </div>

                {/* AI Similarity Score */}
                {answer.similarityScore !== undefined && (
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                      <path d="M12 2v20M2 12h20"/>
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: '#6B7280',
                        marginBottom: '0.25rem'
                      }}>
                        AI Similarity Score
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        {((parseFloat(answer.similarityScore) || 0) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div style={{
                      width: '100px',
                      height: '6px',
                      background: '#E5E7EB',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(parseFloat(answer.similarityScore) || 0) * 100}%`,
                        height: '100%',
                        background: (parseFloat(answer.similarityScore) || 0) >= 0.7 ? '#10B981' : '#F59E0B',
                        borderRadius: '3px'
                      }}/>
                    </div>
                  </div>
                )}

                {/* Explanation if available */}
                {answer.explanation && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.875rem',
                    background: '#FEF3C7',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#78350F',
                    lineHeight: '1.5'
                  }}>
                    <strong>AI Explanation:</strong> {answer.explanation}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center',
              padding: '2rem',
              color: '#6B7280'
            }}>
              No answers recorded
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={onBack}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#F3F4F6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Quizzes
        </button>
        
        <h1 style={{ 
          margin: '0 0 0.5rem 0',
          fontSize: '2rem',
          fontWeight: '700',
          color: '#111827'
        }}>
          Student Responses
        </h1>
        <p style={{
          margin: 0,
          fontSize: '1rem',
          color: '#6B7280'
        }}>
          {quizTitle}
        </p>
      </div>

      {/* Summary Stats */}
      {attempts.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
              Total Submissions
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#0E78FF' }}>
              {attempts.length}
            </div>
          </div>
          
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
              Average Score
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
              {attempts.length > 0 
                ? (attempts.reduce((sum, a) => sum + (parseFloat(a.score) || 0), 0) / attempts.length).toFixed(1)
                : '0.0'}
            </div>
          </div>
        </div>
      )}

      {/* Student Attempts List */}
      {attempts.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#6B7280',
          border: '2px dashed #E5E7EB'
        }}>
          <svg 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#D1D5DB" 
            strokeWidth="2"
            style={{ margin: '0 auto 1rem' }}
          >
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#374151' }}>
            No submissions yet
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            Student responses will appear here once they submit the quiz
          </p>
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            padding: '1rem 1.5rem',
            background: '#F9FAFB',
            borderBottom: '1px solid #E5E7EB',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <div>Student</div>
            <div>Score</div>
            <div>Submitted</div>
            <div>Actions</div>
          </div>

          {/* Table Body */}
          {attempts.map((attempt, index) => (
            <div
              key={attempt.attemptId || index}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                padding: '1rem 1.5rem',
                borderBottom: index < attempts.length - 1 ? '1px solid #F3F4F6' : 'none',
                alignItems: 'center',
                transition: 'background 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <div>
                <div style={{ 
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.25rem'
                }}>
                  {attempt.studentName}
                </div>
                {attempt.studentEmail && (
                  <div style={{ 
                    fontSize: '0.8125rem',
                    color: '#6B7280'
                  }}>
                    {attempt.studentEmail}
                  </div>
                )}
              </div>
              
              <div style={{
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.9375rem'
              }}>
                {(parseFloat(attempt.score) || 0).toFixed(2)} pts
              </div>
              
              <div style={{
                fontSize: '0.875rem',
                color: '#6B7280'
              }}>
                {new Date(attempt.submittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              
              <div>
                <button
                  onClick={() => setSelectedAttempt(attempt)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#0E78FF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#0056CC'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#0E78FF'}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentResponses;
