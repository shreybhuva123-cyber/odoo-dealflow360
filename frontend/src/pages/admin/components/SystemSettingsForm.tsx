import React, { useState, useEffect } from 'react';
import { SystemSettings } from '@/types';
import { showToast } from '@/stores/toast.store';

interface SystemSettingsFormProps {
  settings?: SystemSettings;
  onSave: (settings: Partial<SystemSettings>) => void;
  isLoading?: boolean;
}

export function SystemSettingsForm({
  settings,
  onSave,
  isLoading,
}: SystemSettingsFormProps) {
  const [formData, setFormData] = useState<SystemSettings | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  if (isLoading || !formData) {
    return (
      <div className="card p-8 text-center text-muted-foreground text-sm">
        Loading system configuration...
      </div>
    );
  }

  const handleGeneralChange = (field: string, val: any) => {
    setFormData({
      ...formData,
      general: { ...formData.general, [field]: val },
    });
  };

  const handlePricingChange = (field: string, val: any) => {
    setFormData({
      ...formData,
      pricingAndApprovals: { ...formData.pricingAndApprovals, [field]: val },
    });
  };

  const handleNotificationChange = (field: string, val: any) => {
    setFormData({
      ...formData,
      notifications: { ...formData.notifications, [field]: val },
    });
  };

  const handleSecurityChange = (field: string, val: any) => {
    setFormData({
      ...formData,
      security: { ...formData.security, [field]: val },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    showToast('Global settings saved successfully', 'green');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. General Organization */}
      <div className="card p-5">
        <div className="card-header px-0 pt-0">
          <div className="card-title">1. Organization & Financial Baseline</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Core legal entity, default currency formatting, and standard tax rate
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="field-group">
            <label className="field-label">Company Legal Name</label>
            <input
              type="text"
              className="field-input text-sm"
              value={formData.general.companyName}
              onChange={(e) => handleGeneralChange('companyName', e.target.value)}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Operations Email</label>
            <input
              type="email"
              className="field-input text-sm font-mono"
              value={formData.general.companyEmail}
              onChange={(e) => handleGeneralChange('companyEmail', e.target.value)}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Base Operating Currency</label>
            <input
              type="text"
              className="field-input text-sm"
              value={formData.general.baseCurrency}
              onChange={(e) => handleGeneralChange('baseCurrency', e.target.value)}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Default Tax Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="field-input text-sm"
              value={formData.general.defaultTaxRatePct}
              onChange={(e) =>
                handleGeneralChange('defaultTaxRatePct', parseFloat(e.target.value) || 0)
              }
            />
          </div>
        </div>
      </div>

      {/* 2. Pricing & Approval Guardrails */}
      <div className="card p-5">
        <div className="card-header px-0 pt-0">
          <div className="card-title">2. Pricing Governance & Approval Automation</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automated threshold routing, hard floor enforcements, and SLA timeouts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="field-group">
            <label className="field-label">Maximum System Discount Ceiling (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="field-input text-sm font-semibold"
              value={formData.pricingAndApprovals.maxAllowedDiscountCeiling}
              onChange={(e) =>
                handlePricingChange('maxAllowedDiscountCeiling', parseFloat(e.target.value) || 0)
              }
            />
            <span className="text-[11px] text-muted-foreground mt-1">
              Hard block against rep or manager inputs exceeding this number.
            </span>
          </div>

          <div className="field-group">
            <label className="field-label">Auto-Approval Timeout (Hours)</label>
            <input
              type="number"
              min="1"
              max="168"
              className="field-input text-sm font-mono"
              value={formData.pricingAndApprovals.autoApprovalTimeoutHours}
              onChange={(e) =>
                handlePricingChange('autoApprovalTimeoutHours', parseInt(e.target.value) || 24)
              }
            />
            <span className="text-[11px] text-muted-foreground mt-1">
              Escalate to Secondary Reviewer if approval queue is pending past SLA.
            </span>
          </div>

          <div className="field-group">
            <label className="field-label">Multi-Level Approval Threshold ($)</label>
            <input
              type="number"
              min="0"
              step="1000"
              className="field-input text-sm font-mono"
              value={formData.pricingAndApprovals.requireMultiLevelAboveValue}
              onChange={(e) =>
                handlePricingChange('requireMultiLevelAboveValue', parseFloat(e.target.value) || 0)
              }
            />
            <span className="text-[11px] text-muted-foreground mt-1">
              Deals exceeding this valuation require dual Manager + Finance signoff.
            </span>
          </div>

          <div className="flex flex-col justify-center space-y-3 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={formData.pricingAndApprovals.strictFloorEnforcement}
                onChange={(e) =>
                  handlePricingChange('strictFloorEnforcement', e.target.checked)
                }
                className="rounded"
              />
              <span>Strict Gross Margin Floor Enforcement (Disallow Negative Margin Quotes)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={formData.pricingAndApprovals.requireFinanceForHighRisk}
                onChange={(e) =>
                  handlePricingChange('requireFinanceForHighRisk', e.target.checked)
                }
                className="rounded"
              />
              <span>Mandatory Finance Director routing on High-Risk quotes</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Notifications & Integrations */}
      <div className="card p-5">
        <div className="card-header px-0 pt-0">
          <div className="card-title">3. Notifications & Webhook Dispatches</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure system alerts and enterprise collaboration channels
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="field-group">
            <label className="field-label">Slack Webhook URL</label>
            <input
              type="text"
              className="field-input text-xs font-mono"
              value={formData.notifications.slackWebhookUrl || ''}
              onChange={(e) => handleNotificationChange('slackWebhookUrl', e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
            />
          </div>

          <div className="field-group">
            <label className="field-label">Executive Digest Cadence</label>
            <select
              className="field-input text-sm"
              value={formData.notifications.digestFrequency}
              onChange={(e) => handleNotificationChange('digestFrequency', e.target.value)}
            >
              <option value="REALTIME">Real-time alerts</option>
              <option value="DAILY">Daily summary digest</option>
              <option value="WEEKLY">Weekly executive report</option>
            </select>
          </div>

          <div className="flex items-center gap-4 md:col-span-2">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifications.emailAlertsEnabled}
                onChange={(e) =>
                  handleNotificationChange('emailAlertsEnabled', e.target.checked)
                }
                className="rounded"
              />
              <span>Send Transactional Emails for Approvals & Invoices</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifications.inAppToastEnabled}
                onChange={(e) =>
                  handleNotificationChange('inAppToastEnabled', e.target.checked)
                }
                className="rounded"
              />
              <span>In-App Real-time Push Banners</span>
            </label>
          </div>
        </div>
      </div>

      {/* 4. Security & Compliance */}
      <div className="card p-5">
        <div className="card-header px-0 pt-0">
          <div className="card-title">4. Security, Sessions & Audit Retention</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Session expiration, multi-factor authentication, and immutable audit trails
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div className="field-group">
            <label className="field-label">Idle Session Timeout (Minutes)</label>
            <input
              type="number"
              min="15"
              max="720"
              className="field-input text-sm font-mono"
              value={formData.security.sessionTimeoutMinutes}
              onChange={(e) =>
                handleSecurityChange('sessionTimeoutMinutes', parseInt(e.target.value) || 60)
              }
            />
          </div>

          <div className="field-group">
            <label className="field-label">Audit Log Retention (Days)</label>
            <input
              type="number"
              min="30"
              max="2555"
              className="field-input text-sm font-mono"
              value={formData.security.auditLogRetentionDays}
              onChange={(e) =>
                handleSecurityChange('auditLogRetentionDays', parseInt(e.target.value) || 365)
              }
            />
          </div>

          <div className="flex flex-col justify-center space-y-2 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={formData.security.mfaEnforced}
                onChange={(e) => handleSecurityChange('mfaEnforced', e.target.checked)}
                className="rounded"
              />
              <span>Enforce MFA for Manager & Admin roles</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={formData.security.ipAllowlistEnabled}
                onChange={(e) =>
                  handleSecurityChange('ipAllowlistEnabled', e.target.checked)
                }
                className="rounded"
              />
              <span>Restrict access to Corporate VPN IP range</span>
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            if (settings) setFormData(settings);
            showToast('Changes discarded', 'amber');
          }}
        >
          Reset to Defaults
        </button>
        <button type="submit" className="btn btn-primary">
          Save System Configuration
        </button>
      </div>
    </form>
  );
}
