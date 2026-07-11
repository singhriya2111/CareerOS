import { useState } from 'react';
import { CheckCircle2, Circle, Clock, Plus, Loader2, X, Trash2, RefreshCw, Star, Info } from 'lucide-react';
import { useDSA, useAddDSA, useUpdateDSA, useDeleteDSA } from '../../hooks/useDSA';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useAnalytics, incrementAnalytics } from '../../hooks/useAnalytics';
// Chart components removed

export default function DSAHub() {
  const { data: problems, isLoading, error } = useDSA();
  const { data: analyticsLog } = useAnalytics();
  const addDSA = useAddDSA();
  const updateDSA = useUpdateDSA();
  const deleteDSA = useDeleteDSA();

  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [lcUsername, setLcUsername] = useState(() => localStorage.getItem('leetcode_username') || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Easy',
    pattern: '',
    status: 'Unsolved'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addDSA.mutate(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ title: '', difficulty: 'Easy', pattern: '', status: 'Unsolved' });
      }
    });
  };

  const handleStatusToggle = (problem) => {
    const nextStatus = problem.status === 'Unsolved' ? 'Review' : problem.status === 'Review' ? 'Solved' : 'Unsolved';
    updateDSA.mutate({ id: problem.id, status: nextStatus });
  };

  const handleStarToggle = (problem) => {
    updateDSA.mutate({ id: problem.id, starred: !problem.starred });
  };

  const handleSync = async () => {
    if (!lcUsername) return;
    setIsSyncing(true);
    setSyncMessage('');
    localStorage.setItem('leetcode_username', lcUsername);

    try {
      // Send the user's local date so the backend knows what "today" means
      const localDateStr = new Date().toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD
      const { data, error } = await supabase.functions.invoke('leetcode-sync', {
        body: { username: lcUsername, clientDate: localDateStr }
      });
      
      if (error) {
        let actualError = error.message;
        if (error.context) {
          try {
            const body = await error.context.json();
            if (body.error) actualError = body.error;
          } catch(e) {}
        }
        throw new Error(actualError);
      }
      
      if (data && data.error) {
        throw new Error(data.error);
      }

      setSyncMessage(`Successfully synced ${data.count} new solved problems to your roadmap!`);
      if (data.count > 0 && data.newSubmissions) {
        queryClient.invalidateQueries({ queryKey: ['dsa', user?.id] });
        // Accurately backfill analytics based on the exact LeetCode timestamp
        for (const sub of data.newSubmissions) {
          await incrementAnalytics(user.id, 'dsa', 1, sub.date);
        }
      }
      setTimeout(() => setSyncMessage(''), 5000);
    } catch (err) {
      setSyncMessage('Failed to sync: ' + err.message);
      setTimeout(() => setSyncMessage(''), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>;
  if (error) return <div className="flex h-full items-center justify-center text-red-500">Error: {error.message}</div>;

  const filteredProblems = problems ? problems.filter(p => showStarredOnly ? p.starred : true) : [];
  const solvedProblems = problems ? problems.filter(p => p.status === 'Solved') : [];
  
  // Chart logic removed

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">DSA Hub</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Spaced repetition tracker for LeetCode</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-black/20 p-1.5 rounded-lg border border-[var(--border)]">
            <input
              type="text"
              placeholder="LeetCode Username"
              value={lcUsername}
              onChange={e => setLcUsername(e.target.value)}
              className="px-2 py-1 bg-transparent outline-none text-sm w-36 sm:w-40"
            />
            <button
              onClick={handleSync}
              disabled={isSyncing || !lcUsername}
              className="bg-[var(--primary)] text-[var(--primary-foreground)] px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5"
            >
              {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {isSyncing ? 'Fetching...' : 'Sync'}
            </button>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary whitespace-nowrap flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Problem
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className={`p-4 rounded-xl text-sm font-medium border animate-in fade-in slide-in-from-top-4 ${syncMessage.includes('Failed')
            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400'
            : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400'
          }`}>
          {syncMessage}
        </div>
      )}

      {lcUsername && !syncMessage && (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Connected to LeetCode: {lcUsername}
        </div>
      )}

      {/* Charts have been removed from here */}

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-xl p-3 flex items-start gap-3 text-sm text-yellow-800 dark:text-yellow-500">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Unstarred items logged prior to today are cleared automatically at 5:00 AM. Star important problems to keep them in your backlog.</p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-gray-50/50 dark:bg-black/10">
          <h3 className="font-semibold">Problem Backlog</h3>
          <button 
            onClick={() => setShowStarredOnly(!showStarredOnly)}
            className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${showStarredOnly ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'}`}
          >
            {showStarredOnly ? '★ Showing Starred Only' : 'Show Starred Only'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-slate-400 font-medium border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-4 w-12"></th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Problem</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Pattern / Topic</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredProblems && filteredProblems.map(problem => (
                <tr key={problem.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <button onClick={() => handleStarToggle(problem)} className="focus:outline-none transition-transform hover:scale-110">
                      <Star className={`w-5 h-5 ${problem.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-slate-600 hover:text-yellow-400'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 cursor-pointer" onClick={() => handleStatusToggle(problem)}>
                    {problem.status === 'Solved' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {problem.status === 'Review' && <Clock className="w-5 h-5 text-yellow-500" />}
                    {problem.status === 'Unsolved' && <Circle className="w-5 h-5 text-gray-300 dark:text-slate-600" />}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {problem.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400 max-w-[150px] truncate" title={problem.pattern}>
                    {problem.pattern}
                  </td>
                  <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        if (window.confirm('Delete problem?')) deleteDSA.mutate(problem.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {(!filteredProblems || filteredProblems.length === 0) && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No problems match your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)] shadow-xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-[var(--primary)]">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Add DSA Problem</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Problem Title</label>
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="e.g. Two Sum" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[var(--primary)] outline-none">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[var(--primary)] outline-none">
                    <option value="Unsolved">Unsolved</option>
                    <option value="Review">Review</option>
                    <option value="Solved">Solved</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pattern</label>
                <input required value={formData.pattern} onChange={e => setFormData({ ...formData, pattern: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="e.g. Sliding Window" />
              </div>
              <button type="submit" disabled={addDSA.isPending} className="w-full btn-primary mt-2">
                {addDSA.isPending ? 'Saving...' : 'Save Problem'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
