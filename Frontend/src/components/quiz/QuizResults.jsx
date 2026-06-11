import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Target, CheckCircle2, XCircle, LayoutList, Trophy, ArrowLeft, Lightbulb, ChevronDown, ChevronUp, AudioLines } from 'lucide-react';
import { cn } from "@/lib/utils";

const QuizResults = ({ results, onBackToDashboard }) => {
  const [activeTab, setActiveTab] = useState('review');
  const [expandedQs, setExpandedQs] = useState({});

  const toggleAccordion = (idx) => {
    setExpandedQs(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const totalPoints = results.totalPossible || results.questions.reduce((sum, q) => sum + (q.maxPoints || q.points || 0), 0);
  const earnedPoints = results.score || results.questions.reduce((sum, q) => sum + (q.pointsEarned || 0), 0);
  const percentage = results.percentage || ((earnedPoints / totalPoints) * 100).toFixed(1);

  const totalQuestions = results.questions?.length || 0;
  const correctCount = results.questions?.filter(q => q.isCorrect).length || 0;
  const incorrectCount = totalQuestions - correctCount;

  const getPerformanceLevel = (percent) => {
    if (percent >= 90) return { level: 'Excellent', variant: 'default' };
    if (percent >= 75) return { level: 'Good', variant: 'secondary' };
    if (percent >= 60) return { level: 'Satisfactory', variant: 'outline' };
    return { level: 'Needs Improvement', variant: 'destructive' };
  };

  const performance = getPerformanceLevel(percentage);

  useEffect(() => {
    return () => {
      window.dispatchEvent(new Event('quizCompleted'));
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
      {/* NAV */}
      <div className="relative z-50 bg-white border-b border-gray-200 w-full sticky top-0">
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

          {/* MIDDLE: Empty on results page */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center">
            {/* Timer only exists in QuizAttempt */}
          </div>

          {/* RIGHT: Attempt / Results & Back */}
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100/80 rounded-full p-1 border border-gray-200/50">
              <div className="px-5 py-1 text-sm font-medium text-gray-500 cursor-default">Attempt</div>
              <div className="bg-white shadow-sm rounded-full px-5 py-1 text-sm font-medium text-black cursor-default">Results</div>
            </div>

            <Button variant="ghost" size="sm" onClick={onBackToDashboard} className="rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-medium text-black px-4 py-1.5 h-auto">
              Exit
            </Button>
          </div>
        </nav>
      </div>

      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Hero */}
        <Card className="text-center bg-card border shadow-sm">
          <CardContent className="pt-8 pb-6 px-6">
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 110 110">
                  <circle cx="55" cy="55" r="46" fill="none" stroke="currentColor" className="text-muted" strokeWidth="8" />
                  <circle cx="55" cy="55" r="46" fill="none" stroke="currentColor" className="text-primary transition-all duration-1000 ease-out" strokeWidth="8" strokeLinecap="round" strokeDasharray="289" strokeDashoffset={289 - (289 * percentage) / 100} />
                </svg>
                <div className="flex flex-col items-center justify-center relative z-10">
                  <div className="text-4xl font-bold font-mono tracking-tighter">{earnedPoints}</div>
                  <div className="text-sm text-muted-foreground font-medium">/ {totalPoints}</div>
                </div>
              </div>
            </div>

            <Badge variant={performance.variant} className="mb-4 text-sm px-4 py-1.5 uppercase tracking-wider font-bold">
              {performance.level}
            </Badge>
            <CardTitle className="text-2xl mb-2">{results.quizTitle}</CardTitle>
            <CardDescription className="text-base">You scored {percentage}% on this assessment</CardDescription>

          </CardContent>
        </Card>

        {activeTab === 'review' && (
          <div className="space-y-4">
            {results.questions.map((question, index) => {
              const isCorrect = question.isCorrect;
              const isExpanded = expandedQs[index];

              // Calculate simScore correctly 
              let rawSimScore = question.similarityScore;
              if (rawSimScore === undefined || rawSimScore === null) {
                rawSimScore = isCorrect ? 95 : 10;
              } else if (rawSimScore <= 1) {
                rawSimScore = rawSimScore * 100;
              }
              const simScore = Math.round(rawSimScore);

              return (
                <Card key={index} className="overflow-hidden bg-card border shadow-sm">
                  <CardHeader className="pb-3 bg-card">
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-base font-semibold leading-relaxed text-foreground/90">
                        <span className="text-muted-foreground mr-2 font-mono">Q{index + 1}.</span>
                        {question.questionText || question.question}
                      </CardTitle>
                      <Badge variant="outline" className={cn("shrink-0 font-mono text-sm px-3 py-1", isCorrect ? "border-green-200 text-green-700 bg-green-50/50" : "border-red-200 text-red-700 bg-red-50/50")}>
                        {question.pointsEarned || 0} / {question.maxPoints || question.points || 0}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 pt-4 pb-6">
                    <div className="flex flex-col gap-5 text-sm">
                      <div className="grid w-full gap-1.5 *:not-first:mt-2">
                        <Label className="font-semibold text-muted-foreground/70 uppercase tracking-widest text-[11px] pl-1">
                          Your Answer {isCorrect ? <span className="text-green-600 normal-case tracking-normal ml-1">(Correct)</span> : <span className="text-red-600 normal-case tracking-normal ml-1">(Incorrect)</span>}
                        </Label>
                        <Textarea
                          readOnly
                          value={question.studentAnswer || ''}
                          placeholder="No answer provided"
                          className="min-h-[100px] resize-none text-base cursor-default"
                        />
                      </div>

                      <div className="grid w-full gap-1.5 *:not-first:mt-2">
                        <Label className="font-semibold text-muted-foreground/70 uppercase tracking-widest text-[11px] pl-1">Correct Answer</Label>
                        <Textarea
                          readOnly
                          value={question.correctAnswer || ''}
                          className="min-h-[100px] resize-none text-base cursor-default"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-muted-foreground/70 uppercase tracking-widest text-[11px]">Semantic Match</span>
                        <span className={cn("font-semibold text-sm", isCorrect ? "text-green-600" : "text-red-600")}>{simScore}%</span>
                      </div>
                      <Progress value={simScore} className={cn("h-2", isCorrect ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500")} />
                    </div>
                  </CardContent>

                </Card>
              );
            })}

            <div className="flex justify-center pt-6 pb-8">
              <Button onClick={onBackToDashboard} size="lg" className="gap-2 px-8">
                <LayoutList className="w-4 h-4" /> Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizResults;
