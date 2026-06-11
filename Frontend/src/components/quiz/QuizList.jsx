import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { getAuthToken, clearAuth } from '../../utils/auth';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Skeleton } from '../ui/skeleton';
import { Progress } from '../ui/progress';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../ui/empty';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Clock,
  Lock,
  RotateCcw,
  Maximize,
  Smartphone,
  Monitor,
  Eye,
  FileText,
  BookOpen
} from 'lucide-react';

const QuizList = ({ onQuizSelect, user, setPage }) => {
  const [quizEvents, setQuizEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [analytics, setAnalytics] = useState({
    totalAttempts: 0,
    avgPercentage: 0,
    totalScore: 0,
    accuracy: 0,
    totalTimeMinutes: 0
  });

  useEffect(() => {
    fetchQuizEvents();
    fetchStudentAnalytics();
  }, []);

  const fetchStudentAnalytics = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quiz-attempt/history`, {
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.attempts && data.attempts.length > 0) {
          setQuizHistory(data.attempts);
          const totalAttempts = data.attempts.length;
          const totalScore = data.attempts.reduce((sum, att) => sum + (att.score || 0), 0);
          const totalPossible = data.attempts.reduce((sum, att) => {
            return sum + (att.answers?.reduce((s, a) => s + (a.maxPoints || a.points || 0), 0) || 0);
          }, 0);
          const avgPercentage = totalPossible > 0 ? ((totalScore / totalPossible) * 100).toFixed(1) : 0;

          setAnalytics({
            totalAttempts,
            avgPercentage,
            totalScore: totalScore.toFixed(1),
            accuracy: avgPercentage,
            totalTimeMinutes: 15 * totalAttempts
          });
        }
      }
    } catch (err) { }
  };

  const fetchQuizEvents = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Please log in to view quizzes.');
        setLoading(false);
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quiz`, {
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token }
      });
      if (response.ok) {
        const data = await response.json();
        setQuizEvents(Array.isArray(data.quizEvents || data) ? (data.quizEvents || data) : []);
      }
    } catch (err) {
      setError('Failed to fetch quizzes.');
    } finally {
      setLoading(false);
    }
  };

  const getQuizStatus = (quiz) => {
    const now = new Date();
    const endTime = new Date(quiz.endTime);
    // Check if user has attempted using the passed quizHistory
    const hasAttempted = quizHistory.some(attempt => attempt.quizId === (quiz.id || quiz._id));

    if (hasAttempted) return { status: 'completed', label: 'Completed', icon: <CheckCircle2 size={12} />, badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
    if (now > endTime) return { status: 'missing', label: 'Missing', icon: <XCircle size={12} />, badgeClass: 'border-red-200 bg-red-50 text-red-700' };
    return { status: 'active', label: 'Active', icon: <Play size={12} />, badgeClass: 'border-blue-200 bg-blue-50 text-blue-700' };
  };

  const handleParticipate = (quizEvent) => {
    if (getQuizStatus(quizEvent).status === 'active') {
      onQuizSelect(quizEvent);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        role="student"
        userName={user?.name}
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

  const activeOrMissingQuizzesRaw = quizEvents.filter(q => {
    const status = getQuizStatus(q).status;
    return status === 'active' || status === 'missing';
  });

  const activeOrMissingQuizzes = selectedSubject === "all"
    ? activeOrMissingQuizzesRaw
    : activeOrMissingQuizzesRaw.filter(q => q.subject === selectedSubject);

  const getSubjectBreakdown = () => {
    if (!quizHistory || quizHistory.length === 0) {
      return [];
    }
    const counts = {};
    quizHistory.forEach(att => {
      const subject = att.quizId?.subject || 'Other';
      counts[subject] = (counts[subject] || 0) + 1;
    });
    const total = quizHistory.length;
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 3).map(([name, count], index) => {
      const colors = ["#111827", "#4b5563", "#9ca3af"];
      return {
        name,
        percentage: ((count / total) * 100).toFixed(1),
        color: colors[index % colors.length]
      };
    });
  };

  const subjects = getSubjectBreakdown();

  const pendingCount = activeOrMissingQuizzesRaw.length;
  const completedCount = analytics.totalAttempts || 0;
  const totalCount = pendingCount + completedCount;
  const pendingPercent = totalCount === 0 ? 0 : Math.round((pendingCount / totalCount) * 100);
  const completedPercent = totalCount === 0 ? 0 : 100 - pendingPercent;

  return (
    <DashboardLayout
      role="student"
      userName={user?.name}
      activeSection={activeSection}
      onNavigate={setActiveSection}
      setPage={setPage}
    >
      {activeSection === 'dashboard' && (
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
                  Hi, {user?.name?.split(' ')[0] || 'Andrew'} <span className="text-3xl animate-wave origin-bottom-right inline-block">👋</span>
                </h2>
                <h3 className="text-[22px] font-medium text-slate-800 mb-3 tracking-tight leading-tight">
                  What do you want to learn today<br />with your partner?
                </h3>
                <p className="text-slate-500 text-[15px] mb-8 max-w-md leading-relaxed">
                  Discover courses, track progress, and achieve your learning goals seamlessly.
                </p>
                <div className="flex gap-4">
                  <Button className="bg-[#111827] hover:bg-black text-white rounded-[10px] px-7 h-[42px] font-medium shadow-sm">
                    Explorer Course
                  </Button>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Row Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Most Activity - Synced with actual user data */}
            <div className="bg-white rounded-[20px] border border-slate-200/60 p-6 shadow-sm flex flex-col items-center justify-center">
              <h3 className="font-semibold text-slate-900 text-[15px] mb-8 self-start tracking-tight">Most Activity</h3>

              {/* Dynamic SVG Donut Chart */}
              <div className="relative w-44 h-44 mb-10 mt-4">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4.5"></circle>
                  {subjects.length > 0 && (() => {
                    let offset = 25;
                    return subjects.map((sub, i) => {
                      const percentage = Number(sub.percentage);
                      if (percentage <= 0) return null;
                      const dasharray = `${percentage} ${100 - percentage}`;
                      const currentOffset = offset;
                      offset -= percentage;
                      return (
                        <circle
                          key={i}
                          cx="18" cy="18" r="15.915"
                          fill="transparent"
                          stroke={sub.color}
                          strokeWidth="4.5"
                          strokeDasharray={dasharray}
                          strokeDashoffset={currentOffset}
                          className="transition-all duration-1000 ease-out"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {subjects.length === 0 || subjects.every(s => Number(s.percentage) === 0) ? (
                    <span className="text-slate-400 font-medium text-[13px]">No activity yet</span>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-between w-full mt-auto px-2">
                {subjects.length > 0 ? subjects.map((sub, i) => (
                  <div key={i} className="text-center">
                    <div className="flex items-center gap-2 justify-center mb-1.5 text-[13px] font-medium text-slate-600">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }}></div> {sub.name}
                    </div>
                    <div className="font-bold text-slate-900 text-[15px]">{sub.percentage}%</div>
                  </div>
                )) : (
                  <div className="w-full text-center text-slate-500 text-[13px] font-medium py-2">No activity yet</div>
                )}
              </div>
            </div>

            {/* Progress Statistics (Realistic) */}
            <div className="bg-white rounded-[20px] border border-slate-200/60 p-6 shadow-sm flex flex-col">
              <h3 className="font-semibold text-slate-900 text-[15px] mb-8 tracking-tight">Progress Statistics</h3>

              <div className="text-center mb-8">
                <p className="text-[13px] text-slate-700 font-medium mb-2">Total Score</p>
                <h4 className="text-[42px] font-bold font-sans text-slate-900 leading-none tracking-tight">{analytics.totalScore}</h4>

                <div className="flex items-center gap-4 mt-6">
                  <div className="flex-1">
                    <Progress value={pendingPercent} className="h-2 [&>div]:bg-[#ff7300]" />
                  </div>
                  <div className="text-[12px] text-slate-500 font-medium shrink-0 w-8 text-right">{pendingPercent}%</div>
                  <div className="flex-1">
                    <Progress value={completedPercent} className="h-2 [&>div]:bg-[#00c458]" />
                  </div>
                  <div className="text-[12px] text-slate-500 font-medium shrink-0 w-8 text-right">{completedPercent}%</div>
                </div>
              </div>

              <div className="space-y-4 mt-auto">
                <div className="flex items-center justify-between border border-slate-200/80 p-4 rounded-[14px] shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[10px] bg-[#111827] text-white flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><circle cx="12" cy="15" r="2" /></svg>
                    </div>
                    <span className="font-bold font-sans text-slate-900 text-2xl leading-none">{activeOrMissingQuizzesRaw.length}</span>
                  </div>
                  <div className="bg-[#ff7300] text-white text-[13px] font-medium py-1.5 rounded-full w-[96px] text-center">
                    Pending
                  </div>
                </div>

                <div className="flex items-center justify-between border border-slate-200/80 p-4 rounded-[14px] shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[10px] bg-[#111827] text-white flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="m9 16 2 2 4-4" /></svg>
                    </div>
                    <span className="font-bold font-sans text-slate-900 text-2xl leading-none">{analytics.totalAttempts}</span>
                  </div>
                  <div className="bg-[#00c458] text-white text-[13px] font-medium py-1.5 rounded-full w-[96px] text-center">
                    Completed
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-[20px] border border-slate-200/60 p-4 shadow-sm flex flex-col items-center justify-center h-full">
              <CalendarComponent
                mode="single"
                selected={calendarDate}
                onSelect={setCalendarDate}
                className="rounded-[14px] border-0 w-full"
                modifiers={{ hasQuiz: activeOrMissingQuizzesRaw.map(q => new Date(q.endTime)) }}
                modifiersClassNames={{ hasQuiz: "font-bold text-[#ff7300] bg-orange-50 underline decoration-2 underline-offset-4" }}
                captionLayout="dropdown"
              />
            </div>

          </div>
        </div>
      )}

      {activeSection === 'quizzes' && (
        <div className="w-full max-w-6xl mx-auto space-y-6">
          <Tabs defaultValue="available" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-slate-100/80 p-1 rounded-lg">
                <TabsTrigger value="available" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Available Quizzes
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="available">
              <div className="flex items-center justify-between mb-4 mt-2">
                <h3 className="text-lg font-semibold text-slate-900">Available Quizzes</h3>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {Array.from(new Set(activeOrMissingQuizzesRaw.map(q => q.subject).filter(Boolean))).map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-6">Title</TableHead>
                      <TableHead className="px-6">Subject</TableHead>
                      <TableHead className="px-6 text-center">Status</TableHead>
                      <TableHead className="px-6">Due Date</TableHead>
                      <TableHead className="px-6">Notes</TableHead>
                      <TableHead className="px-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeOrMissingQuizzes.length > 0 ? activeOrMissingQuizzes.map((quiz) => {
                      const statusInfo = getQuizStatus(quiz);
                      return (
                        <TableRow key={quiz._id || quiz.id}>
                          <TableCell className="px-6 font-medium">{quiz.title}</TableCell>
                          <TableCell className="px-6 text-muted-foreground">{quiz.subject}</TableCell>
                          <TableCell className="px-6 text-center">
                            <Badge variant="outline" className={`gap-1 ${statusInfo.badgeClass}`}>
                              {statusInfo.icon}{statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 text-muted-foreground">
                            {new Date(quiz.endTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </TableCell>
                          <TableCell className="px-6 text-muted-foreground text-xs">{quiz.questions?.length || 0} Questions</TableCell>
                          <TableCell className="px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={statusInfo.status === 'missing' || statusInfo.status === 'completed'}
                                className={`h-8 px-3 rounded-md border-slate-200 ${statusInfo.status === 'missing' ? 'opacity-50 cursor-not-allowed bg-slate-50' :
                                  statusInfo.status === 'completed' ? 'opacity-70 cursor-not-allowed bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                                  }`}
                                onClick={() => handleParticipate(quiz)}
                              >
                                {statusInfo.status === 'completed' ? (
                                  <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Completed</>
                                ) : (
                                  <><Play className="w-3.5 h-3.5 mr-1.5" /> Attempt</>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center">
                          <Empty className="border-none w-full max-w-sm mx-auto">
                            <EmptyHeader>
                              <EmptyMedia variant="icon">
                                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                              </EmptyMedia>
                              <EmptyTitle>You're all caught up!</EmptyTitle>
                              <EmptyDescription>
                                There are no pending quizzes for you to complete at this time.
                              </EmptyDescription>
                            </EmptyHeader>
                          </Empty>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </DashboardLayout>
  );
};

export default QuizList;
