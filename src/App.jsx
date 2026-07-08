import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Dashboard from './features/dashboard/Dashboard';

import JobTracker from './features/jobs/JobTracker';
import ResumeVault from './features/resumes/ResumeVault';
import DSAHub from './features/dsa/DSAHub';
import CareerVault from './features/vault/CareerVault';
import Goals from './features/goals/Goals';
import SystemDesignHub from './features/system-design/SystemDesignHub';
import Certifications from './features/certifications/Certifications';
import LinksHub from './features/links/LinksHub';
import Auth from './features/auth/Auth';
import Settings from './features/settings/Settings';
import Profile from './features/settings/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Auth />;
  return children;
}

import { Navigate } from 'react-router-dom';
import { useProfile } from './hooks/useProfile';

function HomeRoute() {
  const { data: profile, isLoading } = useProfile();
  
  if (isLoading) return <div className="h-full flex items-center justify-center text-gray-500">Loading workspace...</div>;
  
  if (profile?.default_tab) {
    switch (profile.default_tab) {
      case 'Applications Tracker': return <Navigate to="/jobs" replace />;
      case 'DSA Hub': return <Navigate to="/dsa" replace />;
      case 'System Design Tree': return <Navigate to="/system-design" replace />;
      case 'Goals & Analytics': return <Navigate to="/goals" replace />;
      case 'Dashboard':
      default: return <Dashboard />;
    }
  }
  
  return <Dashboard />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<HomeRoute />} />
              <Route path="jobs" element={<JobTracker />} />
              <Route path="resumes" element={<ResumeVault />} />
              <Route path="dsa" element={<DSAHub />} />
              <Route path="system-design" element={<SystemDesignHub />} />
              <Route path="goals" element={<Goals />} />
              <Route path="vault" element={<CareerVault />} />
              <Route path="certifications" element={<Certifications />} />
              <Route path="links" element={<LinksHub />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
