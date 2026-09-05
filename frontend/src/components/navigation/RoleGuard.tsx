import React from 'react';
import { Role } from '@/types';
import { useAuthStore } from '@/stores/auth.store';
import { UnauthorizedState } from '@/components/feedback/UnauthorizedState';

export interface RoleGuardProps {
  roles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ roles, children, fallback }: RoleGuardProps) {
  const { hasRole } = useAuthStore();

  const isAllowed = hasRole(roles);

  if (!isAllowed) {
    return fallback ? <>{fallback}</> : <UnauthorizedState />;
  }

  return <>{children}</>;
}
