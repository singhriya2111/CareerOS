import { useState } from 'react';
import { Plus, Loader2, X, Trash2, Star } from 'lucide-react';
import { useSystemDesign, useAddSystemDesign, useUpdateSystemDesign, useDeleteSystemDesign } from '../../hooks/useSystemDesign';

export default function SystemDesignHub() {
  const { data: topics, isLoading, error } = useSystemDesign();
  const addTopic = useAddSystemDesign();
  const updateTopic = useUpdateSystemDesign();
  const deleteTopic = useDeleteSystemDesign();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addTopic.mutate(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ title: '', difficulty: 'Medium' });
      }
    });
  };

  const handleStarToggle = (topic) => {
    updateTopic.mutate({ id: topic.id, starred: !topic.starred });
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>;
  if (error) return <div className="flex h-full items-center justify-center text-red-500">Error: {error.message}</div>;

  const filteredTopics = topics ? topics.filter(t => showStarredOnly ? t.starred : true) : [];

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Design Hub</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Master architecture patterns and principles</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsModalOpen(true)} className="btn-primary whitespace-nowrap flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Topic
          </button>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-gray-50/50 dark:bg-black/10">
          <h3 className="font-semibold">System Design Topics</h3>
          <button 
            onClick={() => setShowStarredOnly(!showStarredOnly)}
            className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${showStarredOnly ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'}`}
          >
            {showStarredOnly ? '★ Showing Starred for Revision Only' : 'Show Starred for Revision Only'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-slate-400 font-medium border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-4 w-12"></th>
                <th className="px-6 py-4">Topic</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredTopics.map(topic => (
                <tr key={topic.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <button onClick={() => handleStarToggle(topic)} className="focus:outline-none transition-transform hover:scale-110">
                      <Star className={`w-5 h-5 ${topic.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-slate-600 hover:text-yellow-400'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {topic.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      topic.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      topic.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {topic.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        if(window.confirm('Delete topic?')) deleteTopic.mutate(topic.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTopics.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No topics match your criteria.</td>
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
            <h2 className="text-xl font-bold mb-4">Add System Design Topic</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Topic Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="e.g. Consistent Hashing" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[var(--primary)] outline-none">
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <button type="submit" disabled={addTopic.isPending} className="w-full btn-primary mt-2">
                {addTopic.isPending ? 'Saving...' : 'Save Topic'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
