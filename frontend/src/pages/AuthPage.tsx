import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GraduationCap, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, isAuthenticated, activeRole } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>(
    searchParams.get('tab') === 'register' ? 'register' : 'login'
  );

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isProvider, setIsProvider] = useState(searchParams.get('role') === 'provider');
  const [isClient, setIsClient] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(activeRole === 'provider' ? '/dashboard/provider' : '/dashboard/client');
    }
  }, [isAuthenticated, activeRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (tab === 'login') {
        await login({ email, password });
        navigate(activeRole === 'provider' ? '/dashboard/provider' : '/dashboard/client');
      } else {
        await register({
          email,
          password,
          password_confirm: passwordConfirm,
          first_name: firstName,
          last_name: lastName,
          is_client: isClient,
          is_provider: isProvider,
        });
        setSuccessMsg('Account created successfully! You can now log in.');
        setTab('login');
      }
    } catch (err: any) {
      const responseData = err.response?.data;
      if (typeof responseData === 'object') {
        const firstKey = Object.keys(responseData)[0];
        const val = responseData[firstKey];
        setErrorMsg(Array.isArray(val) ? val[0] : typeof val === 'string' ? val : 'Authentication failed.');
      } else {
        setErrorMsg('Authentication error. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, isTutor: boolean = false) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setTab('login');
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/30">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {tab === 'login' ? 'Welcome back to TutorConnect' : 'Create your TutorConnect account'}
          </h2>
          <p className="text-xs text-zinc-500">
            {tab === 'login'
              ? 'Enter your credentials to access your portal'
              : 'Join the premier marketplace for 1-on-1 tutoring sessions'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              tab === 'login'
                ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              tab === 'register'
                ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            Register
          </button>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
          {errorMsg && (
            <div className="mb-4 p-3 text-xs text-red-700 bg-red-50 rounded-lg border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 text-xs text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                {/* Role picker buttons */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Select Your Marketplace Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsClient(true);
                        setIsProvider(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isClient && !isProvider
                          ? 'border-brand-600 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-950/50 ring-2 ring-brand-500/20'
                          : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        I am a Student
                      </span>
                      <span className="text-[10px] text-zinc-500">I want to book private sessions</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProvider(true);
                        setIsClient(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isProvider && !isClient
                          ? 'border-brand-600 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-950/50 ring-2 ring-brand-500/20'
                          : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        I am a Tutor
                      </span>
                      <span className="text-[10px] text-zinc-500">I want to teach & earn</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <Input
              type="email"
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {tab === 'register' && (
              <Input
                type="password"
                label="Confirm Password"
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
            )}

            <Button type="submit" variant="primary" size="md" isLoading={loading} className="w-full font-bold">
              {tab === 'login' ? 'Sign In to Account' : 'Create Account'}
            </Button>
          </form>

          {/* Instant 1-Click Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider text-center">
              Quick Demo Logins (Pre-seeded)
            </span>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoFill('client@tutorconnect.com')}
                className="text-xs"
              >
                Demo Student
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoFill('tutor@tutorconnect.com', true)}
                className="text-xs"
              >
                Demo Tutor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
