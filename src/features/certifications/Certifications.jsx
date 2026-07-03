import { useState } from 'react';
import { Award, FileText, ExternalLink, Plus, Trash2, Loader2, X } from 'lucide-react';
import { useCertifications, useAddCertification, useDeleteCertification } from '../../hooks/useCertifications';

export default function Certifications() {
  const { data: certs, isLoading, error } = useCertifications();
  const addCert = useAddCertification();
  const deleteCert = useDeleteCertification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    date: '',
    expires: 'Never',
    type: 'Course',
    link: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addCert.mutate(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ title: '', issuer: '', date: '', expires: 'Never', type: 'Course', link: '' });
      }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this certification?')) {
      deleteCert.mutate(id);
    }
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>;
  if (error) return <div className="flex h-full items-center justify-center text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certifications</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Manage your credentials, courses, and achievements</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Certification
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certs && certs.map(cert => (
          <div key={cert.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-sm card-hover relative group flex flex-col h-full">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleDelete(cert.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 text-[var(--primary)]">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white leading-tight mb-1 pr-6">{cert.title}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{cert.issuer}</p>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Issued</p>
                <p className="text-sm font-medium">{cert.date}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Expires</p>
                <p className="text-sm font-medium">{cert.expires}</p>
              </div>
            </div>
            
            {cert.link && (
              <div className="mt-4 flex gap-2">
                <a href={cert.link} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-gray-50 dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium transition-colors border border-[var(--border)]">
                  <ExternalLink className="w-4 h-4" />
                  View Credential
                </a>
              </div>
            )}
          </div>
        ))}

        <div onClick={() => setIsModalOpen(true)} className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50/50 dark:hover:bg-black/20 transition-colors cursor-pointer min-h-[220px]">
          <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Add New Credential</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 max-w-[200px]">Link to your digital badge or course</p>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)] shadow-xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-[var(--primary)]">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Add Certification</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="e.g. AWS Solutions Architect" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Issuer</label>
                <input required value={formData.issuer} onChange={e => setFormData({...formData, issuer: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="e.g. Amazon Web Services" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date Issued</label>
                  <input required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="e.g. Aug 2026" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expires</label>
                  <input value={formData.expires} onChange={e => setFormData({...formData, expires: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="e.g. Aug 2029 or Never" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none">
                    <option value="Credential">Credential</option>
                    <option value="Course">Course</option>
                    <option value="Degree">Degree</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Credential URL</label>
                  <input value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="https://..." />
                </div>
              </div>
              <button type="submit" disabled={addCert.isPending} className="w-full btn-primary mt-2">
                {addCert.isPending ? 'Saving...' : 'Save Certification'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
