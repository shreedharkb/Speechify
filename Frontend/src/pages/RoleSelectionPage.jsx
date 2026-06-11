import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { GraduationCap, BookOpen, ArrowRight, Sparkles } from 'lucide-react';

export default function RoleSelectionPage({ setPage }) {
  const handleRoleSelection = (role) => {
    localStorage.setItem('selectedRole', role);
    setPage('signup');
  };

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center px-6 py-16 bg-gradient-to-br from-white via-[oklch(97%_0.01_60.8)] to-[oklch(94%_0.03_60.8)] overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[oklch(61%_0.09_60.8)]/15 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/40 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-[640px] animate-fade-in-up">


        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight mb-3">Join us today</h1>
          <p className="text-base text-slate-500 max-w-[400px] mx-auto">
            Choose how you want to use the platform. You can always change this later in your settings.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {/* Teacher Card */}
          <Card 
            onClick={() => handleRoleSelection('teacher')}
            className="cursor-pointer group relative overflow-hidden border-slate-200 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-500 bg-white"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-8 flex flex-col items-center text-center relative z-10 h-full justify-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-purple-600/20 transition-all duration-500 mb-6">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">I'm a Teacher</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">Create quizzes, manage classes, and track student progress.</p>
              <div className="mt-auto flex items-center text-sm font-semibold text-purple-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500">
                Continue as Teacher <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </CardContent>
          </Card>

          {/* Student Card */}
          <Card 
            onClick={() => handleRoleSelection('student')}
            className="cursor-pointer group relative overflow-hidden border-slate-200 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 bg-white"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-8 flex flex-col items-center text-center relative z-10 h-full justify-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/20 transition-all duration-500 mb-6">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">I'm a Student</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">Take assessments, view your grades, and improve your skills.</p>
              <div className="mt-auto flex items-center text-sm font-semibold text-blue-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500">
                Continue as Student <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Already have an account?</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Footer links */}
        <div className="text-center">
          <Button 
            className="w-full sm:w-auto px-10 h-12 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all hover:shadow-lg"
            onClick={(e) => { e.preventDefault(); setPage('login'); }}
          >
            Sign in to Speechify
          </Button>
        </div>
      </div>
    </section>
  );
}
