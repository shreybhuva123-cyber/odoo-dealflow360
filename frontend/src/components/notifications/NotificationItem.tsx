import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationItem as NotificationType } from '@/types';
import { formatRelativeTime } from '@/utils/date';

interface NotificationItemProps {
  item: NotificationType;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export function NotificationItem({
  item,
  onMarkAsRead,
  onDelete,
  compact = false,
}: NotificationItemProps) {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (item.type) {
      case 'APPROVAL_REQUIRED':
      case 'APPROVAL_COMPLETED':
        return '⏳';
      case 'DEAL_RISK_INCREASED':
      case 'DEAL_STALLED':
        return '🔴';
      case 'NEGOTIATION_REQUESTED':
      case 'NEGOTIATION_UPDATED':
        return '💬';
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_OVERDUE':
      case 'INVOICE_CREATED':
        return '🧾';
      case 'QUOTE_ACCEPTED':
        return '🟢';
      case 'QUOTE_REJECTED':
      case 'QUOTE_RETURNED':
        return '❌';
      case 'SHIPMENT_UPDATED':
      case 'FULFILLMENT_UPDATED':
        return '🚚';
      default:
        return '🔔';
    }
  };

  const getPriorityBorder = () => {
    if (item.priority === 'HIGH') return 'border-l-4 border-l-red-500';
    if (item.priority === 'MEDIUM') return 'border-l-4 border-l-amber-500';
    return 'border-l-4 border-l-accent/40';
  };

  const handleClick = () => {
    if (!item.isRead && onMarkAsRead) {
      onMarkAsRead(item.id);
    }
    if (item.route) {
      navigate(item.route);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 rounded-md transition-all cursor-pointer border border-border/60 ${getPriorityBorder()} ${
        !item.isRead ? 'bg-accent/5 hover:bg-accent/10' : 'bg-surface hover:bg-surface2/50'
      } ${compact ? 'text-xs' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <span className="text-base shrink-0 mt-0.5">{getIcon()}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-semibold ${
                  !item.isRead ? 'text-foreground' : 'text-muted-foreground'
                } truncate`}
              >
                {item.title}
              </span>
              {!item.isRead && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
              )}
            </div>

            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
              {item.message}
            </p>

            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
              <span className="font-mono">{formatRelativeTime(item.createdAt)}</span>
              {item.actorName && (
                <>
                  <span>•</span>
                  <span>{item.actorName}</span>
                </>
              )}
              {item.route && (
                <>
                  <span>•</span>
                  <span className="text-accent hover:underline font-medium">Open Record →</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {!item.isRead && onMarkAsRead && (
            <button
              type="button"
              className="btn btn-ghost btn-xs text-[10px] text-muted-foreground hover:text-foreground"
              onClick={() => onMarkAsRead(item.id)}
              title="Mark as read"
            >
              ✓
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="btn btn-ghost btn-xs text-[10px] text-muted-foreground hover:text-red-400"
              onClick={() => onDelete(item.id)}
              title="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
