import React from 'react';
import { Permission } from '@/types';
import { useAuthStore } from '@/stores/auth.store';
import { UnauthorizedState } from '@/components/feedback/UnauthorizedState';

export interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const { hasPermission } = useAuthStore();

  const isAllowed = hasPermission(permission);

  if (!isAllowed) {
    return fallback ? <>{fallback}</> : <UnauthorizedState />;
  }

  return <>{children}</>;
}
