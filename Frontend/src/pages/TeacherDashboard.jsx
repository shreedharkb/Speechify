import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StudentResponses from '../components/quiz/StudentResponses';
import DashboardPage from './DashboardPage';
import { Calendar } from '../components/ui/calendar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Skeleton } from '../components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../components/ui/empty';
import { 
  Play, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  Clock,
  Lock,
  RotateCcw,
  Maximize,
  Smartphone,
  Monitor,
  Library
} from 'lucide-react';

export default function TeacherDashboard({ setPage }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userName, setUserName] = useState('Teacher');
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [viewingResponses, setViewingResponses] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyQuizzes();
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        setUserName(user.name || 'Teacher');
      }
    } catch (error) {}
  }, []);

  const fetchMyQuizzes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quiz/teacher/quizzes`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        const quizzes = Array.isArray(data) ? data : (data.quizEvents || data);
        setMyQuizzes(quizzes);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (quiz) => {
    const now = new Date();
    const start = new Date(quiz.startTime);
    const end = new Date(quiz.endTime);
    
    if (now < start) {
      return (
        <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-700">
          <Clock size={12} />Upcoming
        </Badge>
      );
    }
    if (now > end) {
      return (
        <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700">
          <CheckCircle2 size={12} />Completed
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 border-blue-200 bg-blue-50 text-blue-700">
        <Play size={12} />Active
      </Badge>
    );
  };

  const totalStudents = myQuizzes.reduce((sum, q) => sum + (q.assignedTo?.length || q.totalStudents || q.participants?.length || 0), 0);
  const attemptedStudents = myQuizzes.reduce((sum, q) => sum + (q.participants?.length || q.attemptCount || 0), 0);
  const successRate = totalStudents > 0 ? Math.round((attemptedStudents / totalStudents) * 100) : 0;

  const getSubjectBreakdown = () => {
    if (!myQuizzes || myQuizzes.length === 0) {
      return [];
    }

    const subjectCounts = {};
    let total = 0;

    myQuizzes.forEach(quiz => {
      const subject = quiz.subject || 'Other';
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
      total++;
    });

    return Object.entries(subjectCounts)
      .map(([name, count]) => ({
        name,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage);
  };

  const subjects = getSubjectBreakdown();

  if (loading) {
    return (
      <DashboardLayout 
        role="teacher"
        userName={userName}
        activeSection={activeSection}
        onNavigate={setActiveSection}
        setPage={setPage}
      >
        <div className="space-y-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-6">
            <Skeleton className="w-full h-[240px] rounded-[20px]" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[300px] rounded-[20px]" />
            <Skeleton className="h-[300px] rounded-[20px]" />
            <Skeleton className="h-[300px] rounded-[20px]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      role="teacher"
      userName={userName}
      activeSection={activeSection}
      onNavigate={setActiveSection}
      setPage={setPage}
    >
      {activeSection === 'create-quiz' && (
        <DashboardPage setPage={setPage} />
      )}

      {(activeSection === 'dashboard' || activeSection === 'my-quizzes') && (
        <div className="space-y-6 max-w-7xl mx-auto">
          
          {/* Top Row Grid - Just Hero */}
          <div className="grid grid-cols-1 gap-6">

            {/* Hero Banner (Spans full width) */}
            <div className="w-full bg-white rounded-[20px] border border-slate-200/60 p-8 md:p-10 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[240px]">
              {/* Decorative background elements */}
              <div className="absolute top-4 right-1/4 w-2 h-2 rounded-full bg-blue-400 opacity-50"></div>
              <div className="absolute bottom-1/4 left-1/3 w-3 h-3 rounded-full bg-amber-400 opacity-50"></div>
              <div className="absolute top-1/3 right-12 w-2 h-2 rounded-full bg-emerald-400 opacity-50"></div>
              <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

              <div className="relative z-10 max-w-2xl">
                <h2 className="text-[32px] font-bold text-slate-900 mb-3 flex items-center gap-2">
                  Welcome back, {userName?.split(' ')[0] || 'Teacher'} <span className="text-3xl animate-wave origin-bottom-right inline-block">👋</span>
                </h2>
                <h3 className="text-[22px] font-medium text-slate-800 mb-3 tracking-tight leading-tight">
                  Ready to manage your classes<br/>and track student progress?
                </h3>
                <p className="text-slate-500 text-[15px] mb-8 max-w-md leading-relaxed">
                  Create quizzes, monitor student performance, and achieve your teaching goals seamlessly.
                </p>
                <div className="flex gap-4">
                  <Button className="bg-[#111827] hover:bg-black text-white rounded-[10px] px-7 h-[42px] font-medium shadow-sm" onClick={() => setActiveSection('create-quiz')}>
                    Create New Quiz
                  </Button>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Row Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Student Overall Success Rate */}
            <div className="bg-white rounded-[20px] border border-slate-200/60 p-6 shadow-sm flex flex-col">
              <h3 className="font-semibold text-slate-900 text-[15px] mb-6 tracking-tight">Student Overall Success Rate</h3>

              <div className="flex items-end justify-between mb-4">
                <span className="text-[42px] font-bold text-slate-900 leading-none tracking-tight">{successRate}%</span>
                {successRate > 0 && (
                  <span className="text-sm font-semibold text-emerald-500 flex items-center mb-1">
                    &uarr; 3%
                  </span>
                )}
              </div>

              <Progress value={successRate} className="h-2.5 mb-2 [&>div]:bg-slate-900" />

              <div className="flex justify-between text-[13px] text-slate-500 font-medium mb-8">
                <span>Previous: 0%</span>
                <span>Target: 100%</span>
              </div>

              <div className="space-y-4 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                    <div className="w-5 flex justify-center text-blue-500">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    Total Students
                  </div>
                  <span className="font-bold text-slate-900">{totalStudents}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                    <div className="w-5 flex justify-center text-emerald-500">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    Attempted Students
                  </div>
                  <span className="font-bold text-slate-900">{attemptedStudents}</span>
                </div>
              </div>

              <Progress value={successRate} className="h-2.5 mt-1 mb-2 [&>div]:bg-slate-900" />
              <div className="text-[13px] text-slate-500 font-medium mb-6">
                {successRate.toFixed(1)}% of total
              </div>

              <Button onClick={() => setActiveSection('analytics')} variant="outline" className="w-full mt-auto text-slate-700 font-medium text-[13px] border-slate-200/80 hover:bg-slate-50 shadow-sm h-10">
                View Details
              </Button>
            </div>

            {/* Most Activity */}
            <div className="bg-white rounded-[20px] border border-slate-200/60 p-6 shadow-sm flex flex-col items-center justify-center">
              <h3 className="font-semibold text-slate-900 text-[15px] mb-8 self-start tracking-tight">Most Activity</h3>
              
              {/* Pseudo Donut Chart */}
              <div className="relative w-44 h-44 mb-10 mt-4">
                {subjects.length > 0 ? (
                  <>
                    <div className="absolute inset-0 rounded-full border-[22px] border-[#111827]"></div>
                    <div className="absolute inset-0 rounded-full border-[22px] border-[#4b5563]" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 50% 100%)' }}></div>
                    <div className="absolute inset-0 rounded-full border-[22px] border-[#9ca3af]" style={{ clipPath: 'polygon(50% 50%, 100% 100%, 0 100%, 0 50%)' }}></div>
                  </>
                ) : (
                  <div className="absolute inset-0 rounded-full border-[22px] border-[#f1f5f9]"></div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[132px] h-[132px] bg-white rounded-full flex items-center justify-center">
                    {subjects.length === 0 && (
                      <span className="text-slate-400 font-medium text-[13px]">No activity yet</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between w-full mt-auto px-2">
                {subjects.length > 0 ? subjects.slice(0, 3).map((subject, index) => {
                  const colors = ["bg-[#111827]", "bg-[#4b5563]", "bg-[#9ca3af]"];
                  return (
                    <div key={subject.name} className="text-center">
                      <div className="flex items-center gap-2 justify-center mb-1.5 text-[13px] font-medium text-slate-600">
                        <div className={`w-2.5 h-2.5 rounded-full ${colors[index % colors.length]}`}></div>
                        <span className="truncate max-w-[60px]">{subject.name}</span>
                      </div>
                      <div className="font-bold text-slate-900 text-[15px]">{subject.percentage}%</div>
                    </div>
                  );
                }) : (
                  <div className="w-full text-center text-slate-400 text-sm italic py-2">
                    Create quizzes to see breakdown
                  </div>
                )}
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-[20px] border border-slate-200/60 p-4 shadow-sm flex flex-col items-center justify-center h-full">
              <Calendar
                mode="single"
                selected={calendarDate}
                onSelect={setCalendarDate}
                className="rounded-md w-full"
              />
            </div>

          </div>

          <div className="flex items-center justify-between mb-4 mt-2">
              <h3 className="text-lg font-semibold text-slate-900">Manage Quizzes</h3>
            </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Title</TableHead>
                  <TableHead className="px-6">Subject</TableHead>
                  <TableHead className="px-6 text-center">Status</TableHead>
                  <TableHead className="px-6">End Date</TableHead>
                  <TableHead className="px-6">Notes</TableHead>
                  <TableHead className="px-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myQuizzes.length > 0 ? myQuizzes.map((quiz, idx) => (
                  <TableRow key={quiz._id || quiz.id}>
                    <TableCell className="px-6 font-medium">{quiz.title}</TableCell>
                    <TableCell className="px-6 text-muted-foreground">{quiz.subject}</TableCell>
                    <TableCell className="px-6 text-center">{getStatusBadge(quiz)}</TableCell>
                    <TableCell className="px-6 text-muted-foreground">
                      {new Date(quiz.endTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell className="px-6 text-muted-foreground text-xs">
                      {quiz.questions?.length || 0} Questions included
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7 rounded border-slate-200 text-slate-500 hover:text-slate-900"
                                onClick={() => {
                                  setViewingResponses(quiz._id || quiz.id);
                                  setActiveSection('responses');
                                }}
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Responses</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7 rounded border-slate-200 text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete Quiz</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <Empty className="border-none w-full max-w-sm mx-auto">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Library className="h-6 w-6" />
                          </EmptyMedia>
                          <EmptyTitle>No quizzes found</EmptyTitle>
                          <EmptyDescription>
                            You haven't created any quizzes yet. Click "Create New Quiz" to get started.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {activeSection === 'responses' && viewingResponses && (
        <div className="w-full max-w-6xl mx-auto space-y-4">
          <Button variant="ghost" onClick={() => setActiveSection('my-quizzes')} className="mb-4 text-sm font-medium">
            ← Back to Quizzes
          </Button>
          <StudentResponses quizId={viewingResponses} />
        </div>
      )}
    </DashboardLayout>
  );
}
