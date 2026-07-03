import { Flame, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, JS</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Tuesday, October 24</p>
      </div>

      <div className="bg-[var(--primary)] rounded-2xl p-6 text-[var(--primary-foreground)] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Flame className="w-32 h-32" />
        </div>
        <h2 className="text-xl font-semibold mb-2 relative z-10">Buckle Up Motivation Engine</h2>
        <p className="opacity-90 mb-4 relative z-10 max-w-xl">
          "Your momentum is increasing (+15%). Consistency is key. You've applied to 5 jobs this week and completed 3 DSA problems. Keep pushing forward."
        </p>
        <div className="flex gap-4 relative z-10">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-sm font-medium">Current Streak: </span>
            <span className="font-bold">12 Days</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Weekly Goal', value: '4/5', sub: 'Applications', icon: Target },
          { title: 'DSA Progress', value: '15', sub: 'Problems Solved', icon: Code2 },
          { title: 'Interviews', value: '2', sub: 'Upcoming', icon: Calendar },
          { title: 'Momentum', value: '85', sub: 'Top 10%', icon: TrendingUp },
        ].map((stat, i) => (
          <div key={i} className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)] shadow-sm card-hover">
            <div className="flex items-start justify-between mb-2">
              <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">{stat.title}</span>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              {stat.sub}
            </p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--card)] rounded-xl p-6 border border-[var(--border)] shadow-sm">
           <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
           <div className="space-y-4">
              {[
                { action: 'Applied to', target: 'Frontend Engineer at Stripe', time: '2 hours ago' },
                { action: 'Completed', target: 'Two Sum (LeetCode Easy)', time: '5 hours ago' },
                { action: 'Uploaded', target: 'Frontend_Resume_v4.pdf', time: '1 day ago' },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b border-[var(--border)] last:border-0 last:pb-0">
                   <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                   <div>
                     <p className="font-medium text-sm">
                       <span className="text-gray-500 dark:text-slate-400">{activity.action}</span> {activity.target}
                     </p>
                     <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{activity.time}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)] shadow-sm">
           <h3 className="text-lg font-semibold mb-4">Upcoming Deadlines</h3>
           <div className="space-y-4">
              {[
                { title: 'Take-home assignment', company: 'Vercel', date: 'Tomorrow, 11:59 PM' },
                { title: 'Technical Interview', company: 'Google', date: 'Oct 26, 10:00 AM' },
              ].map((deadline, i) => (
                <div key={i} className="flex flex-col p-3 rounded-lg bg-gray-50 dark:bg-black/20 border border-[var(--border)]">
                  <span className="font-medium text-sm">{deadline.title}</span>
                  <span className="text-xs text-gray-500 dark:text-slate-400 mb-2">{deadline.company}</span>
                  <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded w-fit">
                    {deadline.date}
                  </span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

// Quick icons imports missing above
import { Target, Code2 } from 'lucide-react';
