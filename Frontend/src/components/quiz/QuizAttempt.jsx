import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';
import { Mic, Square, Loader2, ArrowLeft, ArrowRight, Clock, CheckCircle2, AlertTriangle, AudioLines } from 'lucide-react';
import { cn } from "@/lib/utils";

const QuizAttempt = ({ quiz, onSubmit, onCancel }) => {
  const [answers, setAnswers] = useState({});
  const [audioBlobs, setAudioBlobs] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
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
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert('Microphone access is not supported. Please use a secure HTTPS connection or localhost.');
          return;
        }
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
          const mimeType = recorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          setAudioBlobs(prev => ({ ...prev, [currentQuestionIndex]: audioBlob }));
          stream.getTracks().forEach(track => track.stop());
          await uploadAndTranscribe(audioBlob, mimeType);
        };

        recorder.start(500);
        setMediaRecorder(recorder);
        setRecording(true);
      } catch (error) {
        console.error("Mic access error:", error);
        alert('Could not access microphone. Please check permissions in your browser settings or ensure you are on a secure context (HTTPS/localhost).');
      }
    }
  };

  const uploadAndTranscribe = async (audioBlob, mimeType = 'audio/webm') => {
    setTranscribing(true);
    const formData = new FormData();
    const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('mpeg') ? 'mpeg' : mimeType.includes('wav') ? 'wav' : 'webm';
    formData.append('audio', audioBlob, `recording.${ext}`);

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
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Transcription failed. Please try again or type your answer.');
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

  if (!quiz) return <div className="flex items-center justify-center h-screen bg-background"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;

  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="bg-background flex items-center justify-center px-4 py-10 lg:py-20 min-h-screen">
        <Card className="w-full max-w-md mx-auto">
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
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-foreground">
      {/* NAV */}
      <div className="relative z-50 bg-white border-b border-zinc-200 w-full sticky top-0">
        <nav className="flex items-center justify-between px-6 py-3 mx-auto w-full max-w-7xl">
          {/* LEFT: Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[oklch(61%_0.09_60.8)] rounded-full flex items-center justify-center shadow-sm shrink-0">
              <AudioLines className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-black tracking-tight hidden sm:block">
              Speechify Quiz
            </span>
          </div>

          {/* MIDDLE: Timer */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center">
            <div className={cn(
              "flex items-center gap-3 px-5 py-1.5 rounded-full transition-all duration-500 shadow-sm border", 
              isTimeRunningOut 
                ? "bg-red-500 border-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse" 
                : "bg-zinc-900 border-zinc-800 text-white shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:scale-105"
            )}>
              {/* Pulsing indicator dot */}
              <div className={cn(
                "w-2 h-2 rounded-full", 
                isTimeRunningOut ? "bg-white animate-ping" : "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              )} />
              
              <span className="tracking-[0.2em] font-mono text-sm font-medium pt-[1px]">
                {timeRemaining !== null ? formatTime(timeRemaining) : '--:--'}
              </span>
            </div>
          </div>

          {/* RIGHT: Attempt / Results & Exit */}
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100/80 rounded-full p-1 border border-gray-200/50">
              <div className="bg-white shadow-sm rounded-full px-5 py-1 text-sm font-medium text-black cursor-default">Attempt</div>
              <div className="px-5 py-1 text-sm font-medium text-gray-500 cursor-default">Results</div>
            </div>

            <Button variant="ghost" size="sm" onClick={onCancel} className="rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-medium text-black px-4 py-1.5 h-auto">
              Exit Quiz
            </Button>
          </div>
        </nav>
      </div>

      <main className="flex-1 px-4 py-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">

            {/* Quiz header */}
            <Card className="border border-zinc-200 shadow-sm bg-white rounded-xl">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs font-medium text-zinc-700 bg-white shadow-sm border-zinc-200">{quiz.subject || 'Subject'}</Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-0.5 text-xs font-medium bg-zinc-100 text-zinc-700 border-0">Assessment</Badge>
                </div>
                <CardTitle className="text-2xl tracking-tight text-zinc-900">{quiz.title}</CardTitle>
                <CardDescription className="text-zinc-500">Answer all questions. Some questions may require audio responses.</CardDescription>
              </CardHeader>
            </Card>

            <div className="space-y-6">
              {/* Question card */}
              <Card className="border border-zinc-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] bg-white rounded-xl overflow-hidden transition-all duration-300">
                <CardContent className="p-8 space-y-8">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                        Question {currentQuestionIndex + 1} of {quiz.questions.length}
                      </span>
                      <Badge variant="secondary" className="rounded-md bg-zinc-100 text-zinc-700 font-medium px-3 py-1 hover:bg-zinc-200 border-0">{currentQuestion.points || 0} marks</Badge>
                    </div>
                    <h3 className="text-2xl font-semibold leading-relaxed text-zinc-900 tracking-tight">
                      {currentQuestion.questionText || currentQuestion.text || currentQuestion.question || ''}
                    </h3>
                  </div>
                  {currentQuestion.imageUrl && (
                    <div className="rounded-lg overflow-hidden border bg-muted/50 p-2 flex justify-center">
                      <img src={`${import.meta.env.VITE_API_URL}${currentQuestion.imageUrl}`} alt="Question" className="max-w-full max-h-[300px] object-contain rounded" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                  )}

                  <div className="grid w-full gap-2 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="answer-input" className="text-sm font-medium flex items-center gap-2">
                        Written Answer
                        <span className="text-xs text-muted-foreground font-normal">(Optional if audio provided)</span>
                      </Label>
                      <div className="flex items-center gap-3">
                        {transcribing && <span className="text-xs text-primary flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Transcribing...</span>}
                        {recording && <span className="text-xs text-destructive flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive animate-ping" /> Recording</span>}
                        <Button
                          variant={recording ? "destructive" : "outline"}
                          size="sm"
                          onClick={handleMicClick}
                          className={cn(
                            "gap-2 transition-all duration-300",
                            recording ? "animate-pulse ring-4 ring-destructive/20 text-destructive border-destructive bg-destructive/10" : "text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground hover:shadow-md"
                          )}
                          disabled={transcribing}
                        >
                          {recording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
                          {recording ? "Stop Recording" : "Record Audio"}
                        </Button>
                      </div>
                    </div>
                    
                    <Textarea
                      id="answer-input"
                      value={answers[currentQuestionIndex] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                      placeholder="Type your detailed answer here..."
                      disabled={recording || transcribing}
                      className="min-h-[220px] resize-y mt-1 bg-[#FAFAFA] hover:bg-zinc-50 focus:bg-white transition-all duration-300 border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 shadow-sm text-base leading-relaxed rounded-xl"
                    />
                  </div>
                </CardContent>
                <CardFooter className="bg-[#FAFAFA] border-t border-zinc-100 px-8 py-5 flex items-center justify-between">
                  <Button
                    variant="outline"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="gap-2 rounded-lg px-6 font-medium bg-white text-zinc-900 border border-zinc-200 shadow-sm transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous
                  </Button>

                  <Button
                    disabled={currentQuestionIndex === quiz.questions.length - 1}
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="gap-2 rounded-lg px-8 font-medium bg-white text-zinc-900 border border-zinc-200 shadow-sm transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar Navigation & Metrics */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6 sticky top-24">
            <Card className="border border-zinc-200 shadow-sm bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-[#FAFAFA] border-b border-zinc-100 pb-4">
                <CardTitle className="text-base text-zinc-900 font-semibold tracking-tight">Quiz Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-6">

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col bg-[#FAFAFA] p-3 rounded-lg border border-zinc-100">
                    <span className="text-zinc-500 font-medium text-xs uppercase tracking-wider mb-1">Answered</span>
                    <span className="text-xl font-bold text-zinc-900">{answeredCount}</span>
                  </div>
                  <div className="flex flex-col bg-[#FAFAFA] p-3 rounded-lg border border-zinc-100">
                    <span className="text-zinc-500 font-medium text-xs uppercase tracking-wider mb-1">Unanswered</span>
                    <span className="text-xl font-bold text-zinc-900">{quiz.questions.length - answeredCount}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    <span>Progress</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2 bg-zinc-100 [&>div]:bg-zinc-900" />
                </div>

                {/* Question Grid */}
                <div className="space-y-3 pt-4 border-t border-zinc-100">
                  <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Questions</span>
                  <div className="grid grid-cols-5 gap-2">
                    {quiz.questions.map((q, idx) => {
                      const isAnswered = answers[idx] && answers[idx].trim() !== '';
                      const isCurrent = currentQuestionIndex === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={cn(
                            "h-10 rounded-md text-sm font-medium transition-all flex items-center justify-center border",
                            isCurrent
                              ? "ring-2 ring-zinc-900 ring-offset-1 border-zinc-900 bg-zinc-900 text-white"
                              : isAnswered
                                ? "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200 hover:border-zinc-300"
                                : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-600"
                          )}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </CardContent>
              <CardFooter className="p-5 bg-[#FAFAFA] border-t border-zinc-100">
                <Button
                  onClick={handleSubmit}
                  className="w-full gap-2 rounded-lg font-medium shadow-sm bg-zinc-900 hover:bg-zinc-800 text-white transition-all duration-200 active:scale-[0.98]"
                >
                  Submit Assessment <CheckCircle2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizAttempt;
