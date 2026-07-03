import { useState } from 'react';
import { Link2, ExternalLink, Plus, Search, Folder, Loader2, X, Trash2 } from 'lucide-react';
import { useLinks, useAddLink, useDeleteLink } from '../../hooks/useLinks';

export default function LinksHub() {
  const { data: links, isLoading, error } = useLinks();
  const addLink = useAddLink();
  const deleteLink = useDeleteLink();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: 'Resources'
  });

  const categories = links ? [...new Set(links.map(l => l.category))] : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    addLink.mutate(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ title: '', url: '', category: 'Resources' });
      }
    });
  };

  const handleDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Delete this link?')) {
      deleteLink.mutate(id);
    }
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>;
  if (error) return <div className="flex h-full items-center justify-center text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Important Links</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Save and organize your career-related URLs</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-4 h-4" />
            Add Link
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {categories.map(category => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-4 border-b border-[var(--border)] pb-2">
              <Folder className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">{category}</h2>
              <span className="text-xs bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full ml-2">
                {links.filter(l => l.category === category).length}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {links.filter(l => l.category === category).map(link => (
                <a 
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm hover:shadow-md transition-all group flex items-start justify-between"
                >
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 text-[var(--primary)] mt-0.5">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">{link.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400 truncate mt-0.5">{link.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button 
                      onClick={(e) => handleDelete(e, link.id)} 
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-1" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
        {(!categories || categories.length === 0) && (
          <div className="text-center py-12 border-2 border-dashed border-[var(--border)] rounded-xl text-gray-500">
            No links saved yet.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)] shadow-xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-[var(--primary)]">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Add Link</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="e.g. My Portfolio" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <input type="url" required value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="e.g. Profiles, Resources, Companies..." />
              </div>
              <button type="submit" disabled={addLink.isPending} className="w-full btn-primary mt-2">
                {addLink.isPending ? 'Saving...' : 'Save Link'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
