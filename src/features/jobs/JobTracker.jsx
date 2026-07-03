import { useEffect, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FileText, Loader2, Plus, X, Calendar, Trash2 } from 'lucide-react';
import { useJobs, useUpdateJob, useAddJob, useDeleteJob } from '../../hooks/useJobs';

const initialColumns = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Closed'];

function SortableItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: props.id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-sm mb-3 cursor-grab active:cursor-grabbing card-hover relative group overflow-hidden break-words">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onPointerDown={(e) => e.stopPropagation()} 
          onClick={(e) => {
            e.stopPropagation();
            props.onDelete(props.job.id);
          }}
          className="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="flex justify-between items-start mb-2 pr-4">
        <div className="min-w-0">
          <h4 className="font-semibold text-sm truncate">{props.job.company}</h4>
          <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{props.job.role}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
          props.job.type === 'Job' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' : 
          props.job.type === 'Internship' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
          'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
        }`}>
          {props.job.type}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
          props.job.priority === 'High' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 
          props.job.priority === 'Low' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
          'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
        }`}>
          {props.job.priority}
        </span>
        {props.job.resume && (
          <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 flex items-center gap-1 truncate max-w-[120px]">
            <FileText className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{props.job.resume}</span>
          </span>
        )}
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
        <div className="flex items-center gap-1 min-w-0">
          <Calendar className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{props.job.date || 'No deadline'}</span>
        </div>
        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-black/40 flex items-center justify-center font-bold text-[10px] text-gray-700 dark:text-gray-300 flex-shrink-0">
          {props.job.company?.[0] || '?'}
        </div>
      </div>
    </div>
  );
}

function Column({ col, colJobs, onDelete }) {
  const { setNodeRef } = useDroppable({ id: col });
  
  return (
    <div ref={setNodeRef} className="w-80 flex flex-col bg-gray-50/50 dark:bg-black/10 rounded-2xl p-4 border border-[var(--border)] h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-1 flex-shrink-0">
        <h3 className="font-semibold text-sm text-gray-700 dark:text-slate-300">{col}</h3>
        <span className="text-xs font-medium bg-gray-200 dark:bg-black/40 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
          {colJobs.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1">
        <SortableContext 
          id={col}
          items={colJobs.map(j => j.id)}
          strategy={verticalListSortingStrategy}
        >
          {colJobs.map(job => (
            <SortableItem key={job.id} id={job.id} job={job} onDelete={onDelete} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function JobTracker() {
  const { data: dbJobs, isLoading, error } = useJobs();
  const updateJob = useUpdateJob();
  const addJob = useAddJob();
  const deleteJob = useDeleteJob();
  
  const [localJobs, setLocalJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newType, setNewType] = useState('Job');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDate, setNewDate] = useState('');
  const [newResume, setNewResume] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (dbJobs) {
      setLocalJobs(dbJobs);
    }
  }, [dbJobs]);

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = localJobs.find((j) => j.id === activeId);
    const isOverTask = localJobs.find((j) => j.id === overId);
    const isOverColumn = initialColumns.includes(overId);

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask && isActiveTask.column_id !== isOverTask.column_id) {
      setLocalJobs((jobs) => {
        const activeIndex = jobs.findIndex((j) => j.id === activeId);
        const overIndex = jobs.findIndex((j) => j.id === overId);
        
        const newJobs = [...jobs];
        newJobs[activeIndex] = { ...newJobs[activeIndex], column_id: newJobs[overIndex].column_id };
        return arrayMove(newJobs, activeIndex, overIndex);
      });
    }

    if (isActiveTask && isOverColumn) {
      setLocalJobs((jobs) => {
        const activeIndex = jobs.findIndex((j) => j.id === activeId);
        const newJobs = [...jobs];
        newJobs[activeIndex] = { ...newJobs[activeIndex], column_id: overId };
        return arrayMove(newJobs, activeIndex, activeIndex);
      });
    }
  }

  function handleDragEnd(event) {
    const {active, over} = event;
    if (!over) return;
    
    const activeTask = localJobs.find((j) => j.id === active.id);
    if (activeTask) {
      updateJob.mutate({ id: active.id, column_id: activeTask.column_id });
    }

    if (active.id !== over.id) {
      setLocalJobs((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handleAddJob = (e) => {
    e.preventDefault();
    if (!newCompany || !newRole) return;
    addJob.mutate({
      company: newCompany,
      role: newRole,
      type: newType,
      column_id: 'Wishlist',
      date: newDate || 'TBD',
      priority: newPriority,
      resume: newResume
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setNewCompany('');
        setNewRole('');
        setNewType('Job');
        setNewPriority('Medium');
        setNewDate('');
        setNewResume('');
      }
    });
  };

  const handleDeleteJob = (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      deleteJob.mutate(id);
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
        Error loading jobs: {error.message}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Tracker</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Manage your applications and interviews</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Job
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {initialColumns.map(col => {
              const colJobs = localJobs.filter(j => j.column_id === col);
              return <Column key={col} col={col} colJobs={colJobs} onDelete={handleDeleteJob} />;
            })}
          </DndContext>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)] shadow-xl relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-[var(--primary)]">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Add New Job</h2>
            <form onSubmit={handleAddJob} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input 
                    required
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" 
                    placeholder="e.g. Google"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <input 
                    required
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" 
                    placeholder="e.g. Frontend Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select 
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option>Job</option>
                    <option>Internship</option>
                    <option>Hackathon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select 
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Deadline / Date</label>
                  <input 
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Resume Version</label>
                  <input 
                    value={newResume}
                    onChange={e => setNewResume(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" 
                    placeholder="e.g. Frontend_v2.pdf"
                  />
                </div>
              </div>
              <button type="submit" disabled={addJob.isPending} className="w-full btn-primary mt-4">
                {addJob.isPending ? 'Saving...' : 'Save Job'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
