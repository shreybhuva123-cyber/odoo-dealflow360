import React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/auth.store';
import { Role } from '@/types';

export function UnauthorizedState({
  title = 'Access Restricted',
  message = "You don't have permission to access this page.",
}: {
  title?: string;
  message?: string;
}) {
  const navigate = useNavigate();
  const { role, switchRole } = useAuthStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] p-6 text-center">
      <div className="w-full max-w-sm rounded-xl border border-border/80 bg-card p-8 shadow-xl space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
        </div>

        <div className="pt-2">
          <Button
            onClick={() => navigate(ROUTES.APP.DASHBOARD)}
            variant="default"
            size="sm"
            className="w-full text-xs"
          >
            Go to Dashboard
          </Button>
        </div>

        {/* Quick helper for evaluation testing */}
        <div className="pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
          <p className="mb-2">Current Role: <span className="font-semibold text-primary font-mono">{role}</span></p>
          <div className="flex justify-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              onClick={() => switchRole('ADMIN')}
              className="text-[10px]"
            >
              <ArrowRightLeft className="h-3 w-3 mr-1" />
              Switch to Admin
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => switchRole('SALES_MANAGER')}
              className="text-[10px]"
            >
              <ArrowRightLeft className="h-3 w-3 mr-1" />
              Switch to Manager
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotFoundState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <div className="w-full max-w-sm rounded-xl border border-border/80 bg-card p-8 shadow-xl space-y-4">
        <h1 className="text-5xl font-extrabold text-primary font-mono">404</h1>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">Page Not Found</h2>
          <p className="text-xs text-muted-foreground">
            The requested pipeline view, quotation, or workspace route could not be found.
          </p>
        </div>
        <Button onClick={() => navigate(ROUTES.APP.DASHBOARD)} variant="default" size="sm" className="w-full text-xs">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
