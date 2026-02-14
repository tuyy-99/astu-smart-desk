
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, toggleTheme, isDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 ${
      isHome 
        ? (isScrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-xl' : 'bg-transparent')
        : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky'
    }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 cursor-pointer group min-w-0" onClick={() => navigate('/')}>
          <div className="relative bg-white dark:bg-slate-800 p-1.5 sm:p-2 rounded-[1rem] shadow-lg group-hover:scale-110 transition-all duration-300 border-2 border-slate-200 dark:border-slate-700 shrink-0">
            <img 
              src="/assets/astu-logo.png" 
              alt="ASTU Logo" 
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain"
              onError={(e) => {
                // Fallback to building icon if logo not found
                (e.target as HTMLImageElement).style.display = 'none';
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('class', 'w-10 h-10 sm:w-11 sm:h-11 text-indigo-600 dark:text-indigo-400');
                svg.setAttribute('fill', 'none');
                svg.setAttribute('stroke', 'currentColor');
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />';
                (e.target as HTMLImageElement).parentElement?.appendChild(svg);
              }}
            />
          </div>
          <span className={`text-lg sm:text-xl md:text-2xl font-black tracking-tighter transition-colors truncate ${
            isHome && !isScrolled ? 'text-white' : 'text-slate-900 dark:text-white'
          }`}>
            ASTU <span className="text-indigo-600 dark:text-indigo-400">SmartDesk</span>
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-8">
          <button 
            onClick={toggleTheme}
            className={`p-2.5 rounded-2xl transition-all hover:scale-110 active:scale-90 ${
              isHome && !isScrolled 
                ? 'bg-white/10 text-white hover:bg-white/20' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>

          {user ? (
            <div className="flex items-center space-x-6">
              {(user.role === 'admin' || user.role === 'staff') && (
                <Link to="/admin" className={`font-black text-xs uppercase tracking-widest transition-colors ${
                  isHome && !isScrolled ? 'text-white/80 hover:text-white' : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                }`}>Dashboard</Link>
              )}
              <div className="flex items-center space-x-4 pl-6 border-l border-slate-200/20">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg">
                  {user.name.charAt(0)}
                </div>
                <button 
                  onClick={onLogout}
                  className={`font-black text-xs uppercase tracking-widest transition-colors ${
                    isHome && !isScrolled ? 'text-red-300 hover:text-red-400' : 'text-red-500 hover:text-red-600'
                  }`}
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                isHome && !isScrolled 
                  ? 'bg-white text-indigo-900 hover:bg-slate-100 shadow-xl' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none'
              }`}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

