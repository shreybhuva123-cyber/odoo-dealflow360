import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/services/api/auth.api';
import { ROUTES } from '@/constants/routes';
import { showToast } from '@/stores/toast.store';
import { Role } from '@/types';
import { DEMO_USERS } from '@/constants/roles';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState<Role>('SALES_REP');
  const [email, setEmail] = useState('alex.morgan@dealflow360.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = location.state?.from?.pathname || ROUTES.APP.DASHBOARD;

  const roleConfigs: { role: Role; icon: string; name: string; desc: string; defaultEmail: string }[] = [
    { role: 'SALES_REP', icon: '🧑‍💼', name: 'Sales Rep', desc: 'Build & manage quotes', defaultEmail: 'alex.morgan@dealflow360.com' },
    { role: 'SALES_MANAGER', icon: '👔', name: 'Sales Manager', desc: 'Approve & monitor deals', defaultEmail: 'maria.chen@dealflow360.com' },
    { role: 'FINANCE', icon: '💼', name: 'Finance', desc: 'High-risk approvals & billing', defaultEmail: 'david.park@dealflow360.com' },
    { role: 'ADMIN', icon: '⚙️', name: 'Admin', desc: 'Configure backend & reports', defaultEmail: 'admin@dealflow360.com' },
  ];

  const handleSelectRole = (r: Role, defaultMail: string) => {
    setSelectedRole(r);
    setEmail(defaultMail);
    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (password === 'wrongpassword' || password.length < 8) {
        throw new Error('Password must contain at least 8 characters and match credentials.');
      }

      const response = await authApi.login({
        email,
        password,
      });

      // Update user role to match selected role
      const matchedUser = {
        ...response.user,
        role: selectedRole,
        name:
          selectedRole === 'SALES_REP'
            ? 'Alex Morgan'
            : selectedRole === 'SALES_MANAGER'
            ? 'Maria Chen'
            : selectedRole === 'FINANCE'
            ? 'David Park'
            : 'Admin User',
      };

      login(matchedUser, response.tokens.accessToken, response.tokens.refreshToken);
      showToast(`Welcome back, ${matchedUser.name}!`, 'green');
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials');
      showToast(err.message || 'Login failed', 'red');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{ width: '380px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'var(--accent)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '22px',
              color: '#fff',
              margin: '0 auto 10px',
            }}
          >
            D
          </div>
          <div style={{ fontWeight: 700, fontSize: '22px', color: 'var(--text)', letterSpacing: '-0.4px' }}>
            DealFlow360
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Sales Operations Platform
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '28px',
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', color: 'var(--text)' }}>
            Sign in to your workspace
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '22px' }}>
            Choose a role to explore the platform
          </div>

          {errorMessage && (
            <div
              style={{
                background: 'var(--red-dim)',
                border: '1px solid var(--red)',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '11px',
                color: 'var(--red)',
                marginBottom: '16px',
              }}
            >
              ⚠ {errorMessage}
            </div>
          )}

          {/* Role selector grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            {roleConfigs.map((rc) => {
              const isSelected = selectedRole === rc.role;
              return (
                <div
                  key={rc.role}
                  onClick={() => handleSelectRole(rc.role, rc.defaultEmail)}
                  style={{
                    padding: '10px 12px',
                    background: isSelected ? 'var(--accent-dim)' : 'var(--surface2)',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '7px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text)' }}>
                    {rc.icon} {rc.name}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                    {rc.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>
                Email
              </label>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>
                Password
              </label>
              <input
                className="field-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '9px 0',
                marginTop: '4px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
