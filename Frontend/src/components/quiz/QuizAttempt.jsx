import React, { useState, useEffect } from 'react';

const QuizAttempt = ({ quiz, onSubmit, onCancel }) => {
  const [answers, setAnswers] = useState({});
  const [audioBlobs, setAudioBlobs] = useState({});  // Store audio blobs for each question
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const audioChunksRef = React.useRef([]);

  useEffect(() => {
    if (quiz) {
      console.log('QuizAttempt received quiz:', quiz);
      console.log('Number of questions:', quiz.questions ? quiz.questions.length : 0);
      
      // Initialize answers
      const initialAnswers = {};
      if (quiz.questions && Array.isArray(quiz.questions)) {
        quiz.questions.forEach((q, index) => {
          initialAnswers[index] = '';
        });
      }
      setAnswers(initialAnswers);

      // Set up timer
      const endTime = new Date(quiz.endTime).getTime();
      const now = new Date().getTime();
      setTimeRemaining(Math.max(0, endTime - now));
    }
  }, [quiz]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1000));
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0) {
      handleSubmit();
    }
  }, [timeRemaining]);

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const handleMicClick = async () => {
    if (recording) {
      // Stop recording
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      setRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Try to use a supported MIME type
        let options = {};
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options.mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options.mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options.mimeType = 'audio/mp4';
        }

        const recorder = new MediaRecorder(stream, options);
        audioChunksRef.current = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
          console.log('Recording stopped, blob size:', audioBlob.size);
          
          // Store the audio blob for this question
          setAudioBlobs(prev => ({
            ...prev,
            [currentQuestionIndex]: audioBlob
          }));
          
          // Stop all tracks to release microphone
          stream.getTracks().forEach(track => track.stop());
          
          // Upload and transcribe
          await uploadAndTranscribe(audioBlob);
        };

        recorder.start();
        setMediaRecorder(recorder);
        setRecording(true);
        console.log('Recording started');
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone. Please check permissions.');
      }
    }
  };

  const uploadAndTranscribe = async (audioBlob) => {
    setTranscribing(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      console.log('Uploading audio for transcription...');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/whisper/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Transcription result:', data.text);
        
        // Append transcribed text to current answer
        setAnswers(prev => ({
          ...prev,
          [currentQuestionIndex]: (prev[currentQuestionIndex] || '') + ' ' + data.text
        }));
      } else {
        const errorText = await response.text();
        console.error('Transcription failed:', errorText);
        alert('Transcription failed. Please try again or type your answer.');
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('Error uploading audio. Please check your connection.');
    } finally {
      setTranscribing(false);
    }
  };

  const handleSubmit = async () => {
    // Convert audio blobs to base64 for each answer
    const formattedAnswers = await Promise.all(
      quiz.questions.map(async (question, index) => {
        let audioBase64 = null;
        
        // Convert blob to base64 if audio exists for this question
        if (audioBlobs[index]) {
          // Use FileReader to convert blob to base64 (browser-native API)
          audioBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              // Remove the data:audio/...;base64, prefix
              const base64String = reader.result.split(',')[1];
              resolve(base64String);
            };
            reader.readAsDataURL(audioBlobs[index]);
          });
        }
        
        return {
          question: question.questionText,
          studentAnswer: answers[index] || '',
          isCorrect: false, // This will be determined by the backend
          audioBlob: audioBase64
        };
      })
    );

    onSubmit(formattedAnswers);
  };

  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!quiz) return <div>Loading quiz...</div>;
  
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>No questions available in this quiz</h2>
        <p>This quiz doesn't have any questions yet.</p>
        <button className="btn" onClick={onCancel}>Back to Dashboard</button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div style={{
      background: '#FAFBFC',
      minHeight: '100vh',
      padding: '2rem 1.5rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Professional Container */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        border: '1px solid #E8E8E8'
      }}>
        {/* Professional Header */}
        <div style={{
          background: 'linear-gradient(to bottom, #FFFFFF 0%, #FAFBFC 100%)',
          padding: '2rem 2.5rem',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.375rem 0.875rem',
                background: '#F0F4F8',
                borderRadius: '6px',
                marginBottom: '0.875rem',
                border: '1px solid #E5E7EB'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10B981',
                  marginRight: '0.625rem',
                  animation: 'pulse 2s infinite'
                }}></div>
                <div style={{
                  fontSize: '0.6875rem',
                  color: '#687588',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1.2px'
                }}>
                  Assessment in Progress
                </div>
              </div>
              <h1 style={{ 
                fontSize: '1.75rem', 
                fontWeight: '600', 
                color: '#111827',
                margin: 0,
                marginBottom: '0.5rem',
                letterSpacing: '-0.025em',
                lineHeight: '1.3'
              }}>
                {quiz.title}
              </h1>
              <div style={{
                color: '#6B7280',
                fontSize: '0.875rem',
                fontWeight: '500',
                letterSpacing: '-0.01em'
              }}>
                {quiz.subject}
              </div>
            </div>
            <div style={{
              background: timeRemaining < 300000 ? '#FEF2F2' : '#F9FAFB',
              padding: '1.25rem 1.75rem',
              borderRadius: '10px',
              textAlign: 'center',
              border: timeRemaining < 300000 ? '1px solid #FEE2E2' : '1px solid #E5E7EB',
              minWidth: '160px'
            }}>
              <div style={{ 
                fontSize: '0.6875rem', 
                fontWeight: '600', 
                color: timeRemaining < 300000 ? '#DC2626' : '#6B7280',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '1.2px'
              }}>
                Time Remaining
              </div>
              <div style={{
                fontSize: '1.875rem',
                fontWeight: '600',
                color: timeRemaining < 300000 ? '#DC2626' : '#111827',
                letterSpacing: '-0.025em',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: '1'
              }}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: '2.5rem' }}>
          {/* Professional Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              borderLeft: '3px solid #4f46e5',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'box-shadow 0.2s ease'
            }}>
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: '600',
                color: '#6B7280',
                marginBottom: '0.625rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Questions
              </div>
              <div style={{
                fontSize: '2.25rem',
                fontWeight: '600',
                color: '#111827',
                letterSpacing: '-0.025em',
                lineHeight: '1'
              }}>
                {quiz.questions.length}
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              borderLeft: '3px solid #10B981',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'box-shadow 0.2s ease'
            }}>
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: '600',
                color: '#6B7280',
                marginBottom: '0.625rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Total Points
              </div>
              <div style={{
                fontSize: '2.25rem',
                fontWeight: '600',
                color: '#111827',
                letterSpacing: '-0.025em',
                lineHeight: '1'
              }}>
                {quiz.questions.reduce((sum, q) => sum + q.points, 0)}
              </div>
            </div>
          </div>

          {/* Question Navigator */}
          <div style={{
            background: '#F9FAFB',
            padding: '1.5rem',
            borderRadius: '10px',
            marginBottom: '2rem',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: '#6B7280',
              marginBottom: '1rem',
              letterSpacing: '-0.01em'
            }}>
              Question Progress
            </div>
            <div style={{
              display: 'flex',
              gap: '0.625rem',
              flexWrap: 'wrap'
            }}>
              {quiz.questions.map((_, index) => {
                const isActive = currentQuestionIndex === index;
                const isAnswered = answers[index] && answers[index].trim() !== '';
                
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    style={{
                      width: '44px',
                      height: '44px',
                      border: isActive ? '2px solid #4f46e5' : '1px solid #E5E7EB',
                      borderRadius: '8px',
                      background: isActive 
                        ? '#4f46e5' 
                        : isAnswered 
                        ? '#10B981'
                        : 'white',
                      color: isActive || isAnswered ? 'white' : '#6B7280',
                      cursor: 'pointer',
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 0 0 3px rgba(79, 70, 229, 0.1)' : 'none'
                    }}
                    onMouseOver={(e) => {
                      if (!isActive && !isAnswered) {
                        e.currentTarget.style.background = '#F3F4F6';
                        e.currentTarget.style.borderColor = '#D1D5DB';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive && !isAnswered) {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.borderColor = '#E5E7EB';
                      }
                    }}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Professional Question Card */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            border: '1px solid #E5E7EB'
          }}>
            {/* Question Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.75rem',
              paddingBottom: '1.25rem',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <h2 style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                color: '#111827', 
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.375rem 0.75rem',
                  background: '#EEF2FF',
                  borderRadius: '6px',
                  color: '#4f46e5',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  border: '1px solid #E0E7FF',
                  letterSpacing: '-0.01em'
                }}>
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </span>
              </h2>
              <div style={{
                background: '#F0FDF4',
                color: '#166534',
                padding: '0.375rem 0.875rem',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                fontWeight: '600',
                border: '1px solid #BBF7D0',
                letterSpacing: '-0.01em'
              }}>
                {currentQuestion.points} pts
              </div>
            </div>
            
            {/* Question Text */}
            <div style={{
              fontSize: '1.0625rem',
              marginBottom: '1.75rem',
              color: '#111827',
              lineHeight: '1.7',
              fontWeight: '400',
              padding: '1.25rem',
              background: '#F9FAFB',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              letterSpacing: '-0.01em'
            }}>
              {currentQuestion.questionText}
            </div>

            {/* Question Image (if exists) */}
            {currentQuestion.imageUrl && (
              <div style={{
                marginBottom: '1.75rem',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #E5E7EB'
              }}>
                <img 
                  src={`${import.meta.env.VITE_API_URL}${currentQuestion.imageUrl}`}
                  alt={`Question ${currentQuestionIndex + 1}`}
                  style={{
                    width: '100%',
                    maxWidth: '600px',
                    height: 'auto',
                    display: 'block'
                  }}
                  onError={(e) => {
                    console.error('Image failed to load:', currentQuestion.imageUrl);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Professional Answer Section */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.625rem',
                letterSpacing: '-0.01em'
              }}>
                Your Answer
              </label>
              <textarea
                value={answers[currentQuestionIndex] || ''}
                onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                placeholder="Type your answer here..."
                disabled={recording || transcribing}
                style={{
                  width: '100%',
                  minHeight: '160px',
                  padding: '0.875rem',
                  marginBottom: '1.25rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  lineHeight: '1.6',
                  resize: 'vertical',
                  transition: 'all 0.15s ease',
                  outline: 'none',
                  background: 'white',
                  color: '#111827',
                  boxSizing: 'border-box',
                  letterSpacing: '-0.01em'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4f46e5';
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.05)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
              
              {/* Professional Microphone Section */}
              <div style={{
                background: '#F9FAFB',
                padding: '1rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                border: '1px solid #E5E7EB'
              }}>
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={transcribing}
                  style={{
                    padding: '0.625rem 1.25rem',
                    border: 'none',
                    borderRadius: '7px',
                    background: recording ? '#DC2626' : '#4f46e5',
                    color: 'white',
                    cursor: transcribing ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.15s ease',
                    opacity: transcribing ? 0.6 : 1,
                    letterSpacing: '-0.01em'
                  }}
                  onMouseOver={(e) => {
                    if (!transcribing) {
                      e.currentTarget.style.background = recording ? '#B91C1C' : '#4338ca';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!transcribing) {
                      e.currentTarget.style.background = recording ? '#DC2626' : '#4f46e5';
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="2" width="6" height="12" rx="3" />
                    <line x1="12" y1="14" x2="12" y2="22" />
                    <line x1="8" y1="22" x2="16" y2="22" />
                    <path d="M19 10a7 7 0 0 1-14 0" />
                  </svg>
                  {recording ? 'Stop Recording' : transcribing ? 'Processing...' : 'Voice Input'}
                </button>
                <span style={{
                  color: recording ? '#DC2626' : transcribing ? '#D97706' : '#6B7280',
                  fontSize: '0.8125rem',
                  fontWeight: '500',
                  flex: 1,
                  letterSpacing: '-0.01em'
                }}>
                  {recording 
                    ? 'Recording...'
                    : transcribing 
                    ? 'Processing audio...'
                    : 'Use voice input to answer'}
                </span>
              </div>
            </div>

            {/* Professional Navigation */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '1.75rem',
              gap: '0.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #E5E7EB'
            }}>
              {currentQuestionIndex > 0 && (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  style={{
                    padding: '0.625rem 1.25rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '7px',
                    background: 'white',
                    color: '#6B7280',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    letterSpacing: '-0.01em'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#F9FAFB';
                    e.currentTarget.style.borderColor = '#9CA3AF';
                    e.currentTarget.style.color = '#374151';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#6B7280';
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }}
                >
                  ← Previous
                </button>
              )}
              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  style={{
                    padding: '0.625rem 1.25rem',
                    border: 'none',
                    borderRadius: '7px',
                    background: '#4f46e5',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    marginLeft: 'auto',
                    letterSpacing: '-0.01em'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#4338ca';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#4f46e5';
                  }}
                >
                  Next →
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  style={{
                    padding: '0.75rem 1.75rem',
                    border: 'none',
                    borderRadius: '7px',
                    background: '#10B981',
                    color: 'white',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    marginLeft: 'auto',
                    letterSpacing: '-0.01em'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#059669';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#10B981';
                  }}
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;
