import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Target, CheckCircle2, XCircle, LayoutList, Trophy, ArrowLeft, Lightbulb } from 'lucide-react';
import { cn } from "@/lib/utils";

const QuizResults = ({ results, onBackToDashboard }) => {
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
    <div className="min-h-screen bg-muted p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Results Header */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="uppercase text-xs font-semibold">
                  Assessment Results
                </Badge>
                <Badge variant={performance.variant}>
                  {performance.level}
                </Badge>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">
                {results.quizTitle}
              </CardTitle>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted border min-w-[120px]">
              <div className="text-3xl font-bold tracking-tight mb-1 text-foreground">
                {percentage}%
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Final Score
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Questions
              </CardTitle>
              <LayoutList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuestions}</div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Points Scored
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{earnedPoints}/{totalPoints}</div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Correct
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{correctCount}</div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Incorrect
              </CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{incorrectCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Review Section */}
        <div className="space-y-4 pt-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Detailed Answer Review</h2>
            <p className="text-sm text-muted-foreground">Review your answers and see where you can improve.</p>
          </div>

          <div className="space-y-6">
            {results.questions.map((question, index) => {
              const isCorrect = question.isCorrect;

              return (
                <Card key={index} className="shadow-none overflow-hidden">
                  <div className={cn("px-6 py-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b", isCorrect ? "bg-emerald-500/10" : "bg-destructive/10")}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border text-sm font-medium">
                        {index + 1}
                      </div>
                      <h3 className="text-base font-semibold leading-none">
                        {question.questionText || question.question}
                      </h3>
                    </div>
                    <Badge variant={isCorrect ? "default" : "destructive"} className="shrink-0">
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </div>

                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground border-b pb-4">
                      <span className="font-medium">Points Earned:</span>
                      <span className={isCorrect ? "text-emerald-600 font-semibold" : "text-destructive font-semibold"}>
                        {question.pointsEarned?.toFixed(2) || 0} / {question.maxPoints || question.points || 0}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Answer</div>
                        <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap border">
                          {question.studentAnswer || <span className="text-muted-foreground italic">No answer provided</span>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Correct Answer</div>
                        <div className="bg-emerald-500/10 border-emerald-500/20 border p-4 rounded-md text-sm whitespace-pre-wrap text-emerald-800 dark:text-emerald-300">
                          {question.correctAnswer}
                        </div>
                      </div>
                    </div>

                    {!isCorrect && question.explanation && (
                      <div className="mt-4 bg-muted p-4 rounded-md border flex gap-3 items-start">
                        <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-foreground">Feedback & Suggestion</div>
                          <div className="text-sm text-muted-foreground leading-relaxed">
                            {question.explanation}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 pb-12 flex justify-start">
          <Button
            variant="default"
            onClick={onBackToDashboard}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </div>

      </div>
    </div>
  );
};

export default QuizResults;
