import { useState, useMemo } from 'react';
import { Target, CheckCircle2, Circle, Plus, Loader2, X, Pencil, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useGoals, useAddGoal, useUpdateGoal, useDeleteGoal } from '../../hooks/useGoals';
import { useJobs } from '../../hooks/useJobs';
import { useAnalytics } from '../../hooks/useAnalytics';

const analyticsData = [
  { name: 'Week 1', completed: 15, missed: 3 },
  { name: 'Week 2', completed: 18, missed: 2 },
  { name: 'Week 3', completed: 14, missed: 5 },
  { name: 'Week 4', completed: 22, missed: 1 },
];

export default function Goals() {
  const { data: dbGoals, isLoading: goalsLoading, error: goalsError } = useGoals();
  const { data: dbJobs, isLoading: jobsLoading } = useJobs();
  const { data: analyticsLog } = useAnalytics();
  
  const updateGoal = useUpdateGoal();
  const addGoal = useAddGoal();
  const deleteGoal = useDeleteGoal();

  const [activeModalTimeframe, setActiveModalTimeframe] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoalText, setNewGoalText] = useState('');
  
  const [hoveredDay, setHoveredDay] = useState(null);

  const goals = useMemo(() => {
    if (!dbGoals) return { daily: [], weekly: [], monthly: [] };
    return {
      daily: dbGoals.filter(g => g.timeframe === 'daily'),
      weekly: dbGoals.filter(g => g.timeframe === 'weekly'),
      monthly: dbGoals.filter(g => g.timeframe === 'monthly'),
    };
  }, [dbGoals]);

  const jobStatusData = useMemo(() => {
    // If there are less than 5 jobs, show a mixed demo data combined with real data,
    // or just show demo data if they specifically want to check how it looks.
    // We will just show the true data, but if it's empty, show demo.
    if (!dbJobs || dbJobs.length === 0) return [
      { name: 'Wishlist (Demo)', value: 12, color: '#facc15' },
      { name: 'Applied (Demo)', value: 45, color: '#3b82f6' },
      { name: 'Interviewing (Demo)', value: 8, color: '#a855f7' },
      { name: 'Offer (Demo)', value: 2, color: '#22c55e' },
      { name: 'Rejected (Demo)', value: 18, color: '#ef4444' }
    ];
    
    const counts = {
      'Wishlist': 0,
      'Applied': 0,
      'Interviewing': 0,
      'Offer': 0,
      'Rejected': 0
    };
    dbJobs.forEach(job => {
      // FIX: jobs table uses column_id for status
      const status = job.column_id;
      if (counts[status] !== undefined) {
        counts[status]++;
      } else {
        counts[status] = 1;
      }
    });

    return [
      { name: 'Wishlist', value: counts['Wishlist'], color: '#facc15' },
      { name: 'Applied', value: counts['Applied'], color: '#3b82f6' },
      { name: 'Interviewing', value: counts['Interviewing'], color: '#a855f7' },
      { name: 'Offer', value: counts['Offer'], color: '#22c55e' },
      { name: 'Rejected', value: counts['Rejected'], color: '#ef4444' }
    ].filter(s => s.value > 0);
  }, [dbJobs]);

  // Heatmap generation for 2026
  // 2026 starts on Thursday, Jan 1
  const { heatmapGrid, monthsInfo } = useMemo(() => {
    const grid = [];
    const monthsInfo = [];
    
    const logMap = {};
    if (analyticsLog) {
      analyticsLog.forEach(log => {
        logMap[log.date] = log;
      });
    }

    const year = 2026;
    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(Date.UTC(year, month, 1, 12, 0, 0));
      let startOffset = firstDay.getUTCDay() - 1; // 0=Mon, 6=Sun
      if (startOffset === -1) startOffset = 6;

      for (let i = 0; i < startOffset; i++) {
        grid.push({ empty: true });
      }

      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(Date.UTC(year, month, day, 12, 0, 0));
        const dateStr = d.toISOString().split('T')[0];
        const data = logMap[dateStr] || { dsa_solves: 0, jobs_applied: 0, targets_completed: 0 };
        const total = data.dsa_solves + data.jobs_applied + data.targets_completed;
        grid.push({
          dateStr,
          total,
          ...data,
          formattedDate: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
        });
      }

      const totalCells = startOffset + daysInMonth;
      const remainder = totalCells % 7;
      if (remainder !== 0) {
        const endPadding = 7 - remainder;
        for (let i = 0; i < endPadding; i++) {
          grid.push({ empty: true });
        }
      }

      const cols = Math.ceil(totalCells / 7);
      const hasSpacer = month < 11;

      monthsInfo.push({
        label: firstDay.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
        width: (cols + (hasSpacer ? 1 : 0)) * 15
      });

      if (hasSpacer) {
        for (let i = 0; i < 7; i++) {
          grid.push({ empty: true, isSpacer: true });
        }
      }
    }
    return { heatmapGrid: grid, monthsInfo };
  }, [analyticsLog]);

  const toggleGoal = (id, currentState) => {
    updateGoal.mutate({ id, completed: !currentState });
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalText || !activeModalTimeframe) return;
    
    addGoal.mutate({
      text: newGoalText,
      timeframe: activeModalTimeframe,
      completed: false
    }, {
      onSuccess: () => {
        setNewGoalText('');
        setActiveModalTimeframe(null);
      }
    });
  };

  const handleEditGoal = (e) => {
    e.preventDefault();
    if (!newGoalText || !editingGoal) return;

    updateGoal.mutate({
      id: editingGoal.id,
      text: newGoalText
    }, {
      onSuccess: () => {
        setNewGoalText('');
        setEditingGoal(null);
      }
    });
  };

  const handleDeleteGoal = (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteGoal.mutate(id);
    }
  };

  const handleSimulateCleanup = () => {
    if (window.confirm('This will purge all checked (completed) goals while retaining unchecked ones. Continue?')) {
      const completedGoals = dbGoals.filter(g => g.completed);
      completedGoals.forEach(g => deleteGoal.mutate(g.id));
    }
  };

  const renderGoalSection = (title, timeframe, items) => (
    <div className="bg-[var(--card)] p-5 rounded-xl border border-[var(--border)] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          {title}
        </h3>
        <button onClick={() => setActiveModalTimeframe(timeframe)} className="p-1 text-gray-400 hover:text-[var(--primary)] transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-gray-500 italic text-center py-4">No goals yet. Add one!</p>
        )}
        {items.map(goal => (
          <div key={goal.id} className="flex items-start gap-3 group">
            <button 
              onClick={() => toggleGoal(goal.id, goal.completed)}
              className="mt-0.5 text-gray-400 hover:text-green-500 transition-colors flex-shrink-0"
              disabled={updateGoal.isPending}
            >
              {goal.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>
            <span className={`text-sm flex-1 pt-0.5 ${goal.completed ? 'text-gray-400 dark:text-slate-500 line-through' : 'text-gray-700 dark:text-slate-300'}`}>
              {goal.text}
            </span>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => {
                  setEditingGoal(goal);
                  setNewGoalText(goal.text);
                }}
                className="text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDeleteGoal(goal.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (goalsLoading || jobsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (goalsError) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        Error loading goals: {goalsError.message}
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goals & Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Track your daily, weekly, and monthly career objectives</p>
        </div>
        <button onClick={handleSimulateCleanup} className="btn-secondary text-sm">
          Simulate Period Cleanup
        </button>
      </div>

      {/* Heatmap Section */}
      <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-sm overflow-hidden relative">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-lg">Yearly Progress Activity (2026)</h3>
        </div>
        
        <div className="overflow-x-auto pb-4 pt-4 relative">
          <div className="flex text-xs text-gray-500 dark:text-slate-400 mb-2 min-w-max">
            {monthsInfo.map((m, i) => (
              <span key={i} style={{ width: m.width + 'px' }}>{m.label}</span>
            ))}
          </div>
          <div className="grid grid-rows-7 grid-flow-col gap-[3px] min-w-max">
            {heatmapGrid.map((day, i) => {
              if (day.empty) return <div key={i} className="w-[12px] h-[12px] rounded-sm bg-transparent" />;
              
              const intensity = day.total;
              let colorClass = 'bg-slate-200 dark:bg-slate-800';
              if (intensity === 1) colorClass = 'bg-emerald-200 dark:bg-emerald-900';
              else if (intensity === 2) colorClass = 'bg-emerald-300 dark:bg-emerald-800';
              else if (intensity >= 3 && intensity <= 4) colorClass = 'bg-emerald-500 dark:bg-emerald-700';
              else if (intensity >= 5) colorClass = 'bg-emerald-700 dark:bg-emerald-500';

              return (
                <div 
                  key={i} 
                  className={`w-[12px] h-[12px] rounded-sm flex-shrink-0 cursor-pointer ${colorClass}`}
                  onMouseEnter={(e) => {
                    const rect = e.target.getBoundingClientRect();
                    setHoveredDay({
                      ...day,
                      rect
                    });
                  }}
                  onMouseLeave={() => setHoveredDay(null)}
                />
              );
            })}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-end gap-2 text-xs text-gray-500 dark:text-slate-400">
          <span>Less</span>
          <div className="flex gap-[3px]">
            <div className="w-[12px] h-[12px] rounded-sm bg-slate-200 dark:bg-slate-800"></div>
            <div className="w-[12px] h-[12px] rounded-sm bg-emerald-200 dark:bg-emerald-900"></div>
            <div className="w-[12px] h-[12px] rounded-sm bg-emerald-300 dark:bg-emerald-800"></div>
            <div className="w-[12px] h-[12px] rounded-sm bg-emerald-500 dark:bg-emerald-700"></div>
            <div className="w-[12px] h-[12px] rounded-sm bg-emerald-700 dark:bg-emerald-500"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Tooltip Portal Rendering */}
      {hoveredDay && (
        <div 
          className="fixed z-[100] bg-gray-900 text-white text-xs rounded shadow-lg p-3 pointer-events-none w-64 transform -translate-y-full"
          style={{ 
            left: Math.min(Math.max(hoveredDay.rect.left + 6 - 128, 16), window.innerWidth - 272),
            top: hoveredDay.rect.top - 10 
          }}
        >
          <div className="font-semibold mb-1 text-gray-200">{hoveredDay.formattedDate}</div>
          <div className="text-gray-300">
            {hoveredDay.total} activity entries:<br/>
            • {hoveredDay.dsa_solves} DSA Solved<br/>
            • {hoveredDay.jobs_applied} Jobs Applied<br/>
            • {hoveredDay.targets_completed} Checklist Targets Met
          </div>
          {/* Tooltip pointer arrow - positioned relative to the target to stay aligned even when tooltip shifts */}
          <div 
            className="absolute bottom-[-4px] transform -translate-x-1/2 rotate-45 w-2 h-2 bg-gray-900"
            style={{ left: Math.min(Math.max(hoveredDay.rect.left + 6 - Math.max(hoveredDay.rect.left + 6 - 128, 16), 12), 244) }}
          ></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderGoalSection('Daily Goals', 'daily', goals.daily)}
        {renderGoalSection('Weekly Goals', 'weekly', goals.weekly)}
        {renderGoalSection('Monthly Goals', 'monthly', goals.monthly)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="font-semibold text-lg">Weekly Goal Completion</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: 'var(--muted)'}} contentStyle={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}} />
                <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} name="Completed" />
                <Bar dataKey="missed" fill="#EF4444" radius={[4, 4, 0, 0]} name="Missed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="font-semibold text-lg">Job Tracker Status</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={jobStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {jobStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {(activeModalTimeframe || editingGoal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)] shadow-xl relative">
            <button 
              onClick={() => {
                setActiveModalTimeframe(null);
                setEditingGoal(null);
                setNewGoalText('');
              }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-[var(--primary)]"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4 capitalize">
              {editingGoal ? 'Edit Goal' : `Add ${activeModalTimeframe} Goal`}
            </h2>
            <form onSubmit={editingGoal ? handleEditGoal : handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Goal Description</label>
                <input 
                  required
                  value={newGoalText}
                  onChange={e => setNewGoalText(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" 
                  placeholder="e.g. Apply to 5 jobs"
                />
              </div>
              <button type="submit" disabled={addGoal.isPending || updateGoal.isPending} className="w-full btn-primary mt-2">
                {addGoal.isPending || updateGoal.isPending ? 'Saving...' : 'Save Goal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
