import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/services/api/auth.api';
import { ROUTES } from '@/constants/routes';
import { showToast } from '@/stores/toast.store';
import { Role } from '@/types';
import { DEMO_USERS } from '@/constants/roles';
import { cn } from '@/lib/utils';
import {
  UserCircle,
  Briefcase,
  Wallet,
  Settings,
  AlertCircle,
  Loader2,
  ArrowRight,
  Lock,
  Mail,
} from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState<Role>('SALES_REP');
  const [email, setEmail] = useState('alex.morgan@dealflow360.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = location.state?.from?.pathname || ROUTES.APP.DASHBOARD;

  const roleConfigs: { role: Role; icon: React.ReactNode; name: string; desc: string; defaultEmail: string; color: string }[] = [
    { role: 'SALES_REP', icon: <UserCircle className="w-4 h-4" />, name: 'Sales Rep', desc: 'Build & manage quotes', defaultEmail: 'alex.morgan@dealflow360.com', color: 'blue' },
    { role: 'SALES_MANAGER', icon: <Briefcase className="w-4 h-4" />, name: 'Sales Manager', desc: 'Approve & monitor deals', defaultEmail: 'maria.chen@dealflow360.com', color: 'purple' },
    { role: 'FINANCE', icon: <Wallet className="w-4 h-4" />, name: 'Finance', desc: 'High-risk approvals & billing', defaultEmail: 'david.park@dealflow360.com', color: 'emerald' },
    { role: 'ADMIN', icon: <Settings className="w-4 h-4" />, name: 'Admin', desc: 'Configure backend & reports', defaultEmail: 'admin@dealflow360.com', color: 'amber' },
  ];

  const handleSelectRole = (r: Role, defaultMail: string) => {
    setSelectedRole(r);
    setEmail(defaultMail);
    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (password === 'wrongpassword' || password.length < 8) {
        throw new Error('Password must contain at least 8 characters and match credentials.');
      }

      const response = await authApi.login({
        email,
        password,
      });

      const matchedUser = {
        ...response.user,
        role: selectedRole,
        name:
          selectedRole === 'SALES_REP'
            ? 'Alex Morgan'
            : selectedRole === 'SALES_MANAGER'
            ? 'Maria Chen'
            : selectedRole === 'FINANCE'
            ? 'David Park'
            : 'Admin User',
      };

      login(matchedUser, response.tokens.accessToken, response.tokens.refreshToken);
      showToast(`Welcome back, ${matchedUser.name}!`, 'green');
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials');
      showToast(err.message || 'Login failed', 'red');
    } finally {
      setIsLoading(false);
    }
  };

  const roleColorMap: Record<string, { selected: string; ring: string; iconBg: string }> = {
    blue: { selected: 'border-blue-500/60 bg-blue-500/10', ring: 'ring-blue-500/30', iconBg: 'bg-blue-500/20 text-blue-400' },
    purple: { selected: 'border-purple-500/60 bg-purple-500/10', ring: 'ring-purple-500/30', iconBg: 'bg-purple-500/20 text-purple-400' },
    emerald: { selected: 'border-emerald-500/60 bg-emerald-500/10', ring: 'ring-emerald-500/30', iconBg: 'bg-emerald-500/20 text-emerald-400' },
    amber: { selected: 'border-amber-500/60 bg-amber-500/10', ring: 'ring-amber-500/30', iconBg: 'bg-amber-500/20 text-amber-400' },
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-5">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative w-full max-w-[400px] animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-xl font-black text-white mx-auto mb-3 shadow-lg shadow-primary/25">
            D
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            DealFlow360
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Enterprise Sales Operations Platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-7 shadow-xl shadow-black/20">
          <h2 className="text-base font-bold text-foreground mb-1">
            Sign in to your workspace
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            Choose a role to explore the platform
          </p>

          {/* Error */}
          {errorMessage && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2.5 text-xs text-destructive mb-5 animate-slide-down">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Role Grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {roleConfigs.map((rc) => {
              const isSelected = selectedRole === rc.role;
              const colors = roleColorMap[rc.color];
              return (
                <button
                  key={rc.role}
                  type="button"
                  onClick={() => handleSelectRole(rc.role, rc.defaultEmail)}
                  className={cn(
                    'text-left p-3 rounded-xl border transition-all duration-200 group cursor-pointer',
                    isSelected
                      ? `${colors.selected} ring-1 ${colors.ring} shadow-sm`
                      : 'border-border/60 bg-muted/30 hover:bg-muted/50 hover:border-border'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn('w-6 h-6 rounded-md flex items-center justify-center', colors.iconBg)}>
                      {rc.icon}
                    </div>
                    <span className="text-xs font-semibold text-foreground">{rc.name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-snug pl-8">
                    {rc.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-border/60 bg-muted/20 text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-border/60 bg-muted/20 text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full h-10 rounded-lg text-sm font-semibold transition-all duration-200',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25',
                'active:scale-[0.98]',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer hint */}
          <p className="text-center text-[10px] text-muted-foreground/50 mt-5">
            Demo credentials are pre-filled • Select any role above
          </p>
        </div>
      </div>
    </div>
  );
}
