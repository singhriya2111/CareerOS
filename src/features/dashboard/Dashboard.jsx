import { useMemo } from 'react';
import { CheckCircle2, Loader2, Calendar } from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';
import { useDSA } from '../../hooks/useDSA';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useProfile } from '../../hooks/useProfile';

export default function Dashboard() {
  const { data: dbJobs, isLoading: jobsLoading } = useJobs();
  const { data: dbDSA, isLoading: dsaLoading } = useDSA();
  const { data: analyticsLog, isLoading: analyticsLoading } = useAnalytics();
  const { data: profile } = useProfile();

  const isLoading = jobsLoading || dsaLoading || analyticsLoading;

  const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const { jobsToday, dsaToday } = useMemo(() => {
    let jToday = 0;
    let dToday = 0;
    if (analyticsLog) {
      const isTodayStr = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;
      const log = analyticsLog.find(l => l.date === isTodayStr);
      if (log) {
        jToday = log.jobs_applied;
        dToday = log.dsa_solves;
      }
    }
    return { jobsToday: jToday, dsaToday: dToday };
  }, [analyticsLog]);

  const { jobsThisWeek, dsaThisWeek, currentStreak } = useMemo(() => {
    let jWeek = 0;
    let dWeek = 0;
    let streak = 0;

    if (analyticsLog) {
      const today = new Date();
      // Reset time for fair date math
      today.setHours(0, 0, 0, 0);
      
      const logMap = {};
      analyticsLog.forEach(log => {
        logMap[log.date] = log;
        
        // Ensure accurate days diff by ignoring time
        const logDateParts = log.date.split('-');
        const logDate = new Date(logDateParts[0], logDateParts[1] - 1, logDateParts[2]);
        logDate.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(today - logDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays <= 7) {
          jWeek += log.jobs_applied;
          dWeek += log.dsa_solves;
        }
      });

      let streak = 0;
      const checkDate = new Date();
      checkDate.setHours(12, 0, 0, 0); // Set to noon to avoid DST infinite loops

      for (let i = 0; i < 3650; i++) { // Cap at 10 years to completely prevent infinite loops
        const y = checkDate.getFullYear();
        const m = String(checkDate.getMonth() + 1).padStart(2, '0');
        const d = String(checkDate.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        
        const log = logMap[dateStr];
        const hasActivity = log && (log.dsa_solves > 0 || log.jobs_applied > 0 || log.targets_completed > 0);

        if (i === 0) {
          if (hasActivity) streak++;
        } else {
          if (hasActivity) {
            streak++;
          } else {
            break;
          }
        }
        // Safely move back one day by subtracting 24 hours from noon
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
    return { jobsThisWeek: jWeek, dsaThisWeek: dWeek, currentStreak: streak };
  }, [analyticsLog]);

  const totalDSA = useMemo(() => {
    if (!dbDSA) return 0;
    return dbDSA.filter(d => d.status === 'Solved').length;
  }, [dbDSA]);

  const { upcomingInterviews, upcomingDeadlines } = useMemo(() => {
    if (!dbJobs) return { upcomingInterviews: 0, upcomingDeadlines: [] };
    const interviewing = dbJobs.filter(j => j.column_id === 'Interviewing');
    
    const deadlines = interviewing.map(j => ({
      title: 'Technical Interview',
      company: j.company,
      date: j.date || 'TBD'
    }));

    return { upcomingInterviews: interviewing.length, upcomingDeadlines: deadlines };
  }, [dbJobs]);

  const recentActivity = useMemo(() => {
    let activity = [];
    if (dbJobs) {
      activity = [...activity, ...dbJobs.map(j => ({
        action: 'Applied to',
        target: `${j.role} at ${j.company}`,
        time: j.created_at,
        type: 'job'
      }))];
    }
    if (dbDSA) {
      activity = [...activity, ...dbDSA.map(d => ({
        action: d.status === 'Solved' ? 'Completed' : 'Added',
        target: `${d.title} (DSA)`,
        time: d.created_at,
        type: 'dsa'
      }))];
    }
    
    activity.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    return activity.slice(0, 4).map(a => {
      const d = new Date(a.time);
      const isToday = d.toDateString() === new Date().toDateString();
      const displayTime = isToday ? 'Today' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { ...a, displayTime };
    });
  }, [dbJobs, dbDSA]);

  // isLoading check removed to allow instant rendering with graceful fallback of empty data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {profile?.display_name ? profile.display_name : 'User'}</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">{todayFormatted}</p>
      </div>

      <div className="bg-[var(--primary)] rounded-2xl p-6 text-[var(--primary-foreground)] shadow-lg relative overflow-hidden">
        <h2 className="text-xl font-semibold mb-2 relative z-10">Buckle Up Motivation Engine</h2>
        <p className="opacity-90 mb-4 relative z-10 max-w-xl">
          Consistency is key. You've applied to {jobsThisWeek} jobs this week and completed {dsaThisWeek} DSA problems. Keep pushing forward.
        </p>
        
        {(profile?.dsa_target > 0 || profile?.job_target > 0) && (
          <div className="space-y-3 mb-4 max-w-xl relative z-10 bg-black/10 p-4 rounded-xl border border-white/10">
            {profile.dsa_target > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1 font-medium">
                  <span>Daily DSA Goal</span>
                  <span>{dsaToday} / {profile.dsa_target}</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: `${Math.min((dsaToday / profile.dsa_target) * 100, 100)}%` }}></div>
                </div>
              </div>
            )}
            {profile.job_target > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1 font-medium">
                  <span>Daily Job Apps Goal</span>
                  <span>{jobsToday} / {profile.job_target}</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: `${Math.min((jobsToday / profile.job_target) * 100, 100)}%` }}></div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4 relative z-10">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-sm font-medium">Current Streak: </span>
            <span className="font-bold">{currentStreak} Days</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Weekly Applications', value: jobsThisWeek, sub: 'Sent this week' },
          { title: 'DSA Progress', value: totalDSA, sub: 'Problems Solved' },
          { title: 'Interviews', value: upcomingInterviews, sub: 'Upcoming' },
        ].map((stat, i) => (
          <div key={i} className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)] shadow-sm card-hover">
            <div className="flex items-start justify-between mb-2">
              <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">{stat.title}</span>
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
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No recent activity found.</p>
              ) : (
                recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b border-[var(--border)] last:border-0 last:pb-0">
                     <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'job' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                     <div>
                       <p className="font-medium text-sm">
                         <span className="text-gray-500 dark:text-slate-400">{activity.action}</span> {activity.target}
                       </p>
                       <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{activity.displayTime}</p>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>
        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)] shadow-sm">
           <h3 className="text-lg font-semibold mb-4">Upcoming Deadlines</h3>
           <div className="space-y-4">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No upcoming interviews or deadlines.</p>
              ) : (
                upcomingDeadlines.map((deadline, i) => (
                  <div key={i} className="flex flex-col p-3 rounded-lg bg-gray-50 dark:bg-black/20 border border-[var(--border)]">
                    <span className="font-medium text-sm">{deadline.title}</span>
                    <span className="text-xs text-gray-500 dark:text-slate-400 mb-2">{deadline.company}</span>
                    <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded w-fit flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {deadline.date}
                    </span>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
