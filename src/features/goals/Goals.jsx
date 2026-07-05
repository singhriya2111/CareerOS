import { useState, useMemo } from 'react';
import { Target, CheckCircle2, Circle, TrendingUp, Calendar, Plus, PieChart as PieChartIcon, Activity, Loader2, X, Pencil, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useGoals, useAddGoal, useUpdateGoal, useDeleteGoal } from '../../hooks/useGoals';
import { useJobs } from '../../hooks/useJobs';

const analyticsData = [
  { name: 'Week 1', completed: 15, missed: 3 },
  { name: 'Week 2', completed: 18, missed: 2 },
  { name: 'Week 3', completed: 14, missed: 5 },
  { name: 'Week 4', completed: 22, missed: 1 },
];

const generateHeatmapData = () => {
  const data = [];
  for (let i = 0; i < 364; i++) {
    const intensity = Math.floor(Math.random() * 5); 
    data.push(intensity);
  }
  return data;
};
const heatmapData = generateHeatmapData();

export default function Goals() {
  const { data: dbGoals, isLoading: goalsLoading, error: goalsError } = useGoals();
  const { data: dbJobs, isLoading: jobsLoading } = useJobs();
  
  const updateGoal = useUpdateGoal();
  const addGoal = useAddGoal();
  const deleteGoal = useDeleteGoal();

  const [activeModalTimeframe, setActiveModalTimeframe] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoalText, setNewGoalText] = useState('');

  const goals = useMemo(() => {
    if (!dbGoals) return { daily: [], weekly: [], monthly: [] };
    return {
      daily: dbGoals.filter(g => g.timeframe === 'daily'),
      weekly: dbGoals.filter(g => g.timeframe === 'weekly'),
      monthly: dbGoals.filter(g => g.timeframe === 'monthly'),
    };
  }, [dbGoals]);

  const jobStatusData = useMemo(() => {
    if (!dbJobs || dbJobs.length === 0) return [
      { name: 'No Data', value: 1, color: '#e2e8f0' }
    ];
    
    const counts = {
      'Wishlist': 0,
      'Applied': 0,
      'Interviewing': 0,
      'Offer': 0,
      'Rejected': 0
    };
    dbJobs.forEach(job => {
      if (counts[job.status] !== undefined) {
        counts[job.status]++;
      } else {
        counts[job.status] = 1;
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
      </div>

      {/* Heatmap Section */}
      <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-semibold text-lg">Yearly Progress Activity</h3>
        </div>
        <div className="grid grid-rows-7 grid-flow-col gap-1 overflow-x-auto pb-4">
          {heatmapData.map((intensity, i) => (
            <div 
              key={i} 
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm flex-shrink-0 ${
                intensity === 0 ? 'bg-gray-100 dark:bg-black/20' :
                intensity === 1 ? 'bg-[var(--primary)]/30' :
                intensity === 2 ? 'bg-[var(--primary)]/60' :
                intensity === 3 ? 'bg-[var(--primary)]/80' :
                'bg-[var(--primary)]'
              }`}
              title={`Activity level: ${intensity}`}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-end gap-2 text-xs text-gray-500 dark:text-slate-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-black/20"></div>
            <div className="w-3 h-3 rounded-sm bg-[var(--primary)]/30"></div>
            <div className="w-3 h-3 rounded-sm bg-[var(--primary)]/60"></div>
            <div className="w-3 h-3 rounded-sm bg-[var(--primary)]/80"></div>
            <div className="w-3 h-3 rounded-sm bg-[var(--primary)]"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderGoalSection('Daily Goals', 'daily', goals.daily)}
        {renderGoalSection('Weekly Goals', 'weekly', goals.weekly)}
        {renderGoalSection('Monthly Goals', 'monthly', goals.monthly)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Weekly Report */}
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

        {/* Job Tracker Status Pie Chart */}
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
