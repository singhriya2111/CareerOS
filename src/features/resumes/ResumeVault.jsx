import { useState, useRef } from 'react';
import { UploadCloud, FileText, Download, Trash2, Edit3, Loader2, X } from 'lucide-react';
import { useResumes, useAddResume, useDeleteResume } from '../../hooks/useResumes';

export default function ResumeVault() {
  const { data: resumes, isLoading, error } = useResumes();
  const addResume = useAddResume();
  const deleteResume = useDeleteResume();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeType, setResumeType] = useState('Frontend');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    addResume.mutate({
      file: selectedFile,
      name: selectedFile.name,
      type: resumeType
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedFile(null);
        setResumeType('Frontend');
      }
    });
  };

  const handleDelete = (resume) => {
    if (window.confirm(`Are you sure you want to delete ${resume.name}?`)) {
      deleteResume.mutate(resume);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        Error loading resumes: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resume Vault</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Manage and organize your tailored resumes</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <UploadCloud className="w-4 h-4" />
          Upload Resume
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-[var(--border)] rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-black/10 hover:bg-gray-100 dark:hover:bg-black/20 transition-colors cursor-pointer min-h-[200px]"
        >
          <div className="w-12 h-12 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mb-4">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="font-semibold mb-1">Upload New Resume</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">PDF up to 5MB</p>
        </div>

        {resumes && resumes.map(resume => (
          <div key={resume.id} className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] shadow-sm card-hover flex flex-col min-h-[200px]">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1">
                <a 
                  href={resume.file_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button 
                  onClick={() => handleDelete(resume)}
                  disabled={deleteResume.isPending}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate" title={resume.name}>
                {resume.name}
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {resume.type}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-slate-400 border-t border-[var(--border)] pt-4 mt-2">
              <span>{resume.last_updated}</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)] shadow-xl relative">
            <button onClick={() => { setIsModalOpen(false); setSelectedFile(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-[var(--primary)]">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Upload Resume</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select PDF File</label>
                <input 
                  type="file"
                  accept=".pdf"
                  required
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary)]/10 file:text-[var(--primary)] hover:file:bg-[var(--primary)]/20" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tag / Role Target</label>
                <input 
                  required
                  value={resumeType}
                  onChange={e => setResumeType(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" 
                  placeholder="e.g. Frontend, Fullstack, specific company..."
                />
              </div>
              <button type="submit" disabled={addResume.isPending || !selectedFile} className="w-full btn-primary mt-2">
                {addResume.isPending ? 'Uploading...' : 'Upload Resume'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
