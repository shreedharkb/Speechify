import React from 'react';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { DroppingLines } from '../components/DroppingLines';

const HomePage = ({ setPage, user }) => {

  const platformFeatures = [
    {
      title: 'Interactive Quizzes',
      desc: 'Engage with dynamic quizzes designed to test your knowledge and enhance learning outcomes.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      ),
      iconColor: 'text-white',
      iconBg: 'bg-white/20'
    },
    {
      title: 'Real-time Analytics',
      desc: 'Track performance metrics and gain insights with comprehensive analytics dashboards.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      iconColor: 'text-white',
      iconBg: 'bg-white/20'
    },
    {
      title: 'Teacher Dashboard',
      desc: 'Create, manage, and monitor quizzes with powerful tools designed for educators.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      ),
      iconColor: 'text-white',
      iconBg: 'bg-white/20'
    },
    {
      title: 'AI Smart Grading',
      desc: 'AI-powered grading that evaluates answers accurately and provides detailed feedback.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
        </svg>
      ),
      iconColor: 'text-white',
      iconBg: 'bg-white/20'
    },
  ];

  return (
    <div className="bg-gradient-to-b from-white via-[oklch(98%_0.01_60.8)] to-[oklch(95%_0.02_60.8)] min-h-[calc(100vh-140px)]">
      {/* ===== HERO SECTION (Style 8) ===== */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <DroppingLines />
        {/* Subtle grid background */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="relative z-10 max-w-[800px] mx-auto text-center">
          {/* Heading */}
          <h1 className="animate-fade-in-up text-4xl sm:text-5xl md:text-[4rem] font-extrabold text-[#0f172a] leading-[1.1] tracking-tight mb-6">
            Start using our app today.
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up-delay-1 text-lg text-[#64748b] max-w-[500px] mx-auto mb-10 leading-relaxed">
            Contact us with any query or any idea. Our intelligent platform empowers both students and teachers.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up-delay-2 flex flex-wrap gap-4 justify-center items-center">
            <Button size="lg" onClick={() => setPage('role-selection')} className="rounded-lg h-12 px-8 bg-[oklch(61%_0.09_60.8)] text-white hover:opacity-90 transition-colors border-none">
              Get Started
            </Button>
            <button
              onClick={() => setPage('login')}
              className="text-[#0f172a] font-medium text-sm flex items-center gap-1 hover:opacity-70 transition-opacity"
            >
              Learn more
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION (Style 2) ===== */}
      <section className="py-24 px-6 border-t border-[oklch(55%_0.09_60.8)] bg-[oklch(61%_0.09_60.8)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-start">

            {/* Left side: Heading */}
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-6 text-xs font-bold text-white/70 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-white/50"></span>
                Complete Solution
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight leading-[1.15]">
                The comprehensive <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">learning platform</span> and assessment tool
              </h2>
              <p className="text-base text-white/90 mb-8 leading-relaxed">
                Advanced platform for building quizzes, testing knowledge, and tracking progress. Includes real-time analytics, AI smart grading, and custom dashboards.
              </p>
              <Button size="lg" onClick={() => setPage('role-selection')} className="rounded-lg bg-white text-[oklch(61%_0.09_60.8)] font-bold hover:bg-slate-100 transition-colors border-none shadow-lg">
                Get Started
              </Button>
            </div>

            {/* Right side: Feature Grid */}
            <div className="flex flex-col">
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-x-8">
                <div className="pb-8">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${platformFeatures[0].iconBg} ${platformFeatures[0].iconColor}`}>
                    {platformFeatures[0].icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{platformFeatures[0].title}</h3>
                  <p className="text-sm text-white/80 leading-relaxed">{platformFeatures[0].desc}</p>
                </div>
                
                <Separator orientation="vertical" className="hidden sm:block h-auto bg-white/20" />
                <Separator orientation="horizontal" className="sm:hidden w-full bg-white/20 my-8" />

                <div className="pb-8">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${platformFeatures[1].iconBg} ${platformFeatures[1].iconColor}`}>
                    {platformFeatures[1].icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{platformFeatures[1].title}</h3>
                  <p className="text-sm text-white/80 leading-relaxed">{platformFeatures[1].desc}</p>
                </div>
              </div>

              <Separator orientation="horizontal" className="w-full bg-white/20" />

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-x-8">
                <div className="pt-8">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${platformFeatures[2].iconBg} ${platformFeatures[2].iconColor}`}>
                    {platformFeatures[2].icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{platformFeatures[2].title}</h3>
                  <p className="text-sm text-white/80 leading-relaxed">{platformFeatures[2].desc}</p>
                </div>
                
                <Separator orientation="vertical" className="hidden sm:block h-auto bg-white/20" />
                <Separator orientation="horizontal" className="sm:hidden w-full bg-white/20 my-8" />

                <div className="pt-8">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${platformFeatures[3].iconBg} ${platformFeatures[3].iconColor}`}>
                    {platformFeatures[3].icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{platformFeatures[3].title}</h3>
                  <p className="text-sm text-white/80 leading-relaxed">{platformFeatures[3].desc}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
