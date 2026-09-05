import React from 'react';
import { AuditLogEntry } from '@/types';
import { formatDateTime, formatRelativeTime } from '@/utils/date';

interface AuditLogTableProps {
  logs: AuditLogEntry[];
  isLoading: boolean;
  onSelectEntry: (entry: AuditLogEntry) => void;
}

export function AuditLogTable({ logs, isLoading, onSelectEntry }: AuditLogTableProps) {
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

  const getEntityBadge = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'quotation':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'deal':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'pricingrule':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'fulfillment':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'invoice':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-surface3 text-muted-foreground border-border/40';
    }
  };

  if (isLoading) {
    return (
      <div className="border border-border/70 rounded-xl p-12 bg-surface flex flex-col items-center justify-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        <span className="text-xs text-muted-foreground">Loading compliance audit trail...</span>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="border border-border/70 rounded-xl p-12 bg-surface text-center space-y-2">
        <span className="text-3xl block">📜</span>
        <h3 className="text-sm font-semibold text-foreground">No Audit Records Found</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          No audit entries match the selected filters or date range. All actions across quotations,
          deals, pricing, and fulfillment are automatically recorded.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border/70 rounded-xl overflow-hidden bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-surface2/60 border-b border-border/70 text-muted-foreground font-semibold">
              <th className="py-3 px-4 w-36">Timestamp</th>
              <th className="py-3 px-4 w-44">Actor</th>
              <th className="py-3 px-4 w-44">Action</th>
              <th className="py-3 px-4 w-52">Target Entity</th>
              <th className="py-3 px-4">Event Summary</th>
              <th className="py-3 px-4 text-right w-24">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {logs.map((entry) => (
              <tr
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className="hover:bg-surface2/30 transition-colors cursor-pointer group"
              >
                {/* Timestamp */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="font-mono text-foreground font-medium block">
                    {formatRelativeTime(entry.timestamp)}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {formatDateTime(entry.timestamp).split(',')[1]}
                  </span>
                </td>

                {/* Actor */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="font-semibold text-foreground block truncate">
                    {entry.userName}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {entry.userRole}
                  </span>
                </td>

                {/* Action */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${getActionBadge(
                      entry.action
                    )}`}
                  >
                    {entry.action}
                  </span>
                </td>

                {/* Entity */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${getEntityBadge(
                        entry.entityType
                      )}`}
                    >
                      {entry.entityType}
                    </span>
                  </div>
                  <span className="text-foreground font-medium truncate block max-w-[200px]" title={entry.entityName}>
                    {entry.entityName}
                  </span>
                </td>

                {/* Description & Diffs */}
                <td className="py-3 px-4">
                  <p className="text-muted-foreground text-xs line-clamp-1 group-hover:text-foreground transition-colors">
                    {entry.description}
                  </p>
                  {entry.diffs && entry.diffs.length > 0 && (
                    <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.2 rounded bg-accent/10 text-accent font-mono text-[10px]">
                      <span>⚡</span>
                      <span>{entry.diffs.length} field mutations</span>
                    </span>
                  )}
                </td>

                {/* Inspect Button */}
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEntry(entry);
                    }}
                    className="btn btn-ghost btn-xs text-xs text-accent hover:underline group-hover:bg-surface3"
                  >
                    Inspect →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
