import React, { useState, useMemo } from 'react';
import { useNotificationStore } from '@/stores/notification.store';
import {
  NotificationItem,
  NotificationFilters,
  NotificationPreferencesForm,
} from '@/components/notifications';
import { NotificationFilterOptions, NotificationItem as NotificationType } from '@/types';

export function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    triggerSimulatedEvent,
  } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<'ALERTS' | 'PREFERENCES'>('ALERTS');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [filters, setFilters] = useState<NotificationFilterOptions>({});

  // Filter calculations
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // 1. Category Tab Filter
      if (activeCategory === 'UNREAD' && item.isRead) return false;
      if (activeCategory === 'APPROVALS' && !item.type.includes('APPROVAL')) return false;
      if (activeCategory === 'RISK' && !item.type.includes('RISK') && !item.type.includes('STALLED')) return false;
      if (activeCategory === 'FINANCE' && !item.type.includes('INVOICE') && !item.type.includes('PAYMENT')) return false;
      if (activeCategory === 'PORTAL' && !item.type.includes('NEGOTIATION') && !item.type.includes('QUOTE_ACCEPTED')) return false;
      if (activeCategory === 'FULFILLMENT' && !item.type.includes('SHIPMENT') && !item.type.includes('FULFILLMENT')) return false;

      // 2. Priority Filter
      if (filters.priority && item.priority !== filters.priority) return false;

      // 3. Search Query
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesMsg = item.message.toLowerCase().includes(q);
        const matchesActor = item.actorName?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMsg && !matchesActor) return false;
      }

      return true;
    });
  }, [notifications, activeCategory, filters]);

  const handleSimulateDemoAlert = async () => {
    const demoScenarios = [
      {
        type: 'APPROVAL_REQUIRED' as const,
        priority: 'HIGH' as const,
        title: 'Executive Sign-off Required',
        message: 'Quotation Q-1049 requested a 26% margin override requiring Finance VP approval.',
        route: '/app/approvals',
        actorName: 'Marcus Vance',
        actorRole: 'Sales Rep',
      },
      {
        type: 'DEAL_STALLED' as const,
        priority: 'HIGH' as const,
        title: 'Opportunity Inactivity Alert',
        message: 'Enterprise Deal "HyperScale ERP Rollout" stalled for 18 days in Negotiation stage.',
        route: '/app/deal-health',
        actorName: 'AI Health Monitor',
        actorRole: 'System Engine',
      },
      {
        type: 'NEGOTIATION_UPDATED' as const,
        priority: 'MEDIUM' as const,
        title: 'Customer Countered Quote Terms',
        message: 'BioHealth Corp submitted counter-proposal requesting 10% milestone prepayment.',
        route: '/app/portal/quote/demo-token-1/negotiate',
        actorName: 'Dr. Evelyn Reed',
        actorRole: 'Customer',
      },
      {
        type: 'SHIPMENT_UPDATED' as const,
        priority: 'LOW' as const,
        title: 'Shipment Dispatched from Depot',
        message: 'Carrier FedEx tracking #FX-9920141 is in transit for NovaTech Supplies.',
        route: '/app/fulfillment',
        actorName: 'Logistics Dispatch',
        actorRole: 'Warehouse Ops',
      },
    ];

    const random = demoScenarios[Math.floor(Math.random() * demoScenarios.length)];
    await triggerSimulatedEvent(random);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Notification & Alert Center
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-accent text-accent-foreground shadow-sm">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time notifications, approval routing dispatches, deal risk signals, and alert preferences
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSimulateDemoAlert}
            className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5"
            title="Simulate incoming business notification (for hackathon demo)"
          >
            <span>⚡</span>
            <span>Simulate Incoming Alert</span>
          </button>

          {unreadCount > 0 && activeTab === 'ALERTS' && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="btn btn-ghost btn-sm text-xs text-accent hover:underline"
            >
              Mark all as read
            </button>
          )}

          {/* Tab Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-surface2 border border-border/60">
            <button
              type="button"
              onClick={() => setActiveTab('ALERTS')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'ALERTS'
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Alert Feed
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PREFERENCES')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'PREFERENCES'
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Channels & Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      {activeTab === 'PREFERENCES' ? (
        <div className="max-w-3xl">
          <NotificationPreferencesForm />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filters Bar */}
          <NotificationFilters
            filters={filters}
            onChange={setFilters}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            totalCount={notifications.length}
            unreadCount={unreadCount}
          />

          {/* Notifications Feed */}
          {filteredNotifications.length === 0 ? (
            <div className="border border-border/70 rounded-xl p-12 bg-surface text-center space-y-2">
              <span className="text-3xl block">🎉</span>
              <h3 className="text-sm font-semibold text-foreground">No Notifications Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                There are no notifications matching your current category or search criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredNotifications.map((item) => (
                <NotificationItem
                  key={item.id}
                  item={item}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
