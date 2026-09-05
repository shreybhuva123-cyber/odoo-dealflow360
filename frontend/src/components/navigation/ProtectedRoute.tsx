import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/constants/routes';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground">Verifying security credentials...</p>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated users are redirected to /login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />;
  }

  // 2. Customers are restricted from internal ERP pages; redirect them to their customer portal
  if (role === 'CUSTOMER') {
    return <Navigate to={ROUTES.PORTAL.QUOTE('portal_apex_1001_secure')} replace />;
  }

  return <>{children}</>;
}
