import React, { useEffect } from 'react';

const QuizResults = ({ results, onBackToDashboard }) => {
  const totalPoints = results.totalPossible || results.questions.reduce((sum, q) => sum + (q.maxPoints || q.points || 0), 0);
  const earnedPoints = results.score || results.questions.reduce((sum, q) => sum + (q.pointsEarned || 0), 0);
  const percentage = results.percentage || ((earnedPoints / totalPoints) * 100).toFixed(1);
  
  const totalQuestions = results.questions?.length || 0;
  const correctCount = results.questions?.filter(q => q.isCorrect).length || 0;
  const incorrectCount = totalQuestions - correctCount;
  const accuracy = totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(1) : 0;

  // Get performance level
  const getPerformanceLevel = (percent) => {
    if (percent >= 90) return { level: 'Excellent', color: '#10B981' };
    if (percent >= 75) return { level: 'Good', color: '#3B82F6' };
    if (percent >= 60) return { level: 'Satisfactory', color: '#F59E0B' };
    return { level: 'Needs Improvement', color: '#EF4444' };
  };

  const performance = getPerformanceLevel(percentage);

  // Trigger analytics refresh
  useEffect(() => {
    return () => {
      console.log('[QuizResults] Dispatching quizCompleted event');
      window.dispatchEvent(new Event('quizCompleted'));
    };
  }, []);

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '4rem 2.5rem',
      background: '#FAFBFC',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(to bottom, #FFFFFF 0%, #FAFBFC 100%)',
        borderRadius: '20px',
        padding: '3.5rem',
        marginBottom: '3rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        border: '1px solid #E8E8E8',
        borderTop: `6px solid ${performance.color}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '3rem'
        }}>
          <div style={{ flex: 1, minWidth: '320px' }}>
            <div style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              background: '#F5F7FA',
              borderRadius: '6px',
              marginBottom: '1rem'
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: '#687588',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1.5px'
              }}>
                Assessment Results
              </div>
            </div>
            <h1 style={{
              fontSize: '2.375rem',
              fontWeight: '700',
              color: '#0F1419',
              margin: 0,
              marginBottom: '1.75rem',
              lineHeight: '1.25',
              letterSpacing: '-0.03em'
            }}>
              {results.quizTitle}
            </h1>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.75rem 1.75rem',
              borderRadius: '10px',
              background: performance.color,
              color: 'white',
              fontSize: '1rem',
              fontWeight: '700',
              letterSpacing: '0.4px',
              boxShadow: `0 4px 12px ${performance.color}40`
            }}>
              {performance.level}
            </div>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '2.5rem',
            background: 'white',
            borderRadius: '16px',
            minWidth: '220px',
            border: `3px solid ${performance.color}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              fontSize: '4rem',
              fontWeight: '900',
              color: performance.color,
              lineHeight: '1',
              marginBottom: '1rem',
              letterSpacing: '-0.04em'
            }}>
              {percentage}%
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#687588',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Final Score
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          border: '1px solid #E8E8E8',
          transition: 'all 0.3s',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: '#6366F1'
          }} />
          <div style={{
            fontSize: '0.8125rem',
            color: '#687588',
            fontWeight: '700',
            marginBottom: '1.25rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Total Questions
          </div>
          <div style={{
            fontSize: '2.75rem',
            fontWeight: '900',
            color: '#0F1419',
            letterSpacing: '-0.03em',
            lineHeight: '1'
          }}>
            {totalQuestions}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          border: '1px solid #E8E8E8',
          transition: 'all 0.3s',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: '#F59E0B'
          }} />
          <div style={{
            fontSize: '0.8125rem',
            color: '#687588',
            fontWeight: '700',
            marginBottom: '1.25rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Points Scored
          </div>
          <div style={{
            fontSize: '2.75rem',
            fontWeight: '900',
            color: '#F59E0B',
            letterSpacing: '-0.03em',
            lineHeight: '1'
          }}>
            {earnedPoints}/{totalPoints}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          border: '1px solid #E8E8E8',
          transition: 'all 0.3s',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: '#10B981'
          }} />
          <div style={{
            fontSize: '0.8125rem',
            color: '#687588',
            fontWeight: '700',
            marginBottom: '1.25rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Correct Answers
          </div>
          <div style={{
            fontSize: '2.75rem',
            fontWeight: '900',
            color: '#10B981',
            letterSpacing: '-0.03em',
            lineHeight: '1'
          }}>
            {correctCount}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          border: '1px solid #E8E8E8',
          transition: 'all 0.3s',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: '#EF4444'
          }} />
          <div style={{
            fontSize: '0.8125rem',
            color: '#687588',
            fontWeight: '700',
            marginBottom: '1.25rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Incorrect Answers
          </div>
          <div style={{
            fontSize: '2.75rem',
            fontWeight: '900',
            color: '#EF4444',
            letterSpacing: '-0.03em',
            lineHeight: '1'
          }}>
            {incorrectCount}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          border: '1px solid #E8E8E8',
          transition: 'all 0.3s',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: '#3B82F6'
          }} />
          <div style={{
            fontSize: '0.8125rem',
            color: '#687588',
            fontWeight: '700',
            marginBottom: '1.25rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Accuracy Rate
          </div>
          <div style={{
            fontSize: '2.75rem',
            fontWeight: '900',
            color: '#3B82F6',
            letterSpacing: '-0.03em',
            lineHeight: '1'
          }}>
            {accuracy}%
          </div>
        </div>
      </div>

      {/* Question Review */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '3rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        border: '1px solid #E8E8E8'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '2.5rem',
          paddingBottom: '1.5rem',
          borderBottom: '3px solid #F5F7FA'
        }}>
          <div style={{
            width: '6px',
            height: '32px',
            background: 'linear-gradient(to bottom, #0E78FF, #0A4FB8)',
            borderRadius: '3px',
            marginRight: '1.25rem'
          }} />
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#0F1419',
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            Detailed Answer Review
          </h2>
        </div>
        
        {results.questions.map((question, index) => {
          const isCorrect = question.isCorrect;
          
          return (
            <div 
              key={index}
              style={{
                marginBottom: '2.5rem',
                padding: '0',
                borderRadius: '16px',
                border: `3px solid ${isCorrect ? '#10B981' : '#EF4444'}`,
                background: 'white',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
              }}
            >
              {/* Question Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.75rem 2rem',
                background: isCorrect ? '#F0FDF4' : '#FEF2F2',
                borderBottom: `3px solid ${isCorrect ? '#10B981' : '#EF4444'}`,
                gap: '1.25rem'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '1.25rem',
                  flex: 1,
                  alignItems: 'center'
                }}>
                  <div style={{
                    minWidth: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: isCorrect ? '#10B981' : '#EF4444',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.125rem',
                    fontWeight: '800',
                    flexShrink: 0,
                    boxShadow: `0 4px 12px ${isCorrect ? '#10B98140' : '#EF444440'}`
                  }}>
                    {index + 1}
                  </div>
                  <div style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#0F1419',
                    lineHeight: '1.6'
                  }}>
                    {question.questionText || question.question}
                  </div>
                </div>
                <div style={{
                  padding: '0.625rem 1.5rem',
                  borderRadius: '10px',
                  background: isCorrect ? '#10B981' : '#EF4444',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '800',
                  whiteSpace: 'nowrap',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  flexShrink: 0,
                  boxShadow: `0 4px 12px ${isCorrect ? '#10B98140' : '#EF444440'}`
                }}>
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </div>
              </div>

              {/* Answer Content */}
              <div style={{ padding: '2rem' }}>
                {/* Scoring Details */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    background: isCorrect ? '#F0FDF4' : '#FEF2F2',
                    border: `1px solid ${isCorrect ? '#10B981' : '#EF4444'}`,
                    flex: '1',
                    minWidth: '150px'
                  }}>
                    <div style={{
                      fontSize: '0.75rem',
                      color: isCorrect ? '#059669' : '#DC2626',
                      fontWeight: '600',
                      marginBottom: '0.25rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Points Earned
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: isCorrect ? '#10B981' : '#EF4444'
                    }}>
                      {question.pointsEarned?.toFixed(2) || 0} / {question.maxPoints || question.points || 0}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.5rem'
                }}>
                  <div style={{
                    padding: '1.5rem',
                    borderRadius: '12px',
                    background: '#F8F9FA',
                    border: '2px solid #DEE2E6'
                  }}>
                    <div style={{
                      fontSize: '0.8125rem',
                      color: '#6C757D',
                      fontWeight: '600',
                      marginBottom: '1rem',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Your Answer
                    </div>
                    <div style={{
                      fontSize: '0.9375rem',
                      lineHeight: '1.8',
                      color: '#212529',
                      fontWeight: '400'
                    }}>
                      {question.studentAnswer || 'No answer provided'}
                    </div>
                  </div>

                  <div style={{
                    padding: '1.5rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(to bottom, #F0FDF4, #DCFCE7)',
                    border: '2px solid #10B981'
                  }}>
                    <div style={{
                      fontSize: '0.8125rem',
                      color: '#059669',
                      fontWeight: '600',
                      marginBottom: '1rem',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Correct Answer
                    </div>
                    <div style={{
                      fontSize: '0.9375rem',
                      lineHeight: '1.8',
                      color: '#047857',
                      fontWeight: '400'
                    }}>
                      Correct Answer
                    </div>
                    <div style={{
                      fontSize: '0.9375rem',
                      lineHeight: '1.8',
                      color: '#065F46',
                      fontWeight: '600'
                    }}>
                      {question.correctAnswer}
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              {!isCorrect && question.explanation && (
                <div style={{ padding: '0 2rem 2rem' }}>
                  <div style={{
                    padding: '1.5rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(to bottom, #FFFBEB, #FEF3C7)',
                    border: '2px solid #F59E0B'
                  }}>
                    <div style={{
                      fontSize: '0.8125rem',
                      color: '#B45309',
                      fontWeight: '800',
                      marginBottom: '1rem',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Feedback & Suggestion
                    </div>
                    <div style={{
                      fontSize: '0.9375rem',
                      lineHeight: '1.8',
                      color: '#78350F',
                      fontWeight: '500'
                    }}>
                      {question.explanation}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Back Button */}
      <div style={{
        marginTop: '3.5rem',
        textAlign: 'center'
      }}>
        <button 
          onClick={onBackToDashboard}
          style={{
            padding: '1.125rem 3rem',
            fontSize: '1rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #0E78FF 0%, #0A4FB8 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(14, 120, 255, 0.35)',
            transition: 'all 0.3s',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #0A4FB8 0%, #083A8C 100%)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(14, 120, 255, 0.45)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #0E78FF 0%, #0A4FB8 100%)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(14, 120, 255, 0.35)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default QuizResults;
