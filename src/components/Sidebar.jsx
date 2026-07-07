import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Code2, 
  Archive, 
  Target, 
  Server, 
  Award, 
  Link2 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Job Tracker', path: '/jobs', icon: Briefcase },
  { name: 'Resume Vault', path: '/resumes', icon: FileText },
  { name: 'Certifications', path: '/certifications', icon: Award },
  { name: 'DSA Hub', path: '/dsa', icon: Code2 },
  { name: 'System Design', path: '/system-design', icon: Server },
  { name: 'Goals & Analytics', path: '/goals', icon: Target },
  { name: 'Important Links', path: '/links', icon: Link2 },
  { name: 'Career Vault', path: '/vault', icon: Archive },
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-[var(--border)] bg-[var(--card)] hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-[var(--border)] gap-2">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#tealGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <defs>
            <linearGradient id="tealGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#5eead4" />
            </linearGradient>
          </defs>
          <path d="M 18 7 A 8 8 0 1 0 18 17 M 12 12 Q 16 18, 22 6 M 16 6 L 22 6 L 22 12" />
        </svg>
        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] opacity-90 bg-clip-text text-transparent">
          CareerOS
        </span>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-black/5 dark:bg-white/10 text-[var(--primary)] font-bold shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
