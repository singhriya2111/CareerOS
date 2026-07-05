import { useState } from 'react';
import { Search, Filter, CheckCircle2, Circle, Clock, ExternalLink, Plus, Loader2, X, Trash2 } from 'lucide-react';
import { useDSA, useAddDSA, useUpdateDSA, useDeleteDSA } from '../../hooks/useDSA';

export default function DSAHub() {
  const { data: problems, isLoading, error } = useDSA();
  const addDSA = useAddDSA();
  const updateDSA = useUpdateDSA();
  const deleteDSA = useDeleteDSA();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Easy',
    pattern: '',
    status: 'Unsolved',
    next_review: '-'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addDSA.mutate(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ title: '', difficulty: 'Easy', pattern: '', status: 'Unsolved', next_review: '-' });
      }
    });
  };

  const handleStatusToggle = (problem) => {
    const nextStatus = problem.status === 'Unsolved' ? 'Review' : problem.status === 'Review' ? 'Solved' : 'Unsolved';
    updateDSA.mutate({ id: problem.id, status: nextStatus });
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>;
  if (error) return <div className="flex h-full items-center justify-center text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">DSA Hub</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Spaced repetition tracker for LeetCode</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsModalOpen(true)} className="btn-primary whitespace-nowrap flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Problem
          </button>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-slate-400 font-medium border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Problem</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Pattern / Topic</th>
                <th className="px-6 py-4">Next Review</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {problems && problems.map(problem => (
                <tr key={problem.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 cursor-pointer" onClick={() => handleStatusToggle(problem)}>
                    {problem.status === 'Solved' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {problem.status === 'Review' && <Clock className="w-5 h-5 text-yellow-500" />}
                    {problem.status === 'Unsolved' && <Circle className="w-5 h-5 text-gray-300 dark:text-slate-600" />}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {problem.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                    {problem.pattern}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-sm ${
                      problem.next_review === 'Today' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-slate-400'
                    }`}>
                      {problem.next_review !== '-' && <Clock className="w-3.5 h-3.5" />}
                      {problem.next_review}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        if(window.confirm('Delete problem?')) deleteDSA.mutate(problem.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {(!problems || problems.length === 0) && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No problems tracked yet.</td>
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
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="e.g. Two Sum" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[var(--primary)] outline-none">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[var(--primary)] outline-none">
                    <option value="Unsolved">Unsolved</option>
                    <option value="Review">Review</option>
                    <option value="Solved">Solved</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Pattern</label>
                  <input required value={formData.pattern} onChange={e => setFormData({...formData, pattern: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="e.g. Sliding Window" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Next Review</label>
                  <input value={formData.next_review} onChange={e => setFormData({...formData, next_review: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="e.g. Tomorrow or -" />
                </div>
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
