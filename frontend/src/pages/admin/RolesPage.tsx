import React from 'react';
import { Link } from 'react-router-dom';
import { useRolePermissions, useUpdateRolePermissions } from '@/hooks/useAdmin';
import { PermissionMatrix } from './components';

export function RolesPage() {
  const { data: roleConfigs = [], isLoading } = useRolePermissions();
  const updatePermissions = useUpdateRolePermissions();

  const handleSaveRolePermissions = (role: any, permissions: any) => {
    updatePermissions.mutate({ role, permissions });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link to="/app/admin" className="hover:text-foreground">
              Admin
            </Link>
            <span>/</span>
            <span>Roles & Permissions</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Role-Based Access Control (RBAC)</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure system module permissions across Sales, Managerial, Finance, Logistics, and Administrative roles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/app/admin/users"
            className="btn btn-ghost btn-sm text-xs"
          >
            ← Users Directory
          </Link>
          <Link
            to="/app/admin/settings"
            className="btn btn-primary btn-sm text-xs"
          >
            System Settings →
          </Link>
        </div>
      </div>

      {/* Permission Matrix */}
      <PermissionMatrix
        roleConfigs={roleConfigs}
        onSaveRolePermissions={handleSaveRolePermissions}
        isLoading={isLoading}
      />
    </div>
  );
}
