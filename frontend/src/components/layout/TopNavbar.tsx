import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/constants/routes';
import { showToast } from '@/stores/toast.store';
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Role } from '@/types';
import { ArrowRightLeft, Check } from 'lucide-react';
import { useSearchStore } from '@/stores/search.store';
import { NotificationBell } from '@/components/notifications';
import { CommandPalette } from '@/components/search';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { HackathonDemoTour } from './HackathonDemoTour';

export function TopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, switchRole } = useAuthStore();
  const { openCommandPalette } = useSearchStore();
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Register global keyboard shortcuts across all app pages
  useKeyboardShortcuts();

  const titleMap: Record<string, { title: string; sub: string }> = {
    '/app/dashboard': { title: 'Dashboard', sub: 'Overview of your sales activity' },
    '/app/quotations': { title: 'Quotations', sub: 'All active and draft quotations' },
    '/app/quotations/new': { title: 'Quote Builder', sub: 'Building Q-1042 · Acme Corp' },
    '/app/pipeline': { title: 'Pipeline', sub: 'Kanban deal pipeline' },
    '/app/approvals': { title: 'Approvals', sub: 'Quotes pending your review' },
    '/app/fulfillment': { title: 'Fulfillment', sub: 'Warehouse split & shipping' },
    '/app/billing': { title: 'Billing & Subscriptions', sub: 'Subscription & one-time billing' },
    '/app/invoices': { title: 'Invoices', sub: 'Issued invoices & payment status' },
    '/app/products': { title: 'Product Catalog', sub: 'Products, pricing & variants' },
    '/app/deal-health': { title: 'Deal Health & Anomalies', sub: 'Stalled deals & anomaly alerts' },
    '/app/reports': { title: 'Reports & Analytics', sub: 'Revenue conversion & performance metrics' },
    '/app/admin': { title: 'Admin Configuration', sub: 'Backend settings & reporting' },
    '/app/notifications': { title: 'Notification Center', sub: 'Real-time alerts, approvals, and dispatch preferences' },
    '/app/audit-logs': { title: 'Compliance & Audit Trail', sub: 'Immutable system change ledger & diff inspection' },
  };

  const currentMeta =
    titleMap[location.pathname] ||
    (location.pathname.includes('/quotations/')
      ? { title: 'Quote Builder', sub: 'Building Q-1042 · Acme Corp' }
      : { title: 'DealFlow360', sub: 'Sales Operations Platform' });

  const handleReload = () => {
    showToast('Data refreshed', 'blue');
  };

  const handleNewQuote = () => {
    navigate(ROUTES.APP.QUOTATION_NEW);
  };

  const availableRoles: { role: Role; label: string; desc: string }[] = [
    { role: 'SALES_REP', label: 'Sales Rep (Alex Morgan)', desc: 'Build & manage quotes' },
    { role: 'SALES_MANAGER', label: 'Sales Manager (Maria Chen)', desc: 'Approve & monitor deals' },
    { role: 'FINANCE', label: 'Finance (David Park)', desc: 'High-risk approvals & billing' },
    { role: 'ADMIN', label: 'Admin User', desc: 'Configure backend & reports' },
  ];

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexShrink: 0,
      }}
    >
      <div>
        <div className="topbar-title" style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>
          {currentMeta.title}
        </div>
        <div className="topbar-sub" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {currentMeta.sub}
        </div>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Quick Persona Switcher for Hackathon Testing */}
        <DropdownMenu
          trigger={
            <button className="btn btn-ghost btn-xs" style={{ gap: '4px' }}>
              <ArrowRightLeft className="h-3 w-3 text-blue-400" />
              <span>Role: <strong style={{ color: 'var(--accent)' }}>{role?.replace('_', ' ')}</strong></span>
            </button>
          }
        >
          <DropdownMenuLabel>Switch Persona (Demo)</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableRoles.map((r) => (
            <DropdownMenuItem
              key={r.role}
              onClick={() => {
                switchRole(r.role);
                showToast(`Switched to ${r.label}`, 'green');
              }}
              className="flex items-start justify-between py-2"
            >
              <div>
                <p className="font-semibold text-xs" style={{ color: 'var(--text)' }}>{r.label}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.desc}</p>
              </div>
              {role === r.role && <Check className="h-3.5 w-3.5 text-blue-400 ml-2" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenu>

        {/* Global Search / Command Palette Trigger */}
        <button
          type="button"
          onClick={() => openCommandPalette()}
          className="btn btn-ghost btn-sm text-xs text-muted-foreground hover:text-foreground flex items-center gap-2 border border-border/70 bg-surface2/30 px-2.5 py-1 rounded-lg"
          title="Open Global Search & Command Palette (Ctrl+K)"
        >
          <span>🔍</span>
          <span className="hidden md:inline text-[11px]">Search records...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-surface3 text-[10px] font-mono border border-border/80 text-muted-foreground">
            Ctrl+K
          </kbd>
        </button>

        {/* Notification Bell with unread counter & dropdown */}
        <NotificationBell />

        {/* Hackathon Golden Path Demo Tour Trigger */}
        <button
          type="button"
          onClick={() => setIsTourOpen(true)}
          className="btn btn-sm text-xs font-bold bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-1.5 shadow-sm"
          title="Open interactive 14-stage Hackathon Demo Tour Guide"
        >
          <span>🏆</span>
          <span className="hidden sm:inline">Demo Tour</span>
        </button>

        <button className="btn btn-ghost btn-sm" onClick={handleReload}>
          ↻ Reload
        </button>
        <button className="btn btn-primary btn-sm" onClick={handleNewQuote}>
          + New Quote
        </button>

        {/* Global Command Palette Dialog */}
        <CommandPalette />

        {/* Interactive Hackathon Demo Tour Modal */}
        <HackathonDemoTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
      </div>
    </div>
  );
}
