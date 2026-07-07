import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { User, Palette, Link as LinkIcon, LogOut, Sun, Moon, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('account');
  const [lcUsername, setLcUsername] = useState(() => localStorage.getItem('leetcode_username') || '');
  const [savedMessage, setSavedMessage] = useState('');

  const handleSaveLC = () => {
    localStorage.setItem('leetcode_username', lcUsername);
    setSavedMessage('LeetCode integration updated!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: LinkIcon }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Manage your account preferences and integrations</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-col space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm p-6 min-h-[400px]">
          {activeTab === 'account' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                <div className="bg-gray-50 dark:bg-black/10 rounded-xl p-4 border border-[var(--border)]">
                  <label className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Email Address</label>
                  <p className="font-medium text-gray-900 dark:text-white">{user?.email}</p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-[var(--border)]">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>
                <button 
                  onClick={signOut}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h3 className="text-lg font-semibold mb-4">Theme Preferences</h3>
                <div className="grid grid-cols-2 gap-4 max-w-sm">
                  <button
                    onClick={() => theme !== 'light' && toggleTheme()}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      theme === 'light' 
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                        : 'border-[var(--border)] hover:border-gray-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <Sun className={`w-8 h-8 ${theme === 'light' ? 'text-[var(--primary)]' : 'text-gray-400'}`} />
                    <span className="font-medium text-sm">Light Mode</span>
                  </button>
                  <button
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      theme === 'dark' 
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                        : 'border-[var(--border)] hover:border-gray-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <Moon className={`w-8 h-8 ${theme === 'dark' ? 'text-[var(--primary)]' : 'text-gray-400'}`} />
                    <span className="font-medium text-sm">Dark Mode</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h3 className="text-lg font-semibold mb-4">LeetCode Sync</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                  Connect your LeetCode account to automatically sync your solved problems to your DSA tracker.
                </p>
                <div className="max-w-md space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    LeetCode Username
                  </label>
                  <input
                    type="text"
                    value={lcUsername}
                    onChange={(e) => setLcUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full px-4 py-2 bg-transparent border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none"
                  />
                  <div className="flex items-center gap-3 pt-2">
                    <button 
                      onClick={handleSaveLC}
                      className="btn-primary px-6"
                    >
                      Save Integration
                    </button>
                    {savedMessage && (
                      <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4" /> {savedMessage}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
