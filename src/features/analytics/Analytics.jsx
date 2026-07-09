import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import { useJobs } from '../../hooks/useJobs';
import { useAnalytics } from '../../hooks/useAnalytics';

const COLORS = ['#3B82F6', '#F59E0B', '#EF4444', '#10B981'];

export default function Analytics() {
  const { data: jobs } = useJobs();
  const { data: analytics } = useAnalytics();

  const pieData = useMemo(() => {
    if (!jobs) return [];
    let active = 0, interviewing = 0, rejected = 0, offers = 0;
    jobs.forEach(j => {
      if (j.column_id === 'Applied' || j.column_id === 'Wishlist') active++;
      else if (j.column_id === 'Interviewing') interviewing++;
      else if (j.column_id === 'Rejected') rejected++;
      else if (j.column_id === 'Offer') offers++;
    });
    return [
      { name: 'Active', value: active },
      { name: 'Interviewing', value: interviewing },
      { name: 'Rejected', value: rejected },
      { name: 'Offers', value: offers },
    ].filter(d => d.value > 0);
  }, [jobs]);

  const barData = useMemo(() => {
    if (!analytics) return [];
    // Get last 4 weeks
    const weeks = [
      { name: 'Week 4 (Current)', applications: 0, start: 0, end: 7 },
      { name: 'Week 3', applications: 0, start: 7, end: 14 },
      { name: 'Week 2', applications: 0, start: 14, end: 21 },
      { name: 'Week 1', applications: 0, start: 21, end: 28 },
    ];
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    analytics.forEach(log => {
      const parts = log.date.split('-');
      const d = new Date(parts[0], parts[1]-1, parts[2]);
      d.setHours(0,0,0,0);
      const diffDays = Math.ceil(Math.abs(today - d) / (1000 * 60 * 60 * 24));
      
      for (const w of weeks) {
        if (diffDays >= w.start && diffDays < w.end) {
          w.applications += log.jobs_applied;
          break;
        }
      }
    });
    return weeks.reverse();
  }, [analytics]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Outcome Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Track your application pipeline</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)] shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Application Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-sm font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)] shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Weekly Applications</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: 'var(--muted)'}} contentStyle={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}} />
                <Bar dataKey="applications" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
