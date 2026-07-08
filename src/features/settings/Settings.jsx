import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useProfile, useUpdateProfile } from '../../hooks/useProfile';
import { Palette, Link as LinkIcon, LogOut, Sun, Moon, CheckCircle2, Shield, KeyRound, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  
  const [activeTab, setActiveTab] = useState('workspace');
  const [lcUsername, setLcUsername] = useState(() => localStorage.getItem('leetcode_username') || '');
  const [savedMessage, setSavedMessage] = useState('');
  
  const [defaultTab, setDefaultTab] = useState('Dashboard');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setDefaultTab(profile.default_tab || 'Dashboard');
    }
  }, [profile]);

  const handleSaveLC = () => {
    localStorage.setItem('leetcode_username', lcUsername);
    showSaved('LeetCode integration updated!');
  };

  const handleSaveWorkspace = (newTab, newTheme) => {
    setDefaultTab(newTab);
    updateProfile.mutate({
      default_tab: newTab,
      theme: newTheme
    });
  };

  const showSaved = (msg) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setSavedMessage('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    
    try {
      // Supabase requires the current password for verification in some setups, but 
      // the standard update User method just uses the active session token.
      // We will attempt to update the password directly using the session.
      // If we wanted strict current password check, we'd attempt a re-auth first:
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // If re-auth succeeds, update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;
      
      showSaved('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendRecovery = async () => {
    setRecoveryMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: window.location.origin + '/settings',
    });
    
    if (error) {
      setRecoveryMessage('Error: ' + error.message);
    } else {
      setRecoveryMessage('Recovery email sent successfully!');
    }
  };

  const tabs = [
    { id: 'workspace', label: 'Workspace', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: LinkIcon }
  ];

  if (isLoading) return <div className="p-8 animate-pulse text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Manage your workspace configuration and security</p>
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

        <div className="flex-1 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm p-6 min-h-[500px]">
          {activeTab === 'workspace' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Palette className="w-5 h-5 text-purple-500" /> General Workspace Customization</h3>
                
                <div className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Workspace Tab</label>
                    <select
                      value={defaultTab}
                      onChange={(e) => handleSaveWorkspace(e.target.value, theme)}
                      className="w-full px-4 py-2 bg-transparent border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none"
                    >
                      <option value="Dashboard">Dashboard</option>
                      <option value="Applications Tracker">Applications Tracker</option>
                      <option value="DSA Hub">DSA Hub</option>
                      <option value="System Design Tree">System Design Tree</option>
                      <option value="Goals & Analytics">Goals & Analytics</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Choose which tab loads automatically on startup.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interface Preferences</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          toggleTheme();
                          if (theme !== 'light') handleSaveWorkspace(defaultTab, 'light');
                        }}
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
                        onClick={() => {
                          toggleTheme();
                          if (theme !== 'dark') handleSaveWorkspace(defaultTab, 'dark');
                        }}
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
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><KeyRound className="w-5 h-5 text-amber-500" /> Account Security & Credentials</h3>
                
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2 bg-transparent border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-2 bg-transparent border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-2 bg-transparent border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none"
                    />
                  </div>
                  
                  {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                  
                  <div className="flex items-center gap-3 pt-2">
                    <button type="submit" disabled={passwordLoading} className="btn-primary px-6">
                      {passwordLoading ? 'Updating...' : 'Change Password'}
                    </button>
                    {savedMessage && activeTab === 'security' && (
                      <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4" /> {savedMessage}
                      </span>
                    )}
                  </div>
                </form>
              </div>

              <div className="pt-6 border-t border-[var(--border)]">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Mail className="w-5 h-5 text-blue-500" /> Forgot Password Recovery</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                  Trigger an automatic password reset token generator sent to <strong>{user?.email}</strong>.
                </p>
                <div className="flex items-center gap-3">
                  <button onClick={handleSendRecovery} className="btn-secondary px-6">
                    Send Recovery Email
                  </button>
                  {recoveryMessage && (
                    <span className={`text-sm ${recoveryMessage.startsWith('Error') ? 'text-red-500' : 'text-green-500'} animate-in fade-in`}>
                      {recoveryMessage}
                    </span>
                  )}
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
                    {savedMessage && activeTab === 'integrations' && (
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
