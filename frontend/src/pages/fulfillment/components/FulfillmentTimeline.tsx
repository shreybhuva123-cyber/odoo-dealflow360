import React, { useState } from 'react';
import { FulfillmentActivity } from '@/types';
import { showToast } from '@/stores/toast.store';

interface FulfillmentTimelineProps {
  activities?: FulfillmentActivity[];
  onAddNote?: (note: string) => void;
  className?: string;
}

export function FulfillmentTimeline({
  activities = [],
  onAddNote,
  className = '',
}: FulfillmentTimelineProps) {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  const handleSave = () => {
    if (!noteText.trim()) return;
    onAddNote?.(noteText.trim());
    setNoteText('');
    setIsNoteOpen(false);
    showToast('Internal operations note logged', 'green');
  };

  return (
    <div
      className={`card p-4 ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Fulfillment Audit Log
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Immutable chain of custody and dispatch events
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsNoteOpen(!isNoteOpen)}
          className="btn btn-ghost btn-xs text-xs"
        >
          {isNoteOpen ? 'Cancel' : '+ Add Note'}
        </button>
      </div>

      {isNoteOpen && (
        <div
          className="p-3 rounded mb-4"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Log warehouse packing note, delivery instruction, or exception..."
            className="input w-full text-xs p-2 rounded mb-2 min-h-[60px]"
            style={{ background: 'var(--surface)' }}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNoteOpen(false)}
              className="btn btn-ghost btn-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!noteText.trim()}
              className="btn btn-primary btn-xs"
            >
              Log Entry
            </button>
          </div>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground">
          No dispatch activities recorded yet.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)]">
          {activities.map((act) => (
            <div key={act.id} className="relative text-xs">
              {/* Dot */}
              <div
                className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full"
                style={{
                  background: 'var(--accent)',
                  border: '2px solid var(--surface)',
                  boxShadow: '0 0 0 1px var(--accent)',
                }}
              />

              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-foreground">{act.action}</span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono">
                  {act.timestamp}
                </span>
              </div>

              <div className="text-[11px] text-muted-foreground mt-0.5">
                Logged by <span className="text-foreground font-medium">{act.user}</span>
              </div>

              {act.note && (
                <div
                  className="mt-1.5 p-2 rounded text-[11px] text-foreground italic"
                  style={{ background: 'var(--surface2)', borderLeft: '2px solid var(--accent)' }}
                >
                  "{act.note}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
