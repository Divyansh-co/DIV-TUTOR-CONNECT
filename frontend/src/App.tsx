import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { BrowseTutorsPage } from './pages/BrowseTutorsPage';
import { TutorProfilePage } from './pages/TutorProfilePage';
import { ClientDashboardPage } from './pages/ClientDashboardPage';
import { ProviderDashboardPage } from './pages/ProviderDashboardPage';
import { AuthPage } from './pages/AuthPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100 font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tutors" element={<BrowseTutorsPage />} />
                <Route path="/tutors/:id" element={<TutorProfilePage />} />
                <Route path="/dashboard/client" element={<ClientDashboardPage />} />
                <Route path="/dashboard/provider" element={<ProviderDashboardPage />} />
                <Route path="/dashboard" element={<ClientDashboardPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />

            {/* Anti-Copy Author Floating Badge */}
            <div className="fixed bottom-3 right-3 z-50 pointer-events-none select-none">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/90 text-white shadow-xl backdrop-blur-md text-[10px] font-semibold border border-zinc-800">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Protected Portfolio • Built by Divyansh Mishra</span>
              </div>
            </div>
          </div>
          <Toaster richColors position="top-right" />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
