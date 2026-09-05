import React, { useEffect } from 'react';
import { AuditLogEntry } from '@/types';
import { formatDateTime, formatRelativeTime } from '@/utils/date';

interface AuditEventDetailsModalProps {
  entry: AuditLogEntry | null;
  onClose: () => void;
}

export function AuditEventDetailsModal({ entry, onClose }: AuditEventDetailsModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!entry) return null;

  const getActionBadge = (action: string) => {
    if (action.includes('APPROVED') || action.includes('PAID')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (action.includes('REJECTED') || action.includes('RETURNED')) {
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
    if (action.includes('UPDATED') || action.includes('MODIFIED')) {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
    if (action.includes('CREATED') || action.includes('ALLOCATED')) {
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    }
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-surface border border-border/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-border/60 bg-surface2/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${getActionBadge(
                entry.action
              )}`}
            >
              {entry.action}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              ID: {entry.id}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface3 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Summary / Description */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Event Description</h4>
            <p className="text-xs text-muted-foreground leading-relaxed bg-surface2/30 p-3 rounded-lg border border-border/40">
              {entry.description}
            </p>
          </div>

          {/* Audit Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg border border-border/50 bg-surface2/20 space-y-1">
              <span className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
                Actor / Principal
              </span>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="font-semibold text-foreground">{entry.userName}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-accent/10 text-accent border border-accent/20">
                  {entry.userRole}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">User ID: {entry.userId}</p>
            </div>

            <div className="p-3 rounded-lg border border-border/50 bg-surface2/20 space-y-1">
              <span className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
                Timestamp & Context
              </span>
              <div className="text-foreground font-mono pt-0.5">
                {formatDateTime(entry.timestamp)}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {formatRelativeTime(entry.timestamp)} • IP: {entry.ipAddress || '127.0.0.1'}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border/50 bg-surface2/20 space-y-1">
              <span className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
                Target Entity
              </span>
              <div className="font-medium text-foreground truncate pt-0.5">
                {entry.entityName}
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">
                Type: {entry.entityType} • Ref: {entry.entityId}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border/50 bg-surface2/20 space-y-1">
              <span className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
                System Source
              </span>
              <div className="font-medium text-foreground pt-0.5">
                {entry.source || 'DealFlow360 Web Workspace'}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tamper-proof Immutable Ledger
              </p>
            </div>
          </div>

          {/* Before vs After Diff Section */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <span>State Field Mutation Diff</span>
              <span className="text-xs font-normal text-muted-foreground">
                (Before vs After comparison)
              </span>
            </h4>

            {entry.diffs && entry.diffs.length > 0 ? (
              <div className="border border-border/70 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface2/50 border-b border-border/60 text-muted-foreground font-semibold">
                      <th className="py-2.5 px-3">Field</th>
                      <th className="py-2.5 px-3">Before Change</th>
                      <th className="py-2.5 px-3"></th>
                      <th className="py-2.5 px-3">After Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-mono text-[11px]">
                    {entry.diffs.map((diff, idx) => (
                      <tr key={idx} className="hover:bg-surface2/20 transition-colors">
                        <td className="py-2.5 px-3 font-sans font-medium text-foreground">
                          {diff.label || diff.field}
                          <span className="block text-[10px] font-mono text-muted-foreground">
                            {diff.field}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-red-400 bg-red-500/5">
                          <span className="line-through decoration-red-400/60 mr-1.5">
                            {String(diff.before ?? 'null')}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center text-muted-foreground font-sans">
                          →
                        </td>
                        <td className="py-2.5 px-3 text-emerald-400 bg-emerald-500/5 font-semibold">
                          {String(diff.after ?? 'null')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-surface2/20 border border-border/40 text-center text-xs text-muted-foreground">
                No granular field mutation recorded for this event.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border/60 bg-surface2/30 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
            }}
            className="btn btn-ghost btn-sm text-xs text-muted-foreground hover:text-foreground"
          >
            📋 Copy Raw Event JSON
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary btn-sm text-xs px-4"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
