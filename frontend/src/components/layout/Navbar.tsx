import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Sun,
  Moon,
  Bell,
  User as UserIcon,
  LogOut,
  Calendar,
  DollarSign,
  Search,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { NotificationDrawer } from './NotificationDrawer';
import { getNotifications } from '../../services/api';

export const Navbar: React.FC = () => {
  const { user, activeRole, setActiveRole, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      getNotifications()
        .then((res) => {
          setUnreadCount(res.data.unread_count || 0);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, isNotifOpen]);

  const handleRoleToggle = () => {
    const nextRole = activeRole === 'client' ? 'provider' : 'client';
    setActiveRole(nextRole);
    navigate(nextRole === 'provider' ? '/dashboard/provider' : '/dashboard/client');
  };

  return (
    <>
      {/* Anti-Copy Author Protected Header Watermark */}
      <div className="w-full bg-zinc-950 text-zinc-300 py-1.5 px-4 text-center text-[11px] font-medium border-b border-zinc-850 flex items-center justify-center gap-2 select-none tracking-wide">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span className="truncate">
          🛡️ Protected Portfolio Project • Designed & Engineered by <strong className="text-white font-bold">Divyansh Mishra</strong> (<span className="text-brand-400 font-mono">@divyanshmishra</span>) • All Rights Reserved
        </span>
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80 transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight text-zinc-950 dark:text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-500/30 dark:bg-brand-500">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-lg">Tutor<span className="text-brand-600 dark:text-brand-400">Connect</span></span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/tutors"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900"
              >
                <Search className="w-4 h-4" />
                Find Tutors
              </Link>
            </nav>
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated && user ? (
              <>
                {/* Role Switcher Button */}
                {(user.is_client && user.is_provider) && (
                  <button
                    onClick={handleRoleToggle}
                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ArrowRightLeft className="w-3 h-3 text-brand-500" />
                    <span>Switch to {activeRole === 'client' ? 'Provider' : 'Client'} Mode</span>
                  </button>
                )}

                {/* Notifications Bell */}
                <button
                  onClick={() => setIsNotifOpen(true)}
                  className="relative rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                    </span>
                  )}
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 rounded-full p-1 border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="h-7 w-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                      {user.first_name?.[0] || user.email[0].toUpperCase()}
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl animate-scale-in dark:border-zinc-800 dark:bg-zinc-900 z-50">
                      <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{user.display_name}</p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                        <span className="mt-1 inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                          {activeRole} view
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to={activeRole === 'provider' ? '/dashboard/provider' : '/dashboard/client'}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Dashboard
                        </Link>

                        {user.is_provider && (
                          <Link
                            to="/dashboard/provider"
                            onClick={() => {
                              setActiveRole('provider');
                              setIsUserMenuOpen(false);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            Provider Earnings & Schedule
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-950/40"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth?tab=login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link to="/auth?tab=register">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-over Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onNotificationChange={() => {
          getNotifications().then((res) => setUnreadCount(res.data.unread_count || 0));
        }}
      />
    </>
  );
};
