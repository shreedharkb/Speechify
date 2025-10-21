import React, { useState, useRef, useEffect } from 'react';
import QuizList from '../components/quiz/QuizList';
import QuizAttempt from '../components/quiz/QuizAttempt';

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3" fill="none" stroke="#4f46e5" />
    <line x1="12" y1="14" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
    <path d="M19 10a7 7 0 0 1-14 0" />
  </svg>
);

export default function QuizPage({ setPage }) {
  // Audio recording state
  const [recordingId, setRecordingId] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [transcription, setTranscription] = useState({});
  const chunksRef = useRef([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [newQuestion, setNewQuestion] = useState("");

  // Get user role from localStorage
  let user = null;
  try {
    const userString = localStorage.getItem('user');
    user = userString ? JSON.parse(userString) : null;
  } catch (e) {
    user = null;
    console.warn('Invalid user token in localStorage:', e);
  }
  const isTeacher = user && user.role === 'teacher';

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/questions`)
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(err => {
        console.error('Error fetching questions:', err);
        setQuestions([]);
      });
  }, []);

  const handleAnswerChange = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  // Audio recording handlers
  // Unified mic button handler: start/stop recording and trigger transcription
  const handleMicClick = async (id) => {
    if (recordingId === id) {
      // Stop recording and start transcription
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      setRecordingId(null);
      setTranscription(prev => ({ ...prev, [id]: 'Transcribing...' }));
    } else {
      // Start recording
      setRecordingId(id);
      setTranscribing(false);
      setTranscription(prev => ({ ...prev, [id]: 'Listening...' }));
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Try to use a supported MIME type for audio
        let options = {};
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options.mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options.mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          options.mimeType = 'audio/wav';
        }
        const recorder = new window.MediaRecorder(stream, options);
        chunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
          setAudioBlob(blob);
          // For debugging: log blob size and type
          console.log('Recorded audio blob:', blob.size, blob.type);
          uploadAudio(id, blob);
        };
        setMediaRecorder(recorder);
        recorder.start();
      } catch (err) {
        setTranscription(prev => ({ ...prev, [id]: 'Microphone access denied.' }));
        alert('Could not access microphone.');
      }
    }
  };

  // Upload audio to backend for transcription
  const uploadAudio = async (id, blob) => {
    setTranscribing(true);
    setTranscription(prev => ({ ...prev, [id]: 'Transcribing...' }));
    const formData = new FormData();
    formData.append('audio', blob, 'answer.webm');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/whisper/transcribe`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setTranscription(prev => ({ ...prev, [id]: data.text }));
        setAnswers(prev => ({ ...prev, [id]: (prev[id] ? prev[id] + ' ' : '') + data.text })); // Append new transcript
      } else {
        setTranscription(prev => ({ ...prev, [id]: 'Transcription failed.' }));
        alert('Transcription failed.');
      }
    } catch (err) {
      setTranscription(prev => ({ ...prev, [id]: 'Error uploading audio.' }));
      alert('Error uploading audio.');
    }
    setTranscribing(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    alert('Quiz submitted successfully!');
    setPage('home');
  };

  // Teacher: handle posting a new question
  const handlePostQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/questions/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ questionText: newQuestion })
      });
      if (res.ok) {
        setNewQuestion("");
        // Refresh questions
        const updated = await fetch(`${import.meta.env.VITE_API_URL}/api/questions`).then(r => r.json());
        setQuestions(updated);
      }
    } catch (err) {
      alert('Error posting question');
    }
  };

  return (
    <div className="page-container">
      <h1 style={{ textAlign: 'center' }}>Quiz in Progress</h1>
      {/* Only teachers see the post question form */}
      {isTeacher ? (
        <>
          <form onSubmit={handlePostQuestion} style={{ marginBottom: '2rem' }}>
            <input
              type="text"
              placeholder="Enter new question..."
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
              style={{ width: '70%', marginRight: '1rem' }}
            />
            <button type="submit" className="btn">Post Question</button>
          </form>
          <form onSubmit={handleSubmit}>
            {questions.length === 0 ? (
              <p>No questions available.</p>
            ) : (
              questions.map((q, index) => (
                <div key={q._id} className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '1rem', fontSize: '1.25rem' }}>{index + 1}. {q.questionText}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Type or record your answer..."
                      style={{ flexGrow: 1 }}
                      value={answers[q._id] || ''}
                      onChange={e => handleAnswerChange(q._id, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => handleMicClick(q._id)}
                      style={{ border: '1px solid #d1d5db', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', background: 'none' }}
                    >
                      <MicIcon />
                    </button>
                  </div>
                </div>
              ))
            )}
            <button type="submit" className="btn">Submit Quiz</button>
          </form>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          {questions.length === 0 ? (
            <p>No questions available.</p>
          ) : (
            questions.map((q, index) => (
              <div key={q._id} className="form-group">
                <label style={{ fontWeight: '600', marginBottom: '1rem', fontSize: '1.25rem' }}>{index + 1}. {q.questionText}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Type or record your answer..."
                    style={{ flexGrow: 1 }}
                    value={answers[q._id] || ''}
                    onChange={e => handleAnswerChange(q._id, e.target.value)}
                    disabled={recordingId === q._id || transcribing}
                  />
                  <button
                    type="button"
                    onClick={() => handleMicClick(q._id)}
                    style={recordingId === q._id
                      ? { border: '2px solid #ef4444', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', background: '#fee2e2', animation: 'pulse 1s infinite' }
                      : { border: '1px solid #d1d5db', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', background: 'none' }
                    }
                  >
                    <MicIcon />
                  </button>
                  {/* Only show error or status, not transcript */}
                  {transcription[q._id] && (
                    (transcription[q._id] === 'Transcribing...' || transcription[q._id] === 'Listening...') ? (
                      <span style={{ marginLeft: '1rem', color: '#6b7280' }}>{transcription[q._id]}</span>
                    ) : (
                      transcription[q._id].toLowerCase().includes('failed') || transcription[q._id].toLowerCase().includes('error') ? (
                        <span style={{ marginLeft: '1rem', color: '#ef4444' }}>{transcription[q._id]}</span>
                      ) : null
                    )
                  )}
                </div>
              </div>
            ))
          )}
          <button type="submit" className="btn">Submit Quiz</button>
        </form>
      )}
    </div>
  );
}