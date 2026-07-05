import { useEffect, useState } from 'react';
import { Loader2, Plus, X, Calendar, Trash2, Edit2, ExternalLink, FileText, AlignLeft } from 'lucide-react';
import { useJobs, useUpdateJob, useAddJob, useDeleteJob } from '../../hooks/useJobs';
import { useResumes } from '../../hooks/useResumes';
import CompanyLogo from '../../components/CompanyLogo';

const tabs = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

const getCountdownText = (dateString) => {
  if (!dateString || dateString === 'TBD') return null;
  const targetDate = new Date(dateString);
  if (isNaN(targetDate)) return null;
  
  const diffTime = targetDate - new Date();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { text: 'Overdue', status: 'danger' };
  if (diffDays === 0) return { text: 'Today', status: 'danger' };
  if (diffDays <= 3) return { text: `${diffDays} days left`, status: 'danger' };
  if (diffDays <= 7) return { text: `${diffDays} days left`, status: 'warning' };
  return { text: `${diffDays} days left`, status: 'safe' };
};

export default function JobTracker() {
  const { data: jobs, isLoading, error } = useJobs();
  const updateJob = useUpdateJob();
  const addJob = useAddJob();
  const deleteJob = useDeleteJob();
  
  const [activeTab, setActiveTab] = useState('Wishlist');
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  
  const { data: resumes } = useResumes();

  const [formData, setFormData] = useState({
    company: '',
    url: '',
    role: '',
    type: 'Job',
    column_id: 'Wishlist', // Status
    date: '',
    resume: '',
    notes: '',
    priority: 'Medium'
  });

  const handleOpenAdd = () => {
    setEditingJob(null);
    setFormData({
      company: '', url: '', role: '', type: 'Job', column_id: activeTab, date: '', resume: '', notes: '', priority: 'Medium'
    });
    setIsSlideOverOpen(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setFormData({
      company: job.company || '',
      url: job.url || '',
      role: job.role || '',
      type: job.type || 'Job',
      column_id: job.column_id || 'Wishlist',
      date: job.date !== 'TBD' ? job.date : '',
      resume: job.resume || '',
      notes: job.notes || '',
      priority: job.priority || 'Medium'
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.company || !formData.role) return;

    const payload = {
      ...formData,
      date: formData.date || 'TBD'
    };

    if (editingJob) {
      updateJob.mutate({ id: editingJob.id, ...payload }, {
        onSuccess: () => setIsEditModalOpen(false)
      });
    } else {
      addJob.mutate(payload, {
        onSuccess: () => setIsSlideOverOpen(false)
      });
    }
  };

  const handleDeleteJob = (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      deleteJob.mutate(id);
    }
  };

  if (isLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>;
  if (error) return <div className="h-full flex items-center justify-center text-red-500">Error loading jobs: {error.message}</div>;

  const filteredJobs = (jobs || []).filter(j => j.column_id === activeTab);

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Tracker</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Manage your applications and interviews</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Job
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-[var(--border)] mb-6 hide-scrollbar">
        {tabs.map(tab => {
          const count = (jobs || []).filter(j => j.column_id === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-[var(--primary)] text-[var(--primary)]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab 
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)]' 
                  : 'bg-gray-100 dark:bg-black/20 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredJobs.map(job => {
            const countdown = getCountdownText(job.date);
            return (
              <div key={job.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-sm card-hover relative group flex flex-col h-full">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button onClick={() => handleOpenEdit(job)} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteJob(job.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-start gap-4 mb-4 pr-16">
                  <CompanyLogo company={job.company} url={job.url} className="w-12 h-12 flex-shrink-0 text-lg" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={job.company}>{job.company}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 truncate" title={job.role}>{job.role}</p>
                    {job.url && (
                      <a href={job.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                        <ExternalLink className="w-3 h-3" /> Link
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    job.type === 'Job' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' : 
                    job.type === 'Internship' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
                    'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                  }`}>
                    {job.type}
                  </span>
                  <select 
                    value={job.column_id}
                    onChange={(e) => updateJob.mutate({ id: job.id, column_id: e.target.value })}
                    className="text-[10px] px-2 py-0.5 rounded font-medium bg-white text-gray-900 dark:bg-slate-800 dark:text-white border border-[var(--border)] outline-none cursor-pointer focus:ring-1 focus:ring-[var(--primary)] appearance-none pr-6 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%2210%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M2%203L5%206l3-3%22%20stroke%3D%22%23999%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_4px_center] bg-no-repeat shadow-sm"
                  >
                    {tabs.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {job.resume && (
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 flex items-center gap-1 truncate max-w-[120px]">
                      <FileText className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{job.resume}</span>
                    </span>
                  )}
                </div>

                {job.notes && (
                  <div className="text-xs text-gray-500 dark:text-slate-400 mb-4 line-clamp-2 bg-gray-50 dark:bg-black/10 p-2 rounded-lg flex gap-2">
                    <AlignLeft className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span className="italic">{job.notes}</span>
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 min-w-0">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{job.date !== 'TBD' ? job.date : 'No deadline'}</span>
                  </div>
                  {countdown && (
                    <div className={`px-2 py-1 rounded-md whitespace-nowrap ${
                      countdown.status === 'danger' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse' :
                      countdown.status === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {countdown.text}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {filteredJobs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[var(--border)] rounded-xl text-gray-500">
            <p>No jobs in {activeTab}.</p>
          </div>
        )}
      </div>

      {/* Slide-over Modal */}
      {isSlideOverOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-md bg-[var(--card)] h-full shadow-2xl flex flex-col animate-slide-in">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <h2 className="text-xl font-bold">{editingJob ? 'Edit Job' : 'Add New Job'}</h2>
              <button onClick={() => setIsSlideOverOpen(false)} className="p-2 text-gray-400 hover:text-[var(--primary)] rounded-full hover:bg-gray-100 dark:hover:bg-black/20 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form id="jobForm" onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {(addJob.error || updateJob.error) && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm border border-red-200 dark:border-red-800">
                    {addJob.error?.message || updateJob.error?.message}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Company Name *</label>
                  <input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="e.g. Google" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Company URL</label>
                  <input type="url" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="https://careers.google.com/..." />
                  <p className="text-[10px] text-gray-500 mt-1">Used to automatically fetch the company logo.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Profile / Target Role *</label>
                  <input required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="e.g. Frontend Engineer" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Type</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[var(--primary)] outline-none">
                      <option>Job</option>
                      <option>Internship</option>
                      <option>Hackathon</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Status</label>
                    <select value={formData.column_id} onChange={e => setFormData({...formData, column_id: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[var(--primary)] outline-none">
                      {tabs.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Due Date / Deadline</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[var(--primary)] outline-none" style={{ colorScheme: 'light dark' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Resume Version</label>
                  <select value={formData.resume} onChange={e => setFormData({...formData, resume: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[var(--primary)] outline-none">
                    <option value="">None selected</option>
                    {resumes?.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Notes</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none resize-none h-24" placeholder="Important details, interviewer names, etc..."></textarea>
                </div>
              </div>
              
              <div className="p-6 border-t border-[var(--border)]">
                <button type="submit" disabled={addJob.isPending || updateJob.isPending} className="w-full btn-primary py-3">
                  {addJob.isPending || updateJob.isPending ? 'Saving...' : 'Save Job Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal (Centered) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[var(--card)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[var(--primary)]" />
                Edit Job Details
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-gray-400 hover:text-[var(--primary)] rounded-full hover:bg-gray-100 dark:hover:bg-black/20 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form id="editJobForm" onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {(updateJob.error) && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm border border-red-200 dark:border-red-800">
                    {updateJob.error?.message}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Company Name *</label>
                      <input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Profile / Target Role *</label>
                      <input required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Company URL</label>
                      <input type="url" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Type</label>
                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[var(--primary)] outline-none">
                          <option>Job</option>
                          <option>Internship</option>
                          <option>Hackathon</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Status</label>
                        <select value={formData.column_id} onChange={e => setFormData({...formData, column_id: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[var(--primary)] outline-none">
                          {tabs.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Due Date / Deadline</label>
                      <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[var(--primary)] outline-none" style={{ colorScheme: 'light dark' }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Attached Resume</label>
                      <select value={formData.resume} onChange={e => setFormData({...formData, resume: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[var(--primary)] outline-none">
                        <option value="">None selected</option>
                        {resumes?.map(r => (
                          <option key={r.id} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Notes & Interview Details</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none resize-none h-32" placeholder="Feedback, interviewer names, follow-up actions..."></textarea>
                </div>
              </div>
              
              <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3 bg-gray-50/50 dark:bg-black/10 rounded-b-2xl">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-[var(--border)] hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={updateJob.isPending} className="px-6 py-2.5 btn-primary">
                  {updateJob.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
