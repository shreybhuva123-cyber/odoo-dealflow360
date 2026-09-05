import React, { useState, useEffect } from 'react';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/hooks/useNotifications';
import { NotificationPreferences } from '@/types';
import { cn } from '@/lib/utils';

interface NotificationPreferencesFormProps {
  onSaved?: () => void;
}

export function NotificationPreferencesForm({ onSaved }: NotificationPreferencesFormProps) {
  const { data: prefs, isLoading } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();

  const [formData, setFormData] = useState<NotificationPreferences | null>(null);

  useEffect(() => {
    if (prefs) {
      setFormData(prefs);
    }
  }, [prefs]);

  if (isLoading || !formData) {
    return (
      <div className="py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  const handleToggle = (
    channel: 'email' | 'inApp',
    key: keyof NotificationPreferences['email']
  ) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [channel]: {
          ...prev[channel],
          [key]: !prev[channel][key],
        },
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    await updateMutation.mutateAsync(formData);
    onSaved?.();
  };

  const alertRows: { key: keyof NotificationPreferences['email']; label: string; desc: string }[] = [
    {
      key: 'approvalRequired',
      label: 'Approval Requested',
      desc: 'When a quotation or deal requires your review or sign-off.',
    },
    {
      key: 'quoteApproved',
      label: 'Quotation Approved',
      desc: 'When a quotation you submitted is approved by manager or finance.',
    },
    {
      key: 'quoteRejected',
      label: 'Quotation Rejected / Returned',
      desc: 'When a quote is rejected or sent back for revisions.',
    },
    {
      key: 'dealRiskIncreased',
      label: 'Deal Risk Spike',
      desc: 'When AI/Risk engine detects margin erosion or probability drops.',
    },
    {
      key: 'dealStalled',
      label: 'Stalled Deal Alert',
      desc: 'When an active pipeline opportunity exceeds threshold inactivity.',
    },
    {
      key: 'customerNegotiation',
      label: 'Customer Negotiation & Changes',
      desc: 'When a customer requests terms counter-offers in the customer portal.',
    },
    {
      key: 'invoiceOverdue',
      label: 'Overdue Invoices',
      desc: 'When payment past due alerts trigger for customer accounts.',
    },
    {
      key: 'paymentReceived',
      label: 'Payment Received',
      desc: 'When full or milestone payments are settled successfully.',
    },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="border border-border/80 rounded-xl overflow-hidden bg-surface">
        <div className="p-4 border-b border-border/60 bg-surface2/30 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Alert Channel Routing</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select which notifications you receive via Email versus In-App notification center.
            </p>
          </div>
        </div>

        <div className="divide-y divide-border/40">
          <div className="grid grid-cols-12 px-4 py-2.5 bg-surface2/20 text-xs font-semibold text-muted-foreground">
            <div className="col-span-8">Notification Event</div>
            <div className="col-span-2 text-center">In-App</div>
            <div className="col-span-2 text-center">Email</div>
          </div>

          {alertRows.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-12 px-4 py-3.5 items-center hover:bg-surface2/10 transition-colors"
            >
              <div className="col-span-8 pr-4">
                <div className="text-xs font-semibold text-foreground">{row.label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{row.desc}</div>
              </div>

              <div className="col-span-2 flex justify-center">
                <input
                  type="checkbox"
                  checked={formData.inApp[row.key]}
                  onChange={() => handleToggle('inApp', row.key)}
                  className="checkbox checkbox-xs rounded border-border/80 text-accent focus:ring-accent"
                />
              </div>

              <div className="col-span-2 flex justify-center">
                <input
                  type="checkbox"
                  checked={formData.email[row.key]}
                  onChange={() => handleToggle('email', row.key)}
                  className="checkbox checkbox-xs rounded border-border/80 text-accent focus:ring-accent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Digest Frequency */}
      <div className="border border-border/80 rounded-xl p-4 bg-surface space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Email Digest Frequency</h3>
        <p className="text-xs text-muted-foreground">
          Batch low-priority alerts or receive instant dispatches as business events occur.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {[
            { id: 'REALTIME', label: 'Instant (Real-time)', desc: 'Immediate dispatch upon event' },
            { id: 'DAILY', label: 'Daily Digest', desc: 'Summary email every morning at 8:00 AM' },
            { id: 'WEEKLY', label: 'Weekly Summary', desc: 'Weekly pipeline and alert wrapup' },
          ].map((mode) => (
            <label
              key={mode.id}
              className={cn(
                'p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between shadow-sm',
                formData.digestFrequency === mode.id
                  ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                  : 'border-border bg-surface hover:bg-surface2/60'
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-foreground">{mode.label}</span>
                <input
                  type="radio"
                  name="digestFrequency"
                  value={mode.id}
                  checked={formData.digestFrequency === mode.id}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      digestFrequency: mode.id as any,
                    })
                  }
                  className="w-4 h-4 text-primary accent-primary cursor-pointer"
                />
              </div>
              <span className="text-[11px] text-muted-foreground">{mode.desc}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="btn btn-primary text-xs px-5 py-2 font-medium"
        >
          {updateMutation.isPending ? 'Saving Preferences...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  );
}
