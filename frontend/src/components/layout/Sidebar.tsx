import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/constants/routes';
import { showToast } from '@/stores/toast.store';
import { useNotificationStore } from '@/stores/notification.store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  GitPullRequest,
  CheckCircle,
  Bell,
  Truck,
  Warehouse,
  CreditCard,
  Receipt,
  RefreshCcw,
  Globe,
  Package,
  HeartPulse,
  Settings,
  ScrollText,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number | string;
  badgeColor?: 'blue' | 'amber' | 'red' | 'green';
  external?: boolean;
}

function SidebarNavItem({ to, icon, label, badge, badgeColor = 'blue', external }: NavItemProps) {
  const badgeClasses: Record<string, string> = {
    blue: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25',
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
    red: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25',
    green: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  };

  return (
    <NavLink
      to={to}
      target={external ? '_blank' : undefined}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all duration-150',
          'hover:bg-sidebar-accent hover:text-foreground',
          isActive
            ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-sm shadow-primary/5'
            : 'text-muted-foreground border-l-2 border-transparent'
        )
      }
    >
      <span className="flex-shrink-0 w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity">
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && (
        <span
          className={cn(
            'text-[10px] font-bold px-1.5 py-0.5 rounded-md border min-w-[18px] text-center',
            badgeClasses[badgeColor]
          )}
        >
          {badge}
        </span>
      )}
    </NavLink>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-4 pb-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.08em] select-none">
      {children}
    </div>
  );
}

export function Sidebar() {
  const { user, role, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    showToast('Signed out of workspace', 'blue');
    navigate(ROUTES.AUTH.LOGIN);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'AM';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col flex-shrink-0 h-screen bg-sidebar border-r border-sidebar-border select-none" style={{ width: 'var(--sidebar-w)' }}>
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-sm font-black text-white shadow-md shadow-primary/20">
            D
          </div>
          <div>
            <div className="text-[15px] font-bold text-foreground tracking-tight">DealFlow360</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Sales Ops Platform</div>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div className="px-3 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center text-[11px] font-bold text-primary flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold text-foreground truncate">
              {user?.name || 'Alex Morgan'}
            </div>
            <div className="text-[10px] text-muted-foreground capitalize">
              {role?.replace('_', ' ') || 'Sales Rep'}
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-2 py-1 overflow-y-auto space-y-0.5">
        <SectionLabel>Workspace</SectionLabel>
        <SidebarNavItem to={ROUTES.APP.DASHBOARD} icon={<LayoutDashboard size={16} />} label="Dashboard" />
        <SidebarNavItem to={ROUTES.APP.QUOTATIONS} icon={<FileText size={16} />} label="Quotations" badge={7} badgeColor="blue" />
        <SidebarNavItem to={ROUTES.APP.PIPELINE} icon={<GitPullRequest size={16} />} label="Pipeline" />
        <SidebarNavItem to={ROUTES.APP.APPROVALS} icon={<CheckCircle size={16} />} label="Approvals" badge={3} badgeColor="amber" />
        <SidebarNavItem
          to={ROUTES.APP.NOTIFICATIONS}
          icon={<Bell size={16} />}
          label="Notifications"
          badge={unreadCount > 0 ? unreadCount : undefined}
          badgeColor="red"
        />

        <SectionLabel>Operations</SectionLabel>
        <SidebarNavItem to={ROUTES.APP.FULFILLMENT} icon={<Truck size={16} />} label="Fulfillment" />
        <SidebarNavItem to={ROUTES.APP.WAREHOUSES} icon={<Warehouse size={16} />} label="Warehouses" />
        <SidebarNavItem to={ROUTES.APP.BILLING} icon={<CreditCard size={16} />} label="Billing" />
        <SidebarNavItem to={ROUTES.APP.INVOICES} icon={<Receipt size={16} />} label="Invoices" />
        <SidebarNavItem to={ROUTES.APP.SUBSCRIPTIONS} icon={<RefreshCcw size={16} />} label="Subscriptions" />

        <SectionLabel>Customer</SectionLabel>
        <SidebarNavItem to={ROUTES.PORTAL.QUOTE('portal_apex_1001_secure')} icon={<Globe size={16} />} label="Customer Portal" external />

        <SectionLabel>Backend</SectionLabel>
        <SidebarNavItem to={ROUTES.APP.PRODUCTS} icon={<Package size={16} />} label="Products" />
        <SidebarNavItem to={ROUTES.APP.DEAL_HEALTH} icon={<HeartPulse size={16} />} label="Deal Health" badge={2} badgeColor="red" />
        <SidebarNavItem to={ROUTES.APP.ADMIN} icon={<Settings size={16} />} label="Admin Config" />
        <SidebarNavItem to={ROUTES.APP.AUDIT_LOGS} icon={<ScrollText size={16} />} label="Audit Logs" />
      </div>

      {/* Footer */}
      <div className="px-2 py-2 border-t border-sidebar-border">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut size={16} className="opacity-70" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
