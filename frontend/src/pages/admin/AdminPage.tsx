import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminUsers, useRolePermissions, useAdminAuditLog, useSystemSettings } from '@/hooks/useAdmin';
import { usePricingOverview, usePricingRules, useCustomerTiers } from '@/hooks/usePricing';
import { AuditLogTable } from './components';

export function AdminPage() {
  const { data: users = [], isLoading: isUsersLoading } = useAdminUsers();
  const { data: roleConfigs = [] } = useRolePermissions();
  const { data: auditLogs = [], isLoading: isAuditLoading } = useAdminAuditLog();
  const { data: settings } = useSystemSettings();
  const { data: pricingStats } = usePricingOverview();
  const { data: pricingRules = [] } = usePricingRules();
  const { data: tiers = [] } = useCustomerTiers();

  const activeUsersCount = users.filter((u) => u.status === 'ACTIVE').length;
  const activeRulesCount = pricingRules.filter((r) => r.isActive).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Command Center</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Operational governance, user provisioning, role-based access control, and pricing rules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/app/admin/settings"
            className="btn btn-ghost btn-sm text-xs"
          >
            ⚙️ System Settings
          </Link>
          <Link
            to="/app/admin/users"
            className="btn btn-primary btn-sm text-xs"
          >
            + Manage Users
          </Link>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="stat-card">
          <div className="stat-label">Active Users</div>
          <div className="stat-val text-foreground">
            {activeUsersCount} <span className="text-xs text-muted-foreground font-normal">/ {users.length}</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Across 6 roles</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Pricing Rules</div>
          <div className="stat-val text-accent">
            {activeRulesCount} <span className="text-xs text-muted-foreground font-normal">/ {pricingRules.length}</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Guardrails active</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Customer Tiers</div>
          <div className="stat-val text-foreground">{tiers.length}</div>
          <div className="text-[10px] text-muted-foreground mt-1">Standard to Ent</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Margin Compliance</div>
          <div className="stat-val text-emerald-500">
            {pricingStats?.marginCompliancePct ?? 94.2}%
          </div>
          <div className="text-[10px] text-emerald-500 mt-1">Floors respected</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Multi-Factor Auth</div>
          <div className="stat-val text-xs text-emerald-500 font-semibold mt-1">
            {settings?.security.mfaEnforced ? 'ENFORCED' : 'OPTIONAL'}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Manager & Admin</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Audit Retention</div>
          <div className="stat-val text-xs text-foreground font-mono mt-1">
            {settings?.security.auditLogRetentionDays ?? 365} Days
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Immutable ledger</div>
        </div>
      </div>

      {/* 4 Core Command Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Module 1: Users */}
        <div className="card p-5 flex flex-col justify-between hover:border-accent/50 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">👥</span>
              <span className="badge badge-blue text-xs font-semibold">
                {users.length} Registered
              </span>
            </div>
            <h3 className="font-bold text-foreground text-sm">User Management</h3>
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3">
              Provision internal sales reps, ops personnel, managers, and external customer contacts. Toggle status and department assignments.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <Link
              to="/app/admin/users"
              className="btn btn-ghost btn-xs text-accent text-xs inline-flex items-center gap-1"
            >
              Open Users Directory →
            </Link>
          </div>
        </div>

        {/* Module 2: Roles */}
        <div className="card p-5 flex flex-col justify-between hover:border-accent/50 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🛡️</span>
              <span className="badge badge-purple text-xs font-semibold">
                {roleConfigs.length} Roles
              </span>
            </div>
            <h3 className="font-bold text-foreground text-sm">Roles & Permissions</h3>
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3">
              Configure fine-grained module access across Quotations, Approvals, Pipeline, Warehouses, and Invoicing for all 6 organizational roles.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <Link
              to="/app/admin/roles"
              className="btn btn-ghost btn-xs text-accent text-xs inline-flex items-center gap-1"
            >
              Configure RBAC Matrix →
            </Link>
          </div>
        </div>

        {/* Module 3: Pricing */}
        <div className="card p-5 flex flex-col justify-between hover:border-accent/50 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🏷️</span>
              <span className="badge badge-green text-xs font-semibold">
                {pricingRules.length} Rules
              </span>
            </div>
            <h3 className="font-bold text-foreground text-sm">Pricing Governance</h3>
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3">
              Maintain customer account tier ceilings (5% to 20%), category limits, volume discount accelerators, and margin protection floors.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <Link
              to="/app/admin/pricing"
              className="btn btn-ghost btn-xs text-accent text-xs inline-flex items-center gap-1"
            >
              Pricing Hub →
            </Link>
          </div>
        </div>

        {/* Module 4: Settings */}
        <div className="card p-5 flex flex-col justify-between hover:border-accent/50 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">⚙️</span>
              <span className="badge badge-gray text-xs font-semibold">
                System Global
              </span>
            </div>
            <h3 className="font-bold text-foreground text-sm">System Settings</h3>
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3">
              Configure strict floor enforcement, auto-approval SLA timeouts, tax defaults, webhook endpoints, and session security controls.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <Link
              to="/app/admin/settings"
              className="btn btn-ghost btn-xs text-accent text-xs inline-flex items-center gap-1"
            >
              Edit Global Settings →
            </Link>
          </div>
        </div>
      </div>

      {/* Security & Audit Activity Ledger */}
      <AuditLogTable logs={auditLogs} isLoading={isAuditLoading} />
    </div>
  );
}
