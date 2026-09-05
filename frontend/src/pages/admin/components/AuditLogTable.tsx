import React from 'react';
import { AuditActivityItem } from '@/types';

interface AuditLogTableProps {
  logs: AuditActivityItem[];
  isLoading?: boolean;
}

export function AuditLogTable({ logs, isLoading }: AuditLogTableProps) {
  if (isLoading) {
    return (
      <div className="card p-8 text-center text-muted-foreground text-sm">
        Loading audit log...
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Security & Configuration Audit Log</div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Immutable event ledger tracking administrative overrides, tier adjustments, and user changes
        </p>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Event Action</th>
              <th>Module</th>
              <th>Target Entity</th>
              <th>IP / Host</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                <td className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground text-xs">
                      {log.actorName}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {log.actorEmail}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="badge badge-gray text-[10px] font-mono">
                    {log.action}
                  </span>
                </td>
                <td>
                  <span className="text-xs font-medium text-foreground">
                    {log.module}
                  </span>
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">
                      {log.target}
                    </span>
                    {log.details && (
                      <span className="text-[11px] text-muted-foreground mt-0.5">
                        {log.details}
                      </span>
                    )}
                  </div>
                </td>
                <td className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                  {log.ipAddress || '127.0.0.1'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
