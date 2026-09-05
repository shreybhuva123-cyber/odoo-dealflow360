import React, { useState } from 'react';
import { formatDateTime, formatRelativeTime } from '@/utils/date';

export interface ActivityTimelineItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  actorName?: string;
  actorRole?: string;
  timestamp: string;
  diffs?: { field: string; label?: string; before: any; after: any }[];
}

interface ActivityTimelineProps {
  items: ActivityTimelineItem[];
  title?: string;
  subtitle?: string;
  onAddNote?: () => void;
  emptyMessage?: string;
  allowSearch?: boolean;
}

export function ActivityTimeline({
  items = [],
  title = 'Activity Timeline & Audit Trail',
  subtitle = 'Chronological history of mutations, updates, and touchpoints',
  onAddNote,
  emptyMessage = 'No activity recorded yet.',
  allowSearch = true,
}: ActivityTimelineProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getActivityIcon = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes('APPROVAL') || t.includes('APPROVE')) return '⏳';
    if (t.includes('QUOTE')) return '📝';
    if (t.includes('DEAL') || t.includes('STAGE')) return '🚀';
    if (t.includes('CUSTOMER') || t.includes('NEGOTIAT')) return '💬';
    if (t.includes('PAYMENT') || t.includes('INVOICE')) return '🧾';
    if (t.includes('STOCK') || t.includes('SHIPMENT') || t.includes('FULFILL')) return '🚚';
    if (t.includes('RISK')) return '⚠️';
    if (t.includes('RULE') || t.includes('SETTING')) return '⚙️';
    if (t.includes('NOTE')) return '📌';
    return '🔔';
  };

  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.actorName && item.actorName.toLowerCase().includes(q)) ||
      item.type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-surface border border-border/70 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface2/30">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface3 text-muted-foreground font-mono">
              {items.length}
            </span>
          </h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {allowSearch && items.length > 3 && (
            <div className="relative">
              <input
                type="text"
                placeholder="Filter history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-sm text-xs pl-7 w-36 sm:w-44 bg-surface"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                🔍
              </span>
            </div>
          )}

          {onAddNote && (
            <button
              type="button"
              onClick={onAddNote}
              className="btn btn-primary btn-sm text-xs flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Add Note</span>
            </button>
          )}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="p-5">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground space-y-1">
            <span className="text-2xl block">📜</span>
            <p className="font-medium text-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-border/60">
            {filteredItems.map((item) => {
              const isExpanded = !!expandedItems[item.id];
              const hasDiffs = item.diffs && item.diffs.length > 0;

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline Dot Icon */}
                  <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-surface border-2 border-accent/60 flex items-center justify-center text-[10px] shadow-sm">
                    <span>{getActivityIcon(item.type)}</span>
                  </div>

                  {/* Content Card */}
                  <div className="bg-surface2/30 border border-border/50 rounded-lg p-3.5 hover:border-border transition-colors space-y-1.5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="font-semibold text-xs text-foreground flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface3 text-muted-foreground">
                          {item.type}
                        </span>
                      </div>

                      <div className="text-[11px] text-muted-foreground font-mono" title={formatDateTime(item.timestamp)}>
                        {formatRelativeTime(item.timestamp)}
                      </div>
                    </div>

                    {item.actorName && (
                      <div className="text-xs text-muted-foreground">
                        by <strong className="text-foreground">{item.actorName}</strong>{' '}
                        {item.actorRole && (
                          <span className="text-[10px] text-muted-foreground">({item.actorRole})</span>
                        )}
                      </div>
                    )}

                    {item.description && (
                      <p className="text-xs text-muted-foreground/90 leading-relaxed bg-surface/60 p-2.5 rounded border border-border/30">
                        {item.description}
                      </p>
                    )}

                    {/* Diff Expander */}
                    {hasDiffs && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.id)}
                          className="text-[11px] text-accent hover:underline font-medium flex items-center gap-1"
                        >
                          <span>{isExpanded ? '▼ Hide' : '▶ Show'} {item.diffs!.length} state mutation(s)</span>
                        </button>

                        {isExpanded && (
                          <div className="mt-2 text-[11px] font-mono border border-border/60 rounded bg-surface overflow-hidden">
                            <table className="w-full text-left">
                              <thead className="bg-surface2/50 text-muted-foreground">
                                <tr>
                                  <th className="py-1 px-2">Property</th>
                                  <th className="py-1 px-2">Old Value</th>
                                  <th className="py-1 px-2">New Value</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/30">
                                {item.diffs!.map((diff, i) => (
                                  <tr key={i}>
                                    <td className="py-1 px-2 font-medium text-foreground">
                                      {diff.label || diff.field}
                                    </td>
                                    <td className="py-1 px-2 text-red-400 line-through">
                                      {String(diff.before ?? 'none')}
                                    </td>
                                    <td className="py-1 px-2 text-emerald-400 font-semibold">
                                      {String(diff.after ?? 'none')}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
