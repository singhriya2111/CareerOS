import { useState } from 'react';
import { Bell, Search, Sun, Moon, Plus, LogOut, User, Settings, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function TopNav() {
  const { theme, toggleTheme } = useTheme();
  const { signOut, user } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Welcome to CareerOS!', time: 'Just now' },
    { id: 2, text: 'Review your upcoming DSA problems.', time: '1h ago' }
  ]);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search jobs, resumes, notes..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-black/20 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => alert('Quick Add feature coming soon! (Phase 6)')}
          className="hidden sm:flex items-center gap-2 btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>Quick Add</span>
        </button>
        
        <div className="h-6 w-px bg-gray-200 dark:bg-black/40 mx-1 hidden sm:block"></div>

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
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
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
            </>
          )}
        </div>

        <div className="relative ml-2">
          <button 
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotifications(false);
            }}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--primary)] to-indigo-500 text-white flex items-center justify-center font-semibold text-sm shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
          >
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </button>
          
          {showProfileDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)}></div>
              <div className="absolute right-0 mt-2 w-56 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-xl z-50 py-1 overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border)] bg-gray-50/50 dark:bg-black/10">
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-0.5">Signed in as</p>
                  <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors">
                    <User className="w-4 h-4" /> Profile
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors">
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}
