import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { CheckCircle2, XCircle, Plus, Trash2, Calendar, BookOpen, ImagePlus, X, Upload, Loader2 } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

export default function DashboardPage({ setPage }) {
  const [quizData, setQuizData] = useState({
    title: '',
    subject: '',
    courseCode: '',
    description: '',
    startTime: '',
    endTime: '',
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    correctAnswer: '',
    points: 1,
    image: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid image type', { description: 'Please upload a valid image file (PNG, JPG, GIF).' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large', { description: 'Image must be smaller than 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCurrentQuestion(prev => ({ ...prev, image: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setCurrentQuestion(prev => ({ ...prev, image: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.questionText || !currentQuestion.correctAnswer) {
      toast.error('Missing fields', { description: 'Please fill in both question text and correct answer.' });
      return;
    }

    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));

    setCurrentQuestion({
      questionText: '',
      correctAnswer: '',
      points: 1,
      image: null
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success('Question added successfully');
  };

  const handleRemoveQuestion = (index) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!quizData.title || !quizData.subject || !quizData.courseCode || !quizData.startTime || !quizData.endTime) {
      toast.error('Missing required fields', { description: 'Please fill in Title, Subject, Course Code, Start & End Time.' });
      return;
    }

    if (quizData.questions.length === 0) {
      toast.error('No questions', { description: 'Please add at least one question to the quiz.' });
      return;
    }

    if (new Date(quizData.startTime) >= new Date(quizData.endTime)) {
      toast.error('Invalid schedule', { description: 'End time must be after start time.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: quizData.title,
        subject: quizData.subject,
        courseCode: quizData.courseCode,
        description: quizData.description,
        startTime: quizData.startTime,
        endTime: quizData.endTime,
        questions: quizData.questions.map((q, index) => ({
          id: index + 1,
          questionText: q.questionText,
          correctAnswer: q.correctAnswer,
          points: q.points,
          image: q.image || null
        }))
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/quiz/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success('Quiz published successfully!', { description: 'Students can now see and attempt it.' });
        setQuizData({ title: '', subject: '', courseCode: '', description: '', startTime: '', endTime: '', questions: [] });
      } else {
        const err = await res.json();
        toast.error('Error creating quiz', { description: err.msg || 'Please check all fields.' });
      }
    } catch (err) {
      toast.error('Network error', { description: 'Could not connect to server.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto">
      
      {/* Left Information Area */}
      <div className="xl:w-1/3">
        <div className="sticky top-24">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">Quiz Creation</CardTitle>
              <CardDescription className="text-base text-slate-500 mt-2">
                Build a new assessment by filling out the profile details, setting the availability window, and adding questions. 
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 mt-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-slate-900">Configure Profile</h4>
                  <p className="text-sm text-slate-500">Set the title, subject and course code.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-slate-900">Set Schedule</h4>
                  <p className="text-sm text-slate-500">Determine exactly when the quiz is active and accessible.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-slate-900">Add Questions</h4>
                  <p className="text-sm text-slate-500">Input questions with optional images, correct answers, and point values.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="xl:w-2/3">
        <form onSubmit={handleSubmit} className="space-y-8">

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Quiz Profile</CardTitle>
              <CardDescription>This information will be displayed to students when they take the quiz.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="quizTitle">Quiz Title <span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  id="quizTitle"
                  value={quizData.title}
                  onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Midterm Exam - Chapter 5"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    id="subject"
                    value={quizData.subject}
                    onChange={(e) => setQuizData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courseCode">Course Code <span className="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    id="courseCode"
                    value={quizData.courseCode}
                    onChange={(e) => setQuizData(prev => ({ ...prev, courseCode: e.target.value }))}
                    placeholder="e.g., MATH-101"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                <Textarea
                  id="description"
                  value={quizData.description}
                  onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the quiz..."
                  className="min-h-[70px] resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Scheduling</CardTitle>
              <CardDescription>Set the availability window where students can access this quiz.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time <span className="text-red-500">*</span></Label>
                <Input
                  type="datetime-local"
                  id="startTime"
                  value={quizData.startTime}
                  onChange={(e) => setQuizData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time <span className="text-red-500">*</span></Label>
                <Input
                  type="datetime-local"
                  id="endTime"
                  value={quizData.endTime}
                  onChange={(e) => setQuizData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row justify-between items-center">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription className="mt-1">Add your questions, optional images, and correct answers.</CardDescription>
              </div>
              {quizData.questions.length > 0 && (
                <Badge variant="secondary" className="bg-white border-slate-200 text-slate-700">
                  {quizData.questions.length} Added
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 mb-8">
                <div className="space-y-2">
                  <Label htmlFor="questionText">Question Text</Label>
                  <Textarea
                    id="questionText"
                    value={currentQuestion.questionText}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                    placeholder="e.g., What is the capital of France?"
                    className="bg-white min-h-[80px] resize-none"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Question Image <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                  {currentQuestion.image ? (
                    <div className="relative rounded-lg border border-slate-200 overflow-hidden bg-white">
                      <img 
                        src={currentQuestion.image} 
                        alt="Question preview" 
                        className="w-full max-h-48 object-contain p-2"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-300 rounded-lg bg-white hover:border-slate-400 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <ImagePlus className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-medium text-slate-700">Click to upload image</span>
                        <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="correctAnswer">Correct Answer</Label>
                  <Input
                    id="correctAnswer"
                    value={currentQuestion.correctAnswer}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                    placeholder="e.g., Paris"
                    className="bg-white"
                  />
                </div>
                <div className="flex gap-4 items-end">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="points">Points</Label>
                    <Input
                      type="number"
                      id="points"
                      min="1"
                      value={currentQuestion.points}
                      onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                      className="bg-white"
                    />
                  </div>
                  <Button type="button" onClick={handleAddQuestion} className="gap-2">
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>
              </div>

              {quizData.questions.length > 0 && (
                <div className="space-y-3">
                  {quizData.questions.map((q, index) => (
                    <div key={index} className="flex items-start justify-between gap-4 border border-slate-200 rounded-lg p-4 bg-white shadow-sm hover:border-slate-300 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">Q{index + 1}</Badge>
                          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-none">{q.points} pt{q.points !== 1 ? 's' : ''}</Badge>
                          {q.image && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 gap-1">
                              <ImagePlus className="w-3 h-3" /> Image
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium text-slate-900 mb-1">{q.questionText}</p>
                        {q.image && (
                          <img src={q.image} alt={`Q${index + 1}`} className="w-20 h-14 object-cover rounded border border-slate-200 mb-1.5" />
                        )}
                        <p className="text-sm text-emerald-600 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {q.correctAnswer}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveQuestion(index)}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-slate-50 border-t border-slate-100 flex justify-end gap-3 p-6">
              <Button type="button" variant="secondary" onClick={() => {
                setQuizData({ title: '', subject: '', courseCode: '', description: '', startTime: '', endTime: '', questions: [] });
                setCurrentQuestion({ questionText: '', correctAnswer: '', points: 1, image: null });
              }}>
                Cancel
              </Button>
              <Button type="submit" size="lg" className="px-8 shadow-md bg-black text-white hover:bg-slate-800" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  'Publish Quiz'
                )}
              </Button>
            </CardFooter>
          </Card>

        </form>
      </div>
    </div>
  );
}
