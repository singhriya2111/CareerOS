import { useState } from 'react';
import { BookOpen, Star, Code, Hash, ChevronRight, Plus, Loader2, X, Trash2, ExternalLink, Code2 } from 'lucide-react';
import { useProjects, useAddProject, useDeleteProject, useSkills, useAddSkill, useDeleteSkill } from '../../hooks/useVault';

export default function CareerVault() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: skills, isLoading: skillsLoading } = useSkills();
  const addProject = useAddProject();
  const deleteProject = useDeleteProject();
  const addSkill = useAddSkill();
  const deleteSkill = useDeleteSkill();

  const [activeModal, setActiveModal] = useState(null); // 'project' or 'skill'
  const [projectData, setProjectData] = useState({ title: '', description: '', tech_stack: '', github_link: '', live_link: '' });
  const [skillData, setSkillData] = useState({ name: '', category: 'Frontend', proficiency: 3 });

  const handleProjectSubmit = (e) => {
    e.preventDefault();
    const techArray = projectData.tech_stack.split(',').map(t => t.trim()).filter(t => t);
    addProject.mutate({
      ...projectData,
      tech_stack: techArray
    }, {
      onSuccess: () => {
        setActiveModal(null);
        setProjectData({ title: '', description: '', tech_stack: '', github_link: '', live_link: '' });
      }
    });
  };

  const handleSkillSubmit = (e) => {
    e.preventDefault();
    addSkill.mutate(skillData, {
      onSuccess: () => {
        setActiveModal(null);
        setSkillData({ name: '', category: 'Frontend', proficiency: 3 });
      }
    });
  };

  const handleDeleteProject = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this project snippet?')) deleteProject.mutate(id);
  };

  const handleDeleteSkill = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this skill?')) deleteSkill.mutate(id);
  };

  if (projectsLoading || skillsLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>;
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Career Vault</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Knowledge repository and project snippets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Project Snippets
            </h3>
            <button onClick={() => setActiveModal('project')} className="btn-primary flex items-center gap-1 py-1.5 px-3 text-sm">
              <Plus className="w-4 h-4" /> Add Project
            </button>
          </div>
          
          {projects && projects.map((project) => (
            <div key={project.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-sm card-hover group relative">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={(e) => handleDeleteProject(e, project.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex justify-between items-start mb-2 pr-12">
                <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h4>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{project.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech_stack && project.tech_stack.map(t => (
                  <span key={t} className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-slate-300 rounded">
                    <Hash className="w-3 h-3" />
                    {t}
                  </span>
                ))}
              </div>
              
              <div className="flex gap-3 text-sm">
                {project.github_link && (
                  <a href={project.github_link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <Code2 className="w-4 h-4" /> Code
                  </a>
                )}
                {project.live_link && (
                  <a href={project.live_link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-gray-500 hover:text-[var(--primary)] transition-colors">
                    <ExternalLink className="w-4 h-4" /> Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
          {(!projects || projects.length === 0) && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-[var(--border)] rounded-xl">No projects added yet.</div>
          )}
        </div>

        {/* Skills Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Skills Stack
            </h3>
            <button onClick={() => setActiveModal('skill')} className="p-1.5 text-gray-400 hover:text-[var(--primary)] hover:bg-gray-100 dark:hover:bg-black/20 rounded-md transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
            {skills && skills.map((skill) => (
              <div key={skill.id} className="p-4 border-b border-[var(--border)] last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group relative">
                <button onClick={(e) => handleDeleteSkill(e, skill.id)} className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm text-gray-900 dark:text-white">{skill.name}</span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">{skill.category}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-black/40 rounded-full h-1.5 mb-1">
                  <div className="bg-[var(--primary)] h-1.5 rounded-full" style={{ width: `${(skill.proficiency / 5) * 100}%` }}></div>
                </div>
                <div className="text-[10px] text-right text-gray-500 dark:text-slate-400 font-medium">
                  Level {skill.proficiency}/5
                </div>
              </div>
            ))}
            {(!skills || skills.length === 0) && (
              <div className="text-center py-6 text-gray-500 text-sm">No skills added yet.</div>
            )}
          </div>
        </div>
      </div>

      {activeModal === 'project' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)] shadow-xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-[var(--primary)]">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Add Project Snippet</h2>
            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required value={projectData.title} onChange={e => setProjectData({...projectData, title: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="e.g. JWT Auth Flow" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea required value={projectData.description} onChange={e => setProjectData({...projectData, description: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none resize-none h-24" placeholder="Brief summary of the project or snippet..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tech Stack (comma separated)</label>
                <input required value={projectData.tech_stack} onChange={e => setProjectData({...projectData, tech_stack: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="e.g. React, Node.js, Tailwind" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">GitHub URL</label>
                  <input type="url" value={projectData.github_link} onChange={e => setProjectData({...projectData, github_link: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="https://github.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Live URL</label>
                  <input type="url" value={projectData.live_link} onChange={e => setProjectData({...projectData, live_link: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="https://..." />
                </div>
              </div>
              <button type="submit" disabled={addProject.isPending} className="w-full btn-primary mt-2">
                {addProject.isPending ? 'Saving...' : 'Save Project'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'skill' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)] shadow-xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-[var(--primary)]">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Add Skill</h2>
            <form onSubmit={handleSkillSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Skill Name</label>
                <input required value={skillData.name} onChange={e => setSkillData({...skillData, name: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none" placeholder="e.g. GraphQL, System Design" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select value={skillData.category} onChange={e => setSkillData({...skillData, category: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[var(--primary)] outline-none">
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Soft Skills">Soft Skills</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Proficiency Level (1-5)</label>
                <input type="range" min="1" max="5" required value={skillData.proficiency} onChange={e => setSkillData({...skillData, proficiency: Number(e.target.value)})} className="w-full h-2 bg-gray-200 dark:bg-black/40 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]" />
                <div className="text-center mt-2 font-medium">Level: {skillData.proficiency}/5</div>
              </div>
              <button type="submit" disabled={addSkill.isPending} className="w-full btn-primary mt-2">
                {addSkill.isPending ? 'Saving...' : 'Save Skill'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
