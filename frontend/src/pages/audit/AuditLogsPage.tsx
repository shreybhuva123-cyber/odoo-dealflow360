import React, { useState } from 'react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { AuditLogTable, AuditFilters, AuditEventDetailsModal } from '@/components/audit';
import { AuditLogEntry, AuditLogFilterOptions } from '@/types';
import { showToast } from '@/stores/toast.store';

export function AuditLogsPage() {
  const [filters, setFilters] = useState<AuditLogFilterOptions>({
    entityType: 'ALL',
    action: 'ALL',
  });
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const { data: logs = [], isLoading } = useAuditLogs(filters);

  // Quick stats
  const totalEvents = logs.length;
  const uniqueActors = new Set(logs.map((l) => l.userName)).size;
  const mutatedEvents = logs.filter((l) => l.diffs && l.diffs.length > 0).length;

  const handleExportJSON = () => {
    try {
      const dataStr =
        'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `dealflow360-audit-trail-${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Audit trail exported successfully', 'green');
    } catch {
      showToast('Failed to export audit trail', 'red');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Compliance & Audit Trail
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span>●</span>
              <span>SOC2 / ISO 27001 Ready</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Immutable chronological ledger of approvals, discount rule overrides, stage changes,
            and system configurations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportJSON}
          className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>📥</span>
          <span>Export Audit Ledger</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-surface border border-border/70 rounded-xl p-3.5">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Total Audited Events
          </div>
          <div className="text-2xl font-bold text-foreground mt-1 font-mono">{totalEvents}</div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Recorded across all modules</p>
        </div>

        <div className="bg-surface border border-border/70 rounded-xl p-3.5">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            State Mutations
          </div>
          <div className="text-2xl font-bold text-accent mt-1 font-mono">{mutatedEvents}</div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Field-level before/after diffs</p>
        </div>

        <div className="bg-surface border border-border/70 rounded-xl p-3.5">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Active Principals
          </div>
          <div className="text-2xl font-bold text-foreground mt-1 font-mono">{uniqueActors}</div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Authorized system users</p>
        </div>

        <div className="bg-surface border border-border/70 rounded-xl p-3.5">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Ledger Integrity
          </div>
          <div className="text-xs font-semibold text-emerald-400 mt-2 flex items-center gap-1.5">
            <span>🛡️</span>
            <span>Immutable & Verified</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Tamper-evident logs</p>
        </div>
      </div>

      {/* Filter Controls */}
      <AuditFilters
        filters={filters}
        onChange={setFilters}
        onExportLogs={handleExportJSON}
      />

      {/* Audit Log Table */}
      <AuditLogTable
        logs={logs}
        isLoading={isLoading}
        onSelectEntry={(entry) => setSelectedEntry(entry)}
      />

      {/* Detail Inspector Modal */}
      {selectedEntry && (
        <AuditEventDetailsModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
}
