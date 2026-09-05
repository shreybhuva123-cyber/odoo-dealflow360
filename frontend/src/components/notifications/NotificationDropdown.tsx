import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@/stores/notification.store';
import { NotificationItem } from './NotificationItem';
import { ROUTES } from '@/constants/routes';

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    triggerSimulatedEvent,
  } = useNotificationStore();

  const recentNotifications = notifications.slice(0, 5);

  const handleViewAll = () => {
    onClose();
    navigate(ROUTES.APP.NOTIFICATIONS || '/app/notifications');
  };

  const handleSimulateAlert = async () => {
    const demoEvents = [
      {
        type: 'APPROVAL_REQUIRED' as const,
        priority: 'HIGH' as const,
        title: 'New High Discount Approval Needed',
        message: 'Deal "Enterprise Cloud Upgrade" requires Manager signoff for 28% discount.',
        route: '/app/approvals',
        actorName: 'Alex Rivera',
        actorRole: 'Sales Rep',
      },
      {
        type: 'DEAL_RISK_INCREASED' as const,
        priority: 'HIGH' as const,
        title: 'Deal Health Alert: High Risk Spike',
        message: 'Deal "Apex Global Expansion" risk score surged to 78 due to 21-day inactivity.',
        route: '/app/deal-health',
        actorName: 'Risk Engine',
        actorRole: 'System',
      },
      {
        type: 'PAYMENT_RECEIVED' as const,
        priority: 'LOW' as const,
        title: 'Payment Confirmed: $45,000.00',
        message: 'Acme Corp paid invoice INV-2026-004 via ACH.',
        route: '/app/invoices',
        actorName: 'Stripe Gateway',
        actorRole: 'System',
      },
      {
        type: 'NEGOTIATION_REQUESTED' as const,
        priority: 'MEDIUM' as const,
        title: 'Customer Requested Terms Change',
        message: 'Starlight Retail requested Net 45 payment terms on quotation QT-2026-003.',
        route: '/app/portal/quote/demo-token-1/negotiate',
        actorName: 'David Zhang',
        actorRole: 'Customer',
      },
    ];

    const randomEvent = demoEvents[Math.floor(Math.random() * demoEvents.length)];
    await triggerSimulatedEvent(randomEvent);
  };

  return (
    <div
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-border/80 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[520px] animate-in fade-in slide-in-from-top-2 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-3.5 border-b border-border/60 flex items-center justify-between bg-surface2/40">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">Notifications</span>
          {unreadCount > 0 ? (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-accent text-accent-foreground">
              {unreadCount} unread
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-surface3 text-muted-foreground">
              All caught up
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="text-[11px] text-accent hover:underline font-medium px-1.5 py-0.5"
            >
              Mark all read
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xs p-1 rounded"
          >
            ✕
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto p-2.5 space-y-2 flex-1 divide-y divide-border/20">
        {recentNotifications.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground space-y-1.5">
            <span className="text-2xl block">🎉</span>
            <p className="text-xs font-medium text-foreground">No notifications</p>
            <p className="text-[11px]">You're all caught up with your deals and tasks.</p>
          </div>
        ) : (
          recentNotifications.map((item) => (
            <NotificationItem
              key={item.id}
              item={item}
              compact
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-border/60 bg-surface2/30 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleSimulateAlert}
          title="Simulate incoming real-time business notification for evaluation demo"
          className="text-[11px] text-muted-foreground hover:text-accent flex items-center gap-1 transition-colors"
        >
          <span>⚡</span>
          <span>Simulate Event</span>
        </button>

        <button
          type="button"
          onClick={handleViewAll}
          className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
        >
          <span>View All ({notifications.length})</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
