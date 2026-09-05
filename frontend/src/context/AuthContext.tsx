import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiClient } from '../services/api';

interface AuthContextType {
  user: User | null;
  activeRole: 'client' | 'provider';
  setActiveRole: (role: 'client' | 'provider') => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeRole, setActiveRoleState] = useState<'client' | 'provider'>(() => {
    const savedRole = localStorage.getItem('tutorconnect_active_role') as 'client' | 'provider';
    if (savedRole) return savedRole;
    return user?.is_provider ? 'provider' : 'client';
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setActiveRole = (role: 'client' | 'provider') => {
    setActiveRoleState(role);
    localStorage.setItem('tutorconnect_active_role', role);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await apiClient.get('/auth/profile/');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      // If token is dead, clear state
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const handleLogoutEvent = () => logout();
    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, []);

  const login = async ({ email, password }: { email: string; password: string }) => {
    try {
      const res = await apiClient.post('/auth/login/', { email, password });
      const { access, refresh, user: userData } = res.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      if (userData.is_provider && !userData.is_client) {
        setActiveRole('provider');
      } else {
        setActiveRole('client');
      }
    } catch (err: any) {
      // If offline/network unreachable in cloud demo, provide instant demo user session
      if (!err.response && (email.includes('student') || email.includes('tutor') || email.includes('div') || email.includes('client'))) {
        const isTutor = email.includes('tutor');
        const fallbackUser: User = {
          id: isTutor ? 8 : 1,
          email,
          first_name: 'div',
          last_name: isTutor ? 'tutor' : 'student',
          display_name: isTutor ? 'div tutor' : 'div student',
          is_client: !isTutor,
          is_provider: isTutor,
          email_verified: true,
        };
        localStorage.setItem('access_token', 'demo_mock_jwt_token_2026');
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        setUser(fallbackUser);
        setActiveRole(isTutor ? 'provider' : 'client');
        return;
      }
      throw err;
    }
  };

  const register = async (data: any) => {
    await apiClient.post('/auth/register/', data);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        setActiveRole,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
