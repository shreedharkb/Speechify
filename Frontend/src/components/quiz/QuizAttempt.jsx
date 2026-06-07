import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { Mic, Square, Loader2, ArrowLeft, ArrowRight, Clock, CheckCircle2, AlertTriangle, LayoutGrid } from 'lucide-react';
import { cn } from "@/lib/utils";

const QuizAttempt = ({ quiz, onSubmit, onCancel }) => {
  const [answers, setAnswers] = useState({});
  const [audioBlobs, setAudioBlobs] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const audioChunksRef = React.useRef([]);

  useEffect(() => {
    if (quiz) {
      const initialAnswers = {};
      if (quiz.questions && Array.isArray(quiz.questions)) {
        quiz.questions.forEach((q, index) => {
          initialAnswers[index] = '';
        });
      }
      setAnswers(initialAnswers);

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
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const handleMicClick = async () => {
    if (recording) {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      setRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        let options = {};
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) options.mimeType = 'audio/webm;codecs=opus';
        else if (MediaRecorder.isTypeSupported('audio/webm')) options.mimeType = 'audio/webm';
        else if (MediaRecorder.isTypeSupported('audio/mp4')) options.mimeType = 'audio/mp4';

        const recorder = new MediaRecorder(stream, options);
        audioChunksRef.current = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
          setAudioBlobs(prev => ({ ...prev, [currentQuestionIndex]: audioBlob }));
          stream.getTracks().forEach(track => track.stop());
          await uploadAndTranscribe(audioBlob);
        };

        recorder.start();
        setMediaRecorder(recorder);
        setRecording(true);
      } catch (error) {
        alert('Could not access microphone. Please check permissions.');
      }
    }
  };

  const uploadAndTranscribe = async (audioBlob) => {
    setTranscribing(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/whisper/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAnswers(prev => ({
          ...prev,
          [currentQuestionIndex]: (prev[currentQuestionIndex] || '') + (prev[currentQuestionIndex] ? ' ' : '') + data.text
        }));
      } else {
        alert('Transcription failed. Please try again or type your answer.');
      }
    } catch (error) {
      alert('Error uploading audio. Please check your connection.');
    } finally {
      setTranscribing(false);
    }
  };

  const handleSubmit = async () => {
    const formattedAnswers = await Promise.all(
      quiz.questions.map(async (question, index) => {
        let audioBase64 = null;
        if (audioBlobs[index]) {
          audioBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(audioBlobs[index]);
          });
        }

        return {
          question: question.questionText || question.text || question.question || '',
          studentAnswer: answers[index] || '',
          isCorrect: false,
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
    return `${hours > 0 ? hours.toString().padStart(2, '0') + ':' : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!quiz) return <div className="flex items-center justify-center h-screen bg-muted"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;

  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="bg-muted flex items-center justify-center px-4 py-10 lg:py-20 min-h-screen">
        <Card className="w-full max-w-md mx-auto shadow-none">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 bg-muted p-3 rounded-full inline-flex">
              <AlertTriangle className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">No questions available</CardTitle>
            <CardDescription>This quiz doesn't have any questions yet.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={onCancel}>Return to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isTimeRunningOut = timeRemaining !== null && timeRemaining < 300000;
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.values(answers).filter(a => a && a.trim() !== '').length;

  return (
    <div className="bg-muted min-h-screen">
      {/* Header / Nav Bar Area */}
      <header className="bg-background border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel} title="Exit Quiz">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{quiz.title}</h1>
            <p className="text-sm text-muted-foreground">{quiz.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs text-muted-foreground font-medium uppercase">Progress</span>
            <span className="text-sm font-medium">{answeredCount} / {quiz.questions.length}</span>
          </div>
          <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md border", isTimeRunningOut ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-muted text-foreground")}>
            <Clock className="w-4 h-4" />
            <span className="font-medium font-mono">
              {timeRemaining !== null ? formatTime(timeRemaining) : '--:--'}
            </span>
          </div>
        </div>
      </header>
      <Progress value={progressPercentage} className="h-1 rounded-none" />

      {/* Main Layout Area */}
      <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Question Grid Overview */}
        <Card className="shadow-none">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Question Navigation
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowGrid(!showGrid)}>
                <LayoutGrid className="w-4 h-4 mr-2" />
                {showGrid ? 'Hide' : 'Show'} Overview
              </Button>
            </div>
          </CardHeader>
          {showGrid && (
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {quiz.questions.map((_, idx) => {
                  const answered = answers[idx] && answers[idx].trim() !== '';
                  const active = currentQuestionIndex === idx;
                  return (
                    <Button
                      key={idx}
                      variant={active ? "default" : answered ? "secondary" : "outline"}
                      className={cn("w-10 h-10 p-0 font-semibold", answered && !active && "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent")}
                      onClick={() => setCurrentQuestionIndex(idx)}
                    >
                      {idx + 1}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Current Question Card */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/50 pb-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                Question {currentQuestionIndex + 1}
              </Badge>
              <span className="text-sm text-muted-foreground font-medium">
                {currentQuestion.points || 0} Points
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Question Text */}
            <div className="text-lg md:text-xl font-medium leading-relaxed">
              {currentQuestion.questionText || currentQuestion.text || currentQuestion.question || ''}
            </div>

            {/* Question Image */}
            {currentQuestion.imageUrl && (
              <div className="rounded-lg overflow-hidden border bg-muted p-2 flex justify-center">
                <img
                  src={`${import.meta.env.VITE_API_URL}${currentQuestion.imageUrl}`}
                  alt="Question"
                  className="max-w-full max-h-[400px] object-contain rounded"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            {/* Answer Input */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold tracking-tight">Your Answer</label>
                <Button
                  type="button"
                  size="sm"
                  variant={recording ? "destructive" : "secondary"}
                  onClick={handleMicClick}
                  disabled={transcribing}
                  className="gap-2"
                >
                  {recording ? <Square className="w-4 h-4 fill-current" /> : transcribing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                  {recording ? 'Stop Recording' : transcribing ? 'Transcribing...' : 'Voice Input'}
                </Button>
              </div>

              <div className="relative">
                <Textarea
                  value={answers[currentQuestionIndex] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                  placeholder="Type your answer here..."
                  disabled={recording || transcribing}
                  className="min-h-[200px] resize-y text-base p-4"
                />
                {(recording || transcribing) && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-md flex items-center justify-center border z-10">
                    <div className="flex items-center gap-3 bg-background border px-4 py-2 rounded-md shadow-sm">
                      {recording ? (
                        <><div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse"></div><span className="font-medium text-sm">Listening...</span></>
                      ) : (
                        <><Loader2 className="w-4 h-4 text-muted-foreground animate-spin" /><span className="font-medium text-sm">Processing audio...</span></>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t bg-muted/20 py-4">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              disabled={currentQuestionIndex === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </Button>

            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="gap-2"
              >
                Submit Quiz <CheckCircle2 className="w-4 h-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default QuizAttempt;
