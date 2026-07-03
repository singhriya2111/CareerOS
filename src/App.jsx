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
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Auth />;
  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="jobs" element={<JobTracker />} />
              <Route path="resumes" element={<ResumeVault />} />
              <Route path="dsa" element={<DSAHub />} />
              <Route path="system-design" element={<SystemDesignHub />} />
              <Route path="goals" element={<Goals />} />
              <Route path="vault" element={<CareerVault />} />
              <Route path="certifications" element={<Certifications />} />
              <Route path="links" element={<LinksHub />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
