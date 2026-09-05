import React from 'react';
import { Link } from 'react-router-dom';
import { useSystemSettings, useUpdateSystemSettings } from '@/hooks/useAdmin';
import { SystemSettingsForm } from './components';

export function SettingsPage() {
  const { data: settings, isLoading } = useSystemSettings();
  const updateSettings = useUpdateSystemSettings();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link to="/app/admin" className="hover:text-foreground">
              Admin
            </Link>
            <span>/</span>
            <span>Settings</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">System Governance & Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Global pricing guardrails, approval automation SLAs, security parameters, and notification channels
          </p>
        </div>

        <Link
          to="/app/admin"
          className="btn btn-ghost btn-sm text-xs"
        >
          ← Admin Command
        </Link>
      </div>

      {/* Settings Form */}
      <SystemSettingsForm
        settings={settings}
        onSave={(data) => updateSettings.mutate(data)}
        isLoading={isLoading}
      />
    </div>
  );
}
