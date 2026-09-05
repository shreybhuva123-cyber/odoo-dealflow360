import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/constants/routes';
import { showToast } from '@/stores/toast.store';
import { useNotificationStore } from '@/stores/notification.store';

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
    <div
      style={{
        width: 'var(--sidebar-w)',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100vh',
        userSelect: 'none',
      }}
    >
      {/* Sidebar Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              background: 'var(--accent)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px',
              color: '#fff',
            }}
          >
            D
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)', letterSpacing: '-0.3px' }}>
              DealFlow360
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
              Sales Ops Platform
            </div>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--accent-dim)',
              border: '2px solid var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--accent)',
              flexShrink: 0,
            }}
          >
            {getInitials(user?.name)}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: '12px',
                color: 'var(--text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name || 'Alex Morgan'}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {role?.replace('_', ' ') || 'Sales Rep'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {/* Workspace */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              padding: '0 8px',
              marginBottom: '4px',
            }}
          >
            Workspace
          </div>
          <NavLink
            to={ROUTES.APP.DASHBOARD}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span> Dashboard
          </NavLink>
          <NavLink
            to={ROUTES.APP.QUOTATIONS}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📋</span> Quotations <span className="nav-badge blue">7</span>
          </NavLink>
          <NavLink
            to={ROUTES.APP.PIPELINE}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🔀</span> Pipeline
          </NavLink>
          <NavLink
            to={ROUTES.APP.APPROVALS}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">✅</span> Approvals <span className="nav-badge">3</span>
          </NavLink>
          <NavLink
            to={ROUTES.APP.NOTIFICATIONS}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🔔</span> Notifications
            {unreadCount > 0 && <span className="nav-badge red">{unreadCount}</span>}
          </NavLink>
        </div>

        {/* Operations */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              padding: '0 8px',
              marginBottom: '4px',
            }}
          >
            Operations
          </div>
          <NavLink
            to={ROUTES.APP.FULFILLMENT}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🚚</span> Fulfillment
          </NavLink>
          <NavLink
            to={ROUTES.APP.WAREHOUSES}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🏭</span> Warehouses
          </NavLink>
          <NavLink
            to={ROUTES.APP.BILLING}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">💳</span> Billing
          </NavLink>
          <NavLink
            to={ROUTES.APP.INVOICES}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🧾</span> Invoices
          </NavLink>
          <NavLink
            to={ROUTES.APP.SUBSCRIPTIONS}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🔁</span> Subscriptions
          </NavLink>
        </div>

        {/* Customer */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              padding: '0 8px',
              marginBottom: '4px',
            }}
          >
            Customer
          </div>
          <NavLink
            to={ROUTES.PORTAL.QUOTE('portal_apex_1001_secure')}
            target="_blank"
            className="nav-item"
          >
            <span className="nav-icon">🌐</span> Customer Portal
          </NavLink>
        </div>

        {/* Backend */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              padding: '0 8px',
              marginBottom: '4px',
            }}
          >
            Backend
          </div>
          <NavLink
            to={ROUTES.APP.PRODUCTS}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📦</span> Products
          </NavLink>
          <NavLink
            to={ROUTES.APP.DEAL_HEALTH}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">❤️</span> Deal Health <span className="nav-badge red">2</span>
          </NavLink>
          <NavLink
            to={ROUTES.APP.ADMIN}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">⚙️</span> Admin Config
          </NavLink>
          <NavLink
            to={ROUTES.APP.AUDIT_LOGS}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📜</span> Audit Logs
          </NavLink>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <div className="nav-item" onClick={handleSignOut}>
          <span className="nav-icon">🚪</span> Sign Out
        </div>
      </div>
    </div>
  );
}
