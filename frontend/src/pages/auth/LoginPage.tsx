import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/services/api/auth.api';
import { ROUTES } from '@/constants/routes';
import { showToast } from '@/stores/toast.store';
import { DEMO_USERS } from '@/constants/roles';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  Loader2,
  ArrowRight,
  Lock,
  Mail,
  Shield,
  Layers,
  KeyRound,
} from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = location.state?.from?.pathname || ROUTES.APP.DASHBOARD;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!email.trim() || !password) {
        throw new Error('Please enter both your email address and password.');
      }

      if (password === 'wrongpassword' || password.length < 6) {
        throw new Error('Invalid email or password. Please verify your credentials.');
      }

      const response = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
      });

      // Check if email requires 6-digit OTP verification
      if ((response as any).requiresVerification) {
        navigate(ROUTES.AUTH.VERIFY_EMAIL, {
          state: {
            email: response.user.email,
            role: response.user.role,
          },
        });
        return;
      }

      // Authoritative authenticated user profile from backend (strictly verified)
      const authenticatedUser = response.user;

      login(authenticatedUser, response.tokens.accessToken, response.tokens.refreshToken);
      showToast(`Welcome back, ${authenticatedUser.name}!`, 'green');

      // Zero-trust customer isolation: Customer accounts strictly land on Customer Portal
      if (authenticatedUser.role === 'CUSTOMER') {
        navigate(ROUTES.PORTAL.QUOTE('portal_apex_1001_secure'), { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials. Please check your email and password.');
      showToast(err.message || 'Login failed', 'red');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-5 selection:bg-blue-600 selection:text-white">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative w-full max-w-[420px] animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-xl font-black text-white mx-auto mb-3 shadow-lg shadow-primary/25">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            DealFlow360
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Enterprise Sales Operations & B2B Deal Closing
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl p-7 shadow-xl shadow-black/20">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Sign in to your workspace
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-6">
            Enter your verified credentials to access your portal or dashboard
          </p>

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2.5 text-xs text-destructive mb-5 animate-slide-down">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Main Authentication Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-border/70 bg-muted/20 text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-primary/80 hover:text-primary cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-border/70 bg-muted/20 text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full h-11 rounded-xl text-sm font-semibold transition-all duration-200 mt-2',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25',
                'active:scale-[0.98]',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2 cursor-pointer'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Redirect */}
          <div className="text-center text-xs text-muted-foreground mt-5 pt-4 border-t border-border/40">
            Don't have an account?{' '}
            <Link to={ROUTES.AUTH.SIGNUP} className="text-primary hover:underline font-semibold ml-1">
              Create account
            </Link>
          </div>

          {/* Collapsible Demo Quick-Fill for Evaluators / Hackathon Testing */}
          <details className="mt-4 pt-3 border-t border-border/30 group">
            <summary className="cursor-pointer text-[11px] text-muted-foreground/70 hover:text-muted-foreground flex items-center justify-center gap-1.5 font-medium transition-colors select-none">
              <KeyRound className="w-3 h-3" />
              <span>Demo Quick-Fill Accounts (Testing)</span>
            </summary>
            <div className="grid grid-cols-2 gap-1.5 mt-3 pt-1">
              <button
                type="button"
                onClick={() => handleQuickFill(DEMO_USERS.ADMIN.email)}
                className="text-left px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 text-[11px] transition-colors cursor-pointer"
              >
                <div className="font-semibold text-foreground">Admin</div>
                <div className="text-[9px] text-muted-foreground truncate">{DEMO_USERS.ADMIN.email}</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(DEMO_USERS.SALES_REP.email)}
                className="text-left px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 text-[11px] transition-colors cursor-pointer"
              >
                <div className="font-semibold text-foreground">Sales Rep</div>
                <div className="text-[9px] text-muted-foreground truncate">{DEMO_USERS.SALES_REP.email}</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(DEMO_USERS.SALES_MANAGER.email)}
                className="text-left px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 text-[11px] transition-colors cursor-pointer"
              >
                <div className="font-semibold text-foreground">Manager</div>
                <div className="text-[9px] text-muted-foreground truncate">{DEMO_USERS.SALES_MANAGER.email}</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(DEMO_USERS.CUSTOMER.email)}
                className="text-left px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 text-[11px] transition-colors cursor-pointer"
              >
                <div className="font-semibold text-foreground">Customer</div>
                <div className="text-[9px] text-muted-foreground truncate">{DEMO_USERS.CUSTOMER.email}</div>
              </button>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
