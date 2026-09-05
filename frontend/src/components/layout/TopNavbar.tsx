import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/constants/routes';
import { showToast } from '@/stores/toast.store';
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Role } from '@/types';
import {
  ArrowRightLeft,
  Check,
  Search,
  RefreshCw,
  Plus,
  Trophy,
  Command,
} from 'lucide-react';
import { useSearchStore } from '@/stores/search.store';
import { NotificationBell } from '@/components/notifications';
import { CommandPalette } from '@/components/search';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { HackathonDemoTour } from './HackathonDemoTour';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

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
    <div className="bg-card border-b border-border px-5 h-[52px] flex items-center gap-4 flex-shrink-0">
      {/* Page Title */}
      <div className="min-w-0">
        <div className="text-[15px] font-bold text-foreground tracking-tight truncate">
          {currentMeta.title}
        </div>
        <div className="text-[11px] text-muted-foreground truncate">
          {currentMeta.sub}
        </div>
      </div>

      {/* Right Actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Role Switcher */}
        <DropdownMenu
          trigger={
            <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-border/50 transition-colors">
              <ArrowRightLeft className="h-3 w-3 text-primary" />
              <span>
                Role: <strong className="text-primary">{role?.replace('_', ' ')}</strong>
              </span>
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
                <p className="font-semibold text-xs text-foreground">{r.label}</p>
                <p className="text-[10px] text-muted-foreground">{r.desc}</p>
              </div>
              {role === r.role && <Check className="h-3.5 w-3.5 text-primary ml-2 flex-shrink-0" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenu>

        {/* Search / Command Palette */}
        <button
          type="button"
          onClick={() => openCommandPalette()}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px]',
            'text-muted-foreground hover:text-foreground',
            'border border-border/50 bg-muted/30 hover:bg-accent/30',
            'transition-colors cursor-pointer'
          )}
          title="Open Global Search & Command Palette (Ctrl+K)"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Search records...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border border-border/60 text-muted-foreground">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Demo Tour */}
        <button
          type="button"
          onClick={() => setIsTourOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all active:scale-95"
          title="Open interactive 14-stage Hackathon Demo Tour Guide"
        >
          <Trophy className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Demo Tour</span>
        </button>

        {/* Reload */}
        <button
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          onClick={handleReload}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Reload</span>
        </button>

        {/* New Quote */}
        <button
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all active:scale-95"
          onClick={handleNewQuote}
        >
          <Plus className="h-3.5 w-3.5" />
          New Quote
        </button>

        {/* Command Palette Dialog */}
        <CommandPalette />

        {/* Hackathon Demo Tour Modal */}
        <HackathonDemoTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
      </div>
    </div>
  );
}
