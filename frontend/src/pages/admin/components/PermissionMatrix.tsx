import React, { useState } from 'react';
import {
  RolePermissionConfig,
  Role,
  PermissionModule,
  PermissionAction,
} from '@/types';

interface PermissionMatrixProps {
  roleConfigs: RolePermissionConfig[];
  onSaveRolePermissions: (
    role: Role,
    permissions: Record<PermissionModule, PermissionAction[]>
  ) => void;
  isLoading?: boolean;
}

const MODULES: { key: PermissionModule; label: string; icon: string }[] = [
  { key: 'quotations', label: 'Quotations & Smart Builder', icon: '📋' },
  { key: 'approvals', label: 'Approval Center & Workflows', icon: '✅' },
  { key: 'pipeline', label: 'Deals & Pipeline Kanban', icon: '🔀' },
  { key: 'fulfillment', label: 'Fulfillment & Warehouse Allocation', icon: '🚚' },
  { key: 'invoicing', label: 'Billing & Invoicing', icon: '🧾' },
  { key: 'products', label: 'Product Catalog & Pricing', icon: '📦' },
  { key: 'pricing', label: 'Pricing Rules & Governance', icon: '🏷️' },
  { key: 'admin', label: 'Administration & System Settings', icon: '⚙️' },
];

const ACTIONS: { key: PermissionAction; label: string }[] = [
  { key: 'view', label: 'View / Read' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit / Update' },
  { key: 'delete', label: 'Delete' },
  { key: 'approve', label: 'Authorize / Approve' },
  { key: 'export', label: 'Export Data' },
];

export function PermissionMatrix({
  roleConfigs,
  onSaveRolePermissions,
  isLoading,
}: PermissionMatrixProps) {
  const [selectedRole, setSelectedRole] = useState<Role>('SALES_MANAGER');
  const [localPermissions, setLocalPermissions] = useState<
    Record<PermissionModule, PermissionAction[]> | null
  >(null);

  if (isLoading || roleConfigs.length === 0) {
    return (
      <div className="card p-8 text-center text-muted-foreground text-sm">
        Loading permission matrix...
      </div>
    );
  }

  const currentConfig = roleConfigs.find((r) => r.role === selectedRole) || roleConfigs[0];
  const perms = localPermissions || currentConfig.permissions;

  const handleRoleTabChange = (role: Role) => {
    setSelectedRole(role);
    setLocalPermissions(null);
  };

  const handleTogglePermission = (
    moduleKey: PermissionModule,
    actionKey: PermissionAction
  ) => {
    if (selectedRole === 'ADMIN') return; // Admin has permanent full rights

    const currentActions = perms[moduleKey] || [];
    const exists = currentActions.includes(actionKey);
    const updatedActions = exists
      ? currentActions.filter((a) => a !== actionKey)
      : [...currentActions, actionKey];

    setLocalPermissions({
      ...perms,
      [moduleKey]: updatedActions,
    });
  };

  const handleSave = () => {
    if (localPermissions) {
      onSaveRolePermissions(selectedRole, localPermissions);
      setLocalPermissions(null);
    }
  };

  return (
    <div className="card">
      <div className="card-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="card-title">Role-Based Access Control (RBAC) Matrix</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Module permission mapping across internal and external user roles
          </p>
        </div>
        {localPermissions && selectedRole !== 'ADMIN' && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSave}
          >
            Save Role Permissions
          </button>
        )}
      </div>

      {/* Role Selection Tabs */}
      <div className="px-4 pt-2 border-b border-border flex flex-wrap gap-2">
        {roleConfigs.map((rc) => (
          <button
            key={rc.role}
            type="button"
            className={`px-3 py-2 text-xs font-semibold rounded-t-md transition-colors border-b-2 ${
              selectedRole === rc.role
                ? 'border-accent text-accent bg-accent/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => handleRoleTabChange(rc.role)}
          >
            {rc.roleName}
            <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground">
              {rc.userCount}
            </span>
          </button>
        ))}
      </div>

      {/* Role Context Bar */}
      <div className="p-4 bg-muted/20 border-b border-border flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold text-foreground">{currentConfig.roleName}:</span>{' '}
          <span className="text-muted-foreground">{currentConfig.description}</span>
        </div>
        {selectedRole === 'ADMIN' && (
          <span className="badge badge-purple text-[10px]">
            Immutable Root Superuser
          </span>
        )}
      </div>

      {/* Permissions Grid Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="w-1/3">System Module</th>
              {ACTIONS.map((a) => (
                <th key={a.key} className="text-center text-xs">
                  {a.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULES.map((m) => {
              const activeActions = perms[m.key] || [];

              return (
                <tr key={m.key} className="hover:bg-muted/40 transition-colors">
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{m.icon}</span>
                      <span className="font-medium text-foreground text-xs">
                        {m.label}
                      </span>
                    </div>
                  </td>

                  {ACTIONS.map((a) => {
                    const isChecked = activeActions.includes(a.key);
                    const disabled = selectedRole === 'ADMIN';

                    return (
                      <td key={a.key} className="text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={disabled}
                          onChange={() => handleTogglePermission(m.key, a.key)}
                          className={`rounded w-4 h-4 cursor-pointer transition-colors ${
                            disabled ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
