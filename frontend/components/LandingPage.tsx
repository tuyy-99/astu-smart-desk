import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface LandingPageProps {
  user: User | null;
  onTriggerChat: (query: string) => void;
}

type FeatureColor = 'indigo' | 'teal' | 'blue' | 'purple';

interface FeatureItem {
  title: string;
  desc: string;
  icon: React.ReactNode;
  query: string;
  color: FeatureColor;
}

const colorClasses: Record<FeatureColor, string> = {
  indigo: 'text-indigo-600 dark:text-indigo-400',
  teal: 'text-teal-600 dark:text-teal-400',
  blue: 'text-blue-600 dark:text-blue-400',
  purple: 'text-purple-600 dark:text-purple-400',
};

const LandingPage: React.FC<LandingPageProps> = ({ user, onTriggerChat }) => {
  const navigate = useNavigate();
  // Dynamic image based on login status
  // Visitors see the gate (welcoming them in)
  // Logged-in users see the main building (they're inside)
  const gateImagePath = '/assets/astu-gate.jpg'; // Gate for visitors
  const buildingImagePath = '/assets/astu-main-building.jpg'; // Main building for logged-in users
  const heroImagePath = user ? buildingImagePath : gateImagePath;
  const fallbackImage = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=2070';
  const [imageError, setImageError] = React.useState(false);

  const handleAction = (query: string) => {
    if (!user) {
      navigate('/auth');
    } else {
      onTriggerChat(query);
    }
  };

  const features: FeatureItem[] = [
    {
      title: 'Registrar Rules',
      desc: 'Instant info on registration, grades, and graduation requirements.',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      query: 'What are the registrar rules for registration and grades?',
      color: 'indigo',
    },
    {
      title: 'Campus Services',
      desc: 'Find dorm info, meal plans, and student healthcare services.',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      query: 'What campus services are available for students?',
      color: 'teal',
    },
    {
      title: 'Internship & Jobs',
      desc: 'Connect with the industrial liaison office and career opportunities.',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      query: 'How do I find internship or job opportunities at ASTU?',
      color: 'blue',
    },
    {
      title: 'Bilingual Support',
      desc: 'Ask in English or Amharic for total inclusivity across campus.',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 4.5a18.031 18.031 0 01-2.357-3m0 0a12.973 12.973 0 013.468-5.333M12 19l-4-4 4-4m5 4l-5 5" />
        </svg>
      ),
      query: 'Can you help me in Amharic?',
      color: 'purple',
    },
  ];

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-950">
      <section className="relative isolate min-h-[92vh] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:bg-transparent">
        {/* Dark mode backgrounds */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.22),_transparent_48%),radial-gradient(circle_at_bottom_left,_rgba(14,116,144,0.2),_transparent_45%),linear-gradient(155deg,_#020617_12%,_#0f172a_52%,_#082f49_100%)] dark:opacity-100 opacity-0" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(2,6,23,0.94)_8%,rgba(2,6,23,0.55)_46%,rgba(2,6,23,0.78)_100%)] dark:opacity-100 opacity-0" />
        
        {/* Light mode backgrounds */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.15),_transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(14,116,144,0.12),_transparent_50%)] dark:opacity-0 opacity-100" />
        
        <div className="absolute -right-44 -top-24 h-80 w-80 rounded-full bg-cyan-400/25 dark:bg-cyan-400/25 blur-[140px]" />
        <div className="absolute -left-28 bottom-10 h-72 w-72 rounded-full bg-sky-500/20 dark:bg-sky-500/20 blur-[120px]" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 px-6 pb-20 pt-20 lg:grid-cols-2 lg:gap-20 lg:pt-24">
          <div className="space-y-8">

            <h1 className="text-5xl font-black leading-[0.9] tracking-tight text-slate-900 dark:text-white md:text-7xl">
              Campus Intelligence,
              <span className="block bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 dark:from-cyan-200 dark:via-sky-300 dark:to-blue-200 bg-clip-text text-transparent">
                Framed By Reality.
              </span>
            </h1>

            <p className="max-w-xl text-lg font-medium leading-relaxed text-slate-700 dark:text-slate-200 md:text-xl">
              Ask anything from registrar rules to student services while staying grounded in the real ASTU campus experience.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => handleAction('Hello! How can you help me today?')}
                className="group inline-flex items-center gap-3 rounded-2xl bg-cyan-500 dark:bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-white dark:text-slate-950 shadow-[0_18px_40px_-12px_rgba(34,211,238,0.75)] transition-all hover:-translate-y-0.5 hover:bg-cyan-600 dark:hover:bg-cyan-300"
              >
                Start Chatting
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              {!user && (
                <button
                  onClick={() => navigate('/auth')}
                  className="rounded-2xl border border-slate-300 dark:border-white/30 bg-white/80 dark:bg-white/10 px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-slate-700 dark:text-white backdrop-blur-xl transition-all hover:border-cyan-500 dark:hover:border-cyan-200 hover:bg-white dark:hover:bg-white/15"
                >
                  Sign In
                </button>
              )}
            </div>

            <div className="grid max-w-xl grid-cols-2 gap-3 pt-5 sm:grid-cols-4">
              {[
                { label: 'Docs', value: '200+' },
                { label: 'Coverage', value: '15 Offices' },
                { label: 'Access', value: '24/7' },
                { label: 'Languages', value: 'EN / AMH' },
              ].map((stat, index) => (
                <div 
                  key={stat.label} 
                  className="group rounded-xl border border-slate-200 dark:border-white/15 bg-white/80 dark:bg-white/10 px-3 py-3 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-cyan-500 dark:hover:border-cyan-400 hover:shadow-lg animate-count-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-sm font-black text-cyan-600 dark:text-cyan-200 transition-all group-hover:scale-110 group-hover:text-cyan-700 dark:group-hover:text-cyan-100">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ultra-Modern Image Showcase */}
          <div className="relative lg:justify-self-end">
            {/* Animated background elements */}
            <div className="pointer-events-none absolute -left-12 -top-12 h-72 w-72 rounded-full bg-cyan-400/20 dark:bg-cyan-400/20 blur-[100px] animate-pulse" />
            <div className="pointer-events-none absolute -right-12 -bottom-12 h-72 w-72 rounded-full bg-blue-500/20 dark:bg-blue-500/20 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            
            {/* Decorative frame layers */}
            <div className="pointer-events-none absolute -left-6 -top-6 h-full w-full rounded-[2.5rem] border-2 border-cyan-300/30 dark:border-cyan-300/30 animate-float" />
            <div className="pointer-events-none absolute -right-6 -bottom-6 h-full w-full rounded-[2.5rem] border-2 border-blue-400/20 dark:border-blue-400/20 animate-float-delayed" />
            
            {/* Main image container - Premium glass morphism design */}
            <div className="group relative overflow-hidden rounded-[2.5rem] border-2 border-slate-200 dark:border-white/40 bg-gradient-to-br from-white/90 via-slate-50/80 to-white/90 dark:from-slate-900/60 dark:via-slate-800/50 dark:to-slate-900/60 shadow-[0_40px_100px_-30px_rgba(8,145,178,0.6),0_0_60px_-25px_rgba(34,211,238,0.3)] dark:shadow-[0_40px_100px_-30px_rgba(8,145,178,0.9),0_0_100px_-25px_rgba(34,211,238,0.5),inset_0_2px_20px_rgba(255,255,255,0.1)] backdrop-blur-xl transition-all duration-700 hover:scale-[1.02] hover:shadow-[0_50px_120px_-35px_rgba(8,145,178,0.8)] dark:hover:shadow-[0_50px_120px_-35px_rgba(8,145,178,1),0_0_120px_-30px_rgba(34,211,238,0.7)]">
              
              {/* Top gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-blue-500/10 dark:from-cyan-400/15 dark:via-transparent dark:to-blue-500/15 mix-blend-overlay pointer-events-none z-10" />
              
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20">
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-cyan-400/50 via-blue-400/50 to-cyan-400/50 blur-xl animate-spin-slow" style={{ animationDuration: '8s' }} />
              </div>
              
              {/* Image with multiple fallbacks */}
              <div className="relative h-[520px] md:h-[600px] overflow-hidden">
                <img
                  src={imageError ? fallbackImage : heroImagePath}
                  alt={user 
                    ? "ASTU Main Building - Historic academic building with central tower, showcasing the university's architectural heritage and modern campus facilities"
                    : "ASTU Gate Entrance - Welcoming gateway to Adama Science and Technology University campus with iconic architecture"
                  }
                  className="h-full w-full object-cover object-center transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                  onError={(e) => {
                    if (!imageError) {
                      setImageError(true);
                      (e.target as HTMLImageElement).src = fallbackImage;
                    }
                  }}
                  loading="eager"
                />
                
                {/* Vignette effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent dark:from-slate-950/90 dark:via-slate-950/30 dark:to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/30 via-transparent to-slate-900/30 dark:from-slate-950/40 dark:via-transparent dark:to-slate-950/40 pointer-events-none" />
              </div>
              
              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-30">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 skew-x-12" />
              </div>
              
              {/* Text directly on image - No card background */}
              <div className="absolute inset-x-0 bottom-0 p-8 z-40">
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Status indicator */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_20px_6px_rgba(34,211,238,0.9)]" />
                        <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Live Campus View</span>
                    </div>
                    
                    {/* Location info - Clickable to search ASTU on Google Maps */}
                    <a
                      href="https://www.google.com/maps/search/ASTU"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group/link cursor-pointer"
                    >
                      <h3 className="text-2xl md:text-3xl font-black text-white leading-tight transition-all drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] group-hover/link:text-cyan-300 group-hover/link:drop-shadow-[0_4px_16px_rgba(34,211,238,0.8)]">
                        ASTU
                      </h3>
                      <p className="text-base md:text-lg font-bold text-cyan-300 mt-2 transition-all drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] group-hover/link:text-cyan-200">
                        Main Academic Building
                      </p>
                      <p className="text-sm font-semibold text-slate-200 mt-1 flex items-center gap-1 transition-all drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] group-hover/link:text-white">
                        Adama Science & Technology University
                        <svg className="h-3.5 w-3.5 opacity-0 -translate-x-1 transition-all group-hover/link:opacity-100 group-hover/link:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </p>
                    </a>
                    
                    {/* Location badge - Also clickable */}
                    <a
                      href="https://www.google.com/maps/search/Adama+Science+and+Technology+University"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border-2 border-white/40 bg-black/30 px-3 py-2 backdrop-blur-md transition-all hover:border-cyan-400 hover:bg-black/50 cursor-pointer drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                    >
                      <svg className="h-4 w-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-bold text-white">Adama, Ethiopia</span>
                      <svg className="h-3.5 w-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating badges with enhanced design - Light/Dark mode support */}
            <div className="absolute -left-6 top-12 z-50 animate-float">
              <div className="group/badge relative">
                <div className="absolute inset-0 rounded-xl bg-cyan-400/30 dark:bg-cyan-400/30 blur-xl group-hover/badge:bg-cyan-400/50 dark:group-hover/badge:bg-cyan-400/50 transition-all duration-500" />
                <div className="relative flex items-center gap-2 rounded-xl border-2 border-cyan-400/60 dark:border-cyan-300/50 bg-gradient-to-br from-white/95 via-cyan-50/90 to-white/95 dark:from-slate-900/95 dark:to-slate-800/95 px-4 py-2.5 shadow-[0_10px_40px_-10px_rgba(34,211,238,0.7)] backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-cyan-500 dark:hover:border-cyan-200">
                  <svg className="h-4 w-4 text-cyan-600 dark:text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800 dark:text-cyan-100">Verified Campus</span>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-8 bottom-32 z-50 animate-float-delayed">
              <div className="group/badge relative">
                <div className="absolute inset-0 rounded-lg bg-blue-400/30 dark:bg-blue-400/30 blur-lg group-hover/badge:bg-blue-400/50 dark:group-hover/badge:bg-blue-400/50 transition-all duration-500" />
                <div className="relative flex items-center gap-2 rounded-lg border-2 border-blue-400/60 dark:border-blue-300/50 bg-gradient-to-br from-white/95 via-blue-50/90 to-white/95 dark:from-slate-900/95 dark:to-slate-800/95 px-3 py-2 shadow-[0_8px_32px_-8px_rgba(59,130,246,0.7)] backdrop-blur-xl transition-all duration-500 hover:scale-105">
                  <span className="text-2xl">🎓</span>
                  <div className="text-xs font-black text-blue-700 dark:text-blue-200">Est. 2011</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -left-8 bottom-20 z-50 animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="group/badge relative">
                <div className="absolute inset-0 rounded-lg bg-purple-400/30 dark:bg-purple-400/30 blur-lg group-hover/badge:bg-purple-400/50 dark:group-hover/badge:bg-purple-400/50 transition-all duration-500" />
                <div className="relative rounded-lg border-2 border-purple-400/60 dark:border-purple-300/50 bg-gradient-to-br from-white/95 via-purple-50/90 to-white/95 dark:from-slate-900/95 dark:to-slate-800/95 px-3 py-2 shadow-[0_8px_32px_-8px_rgba(168,85,247,0.7)] backdrop-blur-xl transition-all duration-500 hover:scale-105">
                  <div className="text-xs font-black text-purple-700 dark:text-purple-200">15K+ Students</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-20 mx-auto max-w-7xl px-6 py-32">
        <div className="mb-24 space-y-6 text-center">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-6xl">ENGINEERED FOR EXCELLENCE.</h2>
          <p className="mx-auto max-w-2xl text-lg font-bold text-slate-500 dark:text-slate-400">
            Seamless integration with every department to bring the university to your fingertips.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              onClick={() => handleAction(f.query)}
              className="group relative cursor-pointer rounded-[2rem] border border-slate-100 bg-white p-8 shadow-[0_30px_80px_-35px_rgba(0,0,0,0.22)] transition-all duration-500 hover:-translate-y-3 hover:border-cyan-400 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
            >
              <div className={`mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 transition-all duration-500 group-hover:bg-cyan-500 group-hover:text-white ${colorClasses[f.color]} dark:bg-slate-800`}>
                {f.icon}
              </div>
              <h3 className="mb-4 text-2xl font-black text-slate-900 transition-colors group-hover:text-cyan-600 dark:text-white">
                {f.title}
              </h3>
              <p className="mb-7 text-base font-semibold leading-relaxed text-slate-500 dark:text-slate-400">{f.desc}</p>
              <div className="flex items-center text-[11px] font-black uppercase tracking-[0.16em] text-cyan-600 opacity-0 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100 dark:text-cyan-400">
                Ask SmartDesk
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="relative border-t border-slate-100 bg-slate-50 py-28 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center space-y-14 px-6 text-center">
          <div className="space-y-3">
            <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">PART OF THE ASTU ECOSYSTEM.</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Verified Data Sources</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-10 text-lg font-black tracking-tight text-slate-600 opacity-50 transition-all duration-700 hover:opacity-100 dark:text-slate-300">
            <div>ICT CENTER</div>
            <div>REGISTRAR OFFICE</div>
            <div>FINANCE DEPT</div>
            <div>STUDENT UNION</div>
          </div>

          <div className="pt-10 text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
            Copyright {new Date().getFullYear()} Adama Science &amp; Technology University AI Taskforce
          </div>
        </div>
      </footer>

      <div className="pointer-events-none absolute -right-80 top-[30%] h-[800px] w-[800px] rounded-full bg-cyan-500/5 blur-[150px]" />
      <div className="pointer-events-none absolute -left-80 bottom-[20%] h-[800px] w-[800px] rounded-full bg-blue-500/5 blur-[150px]" />
    </div>
  );
};

export default LandingPage;


