import { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, Search, Sun, Moon, Plus, LogOut, User, Settings, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs';
import { useDSA } from '../hooks/useDSA';

export default function TopNav() {
  const { theme, toggleTheme } = useTheme();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const navRef = useRef(null);
  const searchRef = useRef(null);

  const { data: jobs } = useJobs();
  const { data: dsa } = useDSA();
  const { data: profile } = useProfile();

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();
  const colorIndex = initial.charCodeAt(0) % 5;
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
  const avatarColor = colors[colorIndex];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Welcome to CareerOS!', time: 'Just now' },
    { id: 2, text: 'Review your upcoming DSA problems.', time: '1h ago' }
  ]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { jobs: [], dsa: [] };
    const q = searchQuery.toLowerCase();
    
    const matchedJobs = jobs 
      ? jobs.filter(j => j.company.toLowerCase().includes(q) || j.role.toLowerCase().includes(q))
      : [];
      
    const matchedDSA = dsa 
      ? dsa.filter(d => d.title.toLowerCase().includes(q) || d.pattern.toLowerCase().includes(q))
      : [];
      
    return { jobs: matchedJobs.slice(0, 3), dsa: matchedDSA.slice(0, 3) };
  }, [searchQuery, jobs, dsa]);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-30" ref={navRef}>
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md hidden sm:block" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search jobs, DSA problems..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearch(true);
            }}
            onFocus={() => setShowSearch(true)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-black/20 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-sm outline-none"
          />
          
          {showSearch && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-xl z-50 overflow-hidden">
               {searchResults.jobs.length > 0 && (
                 <div className="py-2">
                   <div className="px-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Jobs</div>
                   {searchResults.jobs.map(j => (
                     <button 
                       key={j.id} 
                       onClick={() => { setShowSearch(false); setSearchQuery(''); navigate('/jobs'); }}
                       className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                     >
                       <p className="text-sm font-medium">{j.role}</p>
                       <p className="text-xs text-gray-500">{j.company} • {j.column_id}</p>
                     </button>
                   ))}
                 </div>
               )}
               {searchResults.dsa.length > 0 && (
                 <div className="py-2 border-t border-[var(--border)]">
                   <div className="px-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">DSA Problems</div>
                   {searchResults.dsa.map(d => (
                     <button 
                       key={d.id} 
                       onClick={() => { setShowSearch(false); setSearchQuery(''); navigate('/dsa'); }}
                       className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                     >
                       <p className="text-sm font-medium">{d.title}</p>
                       <p className="text-xs text-gray-500">{d.difficulty} • {d.pattern}</p>
                     </button>
                   ))}
                 </div>
               )}
               {searchResults.jobs.length === 0 && searchResults.dsa.length === 0 && (
                 <div className="p-4 text-center text-sm text-gray-500">No results found for "{searchQuery}"</div>
               )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileDropdown(false);
            }} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-black/20 text-gray-600 dark:text-gray-300 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[var(--background)]"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)] flex justify-between items-center bg-gray-50/50 dark:bg-black/10">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {notifications.length > 0 && (
                  <button onClick={() => setNotifications([])} className="text-xs text-[var(--primary)] hover:underline">Mark all as read</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div key={n.id} className="px-4 py-3 border-b border-[var(--border)] last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                      <p className="text-sm text-gray-800 dark:text-gray-200 mb-1">{n.text}</p>
                      <p className="text-xs text-gray-500">{n.time}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 flex flex-col items-center">
                    <CheckCircle2 className="w-8 h-8 mb-2 text-green-500/50" />
                    <p className="text-sm">You're all caught up!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative ml-2">
          <button 
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotifications(false);
            }}
            className={`w-8 h-8 rounded-full ${avatarColor} text-white flex items-center justify-center font-semibold text-sm shadow-sm cursor-pointer hover:opacity-90 transition-opacity`}
          >
            {initial}
          </button>
          
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-xl z-50 py-1 overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)] bg-gray-50/50 dark:bg-black/10">
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-0.5">Signed in as</p>
                <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">{displayName}</p>
              </div>
              <div className="py-1">
                <button 
                  onClick={() => { setShowProfileDropdown(false); navigate('/profile'); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                >
                  <User className="w-4 h-4" /> Profile
                </button>
                <button 
                  onClick={() => { setShowProfileDropdown(false); navigate('/settings'); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                >
                  <Settings className="w-4 h-4" /> Settings
                </button>
              </div>
              <div className="border-t border-[var(--border)] py-1">
                <button 
                  onClick={() => {
                    setShowProfileDropdown(false);
                    signOut();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
