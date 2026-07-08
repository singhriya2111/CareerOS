import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProfile, useUpdateProfile } from '../../hooks/useProfile';
import { User, Target, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  
  const [savedMessage, setSavedMessage] = useState('');
  
  // Profile form state
  const [displayName, setDisplayName] = useState('');
  const [dsaTarget, setDsaTarget] = useState(0);
  const [jobTarget, setJobTarget] = useState(0);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setDsaTarget(profile.dsa_target || 0);
      setJobTarget(profile.job_target || 0);
    }
  }, [profile]);

  const handleSaveProfile = () => {
    updateProfile.mutate({
      display_name: displayName,
      dsa_target: Number(dsaTarget),
      job_target: Number(jobTarget)
    }, {
      onSuccess: () => {
        setSavedMessage('Profile updated successfully!');
        setTimeout(() => setSavedMessage(''), 3000);
      }
    });
  };

  if (isLoading) return <div className="p-8 animate-pulse text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Profile</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Manage your personalization and daily targets</p>
      </div>

      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm p-6">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><User className="w-5 h-5 text-blue-500" /> Section A: Personalization</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. CodeNinja2026"
                  className="w-full px-4 py-2 bg-transparent border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">This will be used for your avatar and greetings.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input type="text" value={user?.email} disabled className="w-full px-4 py-2 bg-gray-50 dark:bg-black/20 border border-[var(--border)] rounded-lg text-gray-500 cursor-not-allowed" />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--border)]">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-green-500" /> Section B: Daily Tracking Commitments</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Set these to configure the dashboard Motivation Engine. Leave as 0 for a low-pressure workspace.</p>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily DSA Solve Commitment</label>
                <input
                  type="number"
                  min="0"
                  value={dsaTarget}
                  onChange={(e) => setDsaTarget(e.target.value)}
                  className="w-full px-4 py-2 bg-transparent border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Application Target</label>
                <input
                  type="number"
                  min="0"
                  value={jobTarget}
                  onChange={(e) => setJobTarget(e.target.value)}
                  className="w-full px-4 py-2 bg-transparent border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--border)] flex items-center gap-3">
            <button 
              onClick={handleSaveProfile}
              disabled={updateProfile.isPending}
              className="btn-primary px-6"
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
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
  );
}
