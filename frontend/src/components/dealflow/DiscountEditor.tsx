import React, { useState } from 'react';

interface DiscountEditorProps {
  currentDiscount: number;
  category?: string;
  customerTier?: 'GOLD' | 'SILVER' | 'BRONZE' | string;
  onChangeDiscount: (newDiscount: number) => void;
  compact?: boolean;
}

export function DiscountEditor({
  currentDiscount,
  category = 'Hardware',
  customerTier = 'GOLD',
  onChangeDiscount,
  compact = false,
}: DiscountEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Compute allowed discount based on category and customer tier
  const getCategoryLimit = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('service')) return 10;
    if (c.includes('sub') || c.includes('saas')) return 15;
    return 15; // Hardware
  };

  const getTierLimit = (tier: string) => {
    const t = tier.toUpperCase();
    if (t === 'GOLD' || t === 'ENTERPRISE') return 15;
    if (t === 'SILVER' || t === 'MID_MARKET') return 10;
    return 5; // Bronze / SMB
  };

  const categoryLimit = getCategoryLimit(category);
  const tierLimit = getTierLimit(customerTier);
  const allowedDiscount = Math.min(categoryLimit, tierLimit);

  // Determine state: Safe, Warning, Violation
  let state: 'SAFE' | 'WARNING' | 'VIOLATION' = 'SAFE';
  let message = '✓ Within allowed limit';
  let badgeClass = 'text-green';
  let deltaOver = 0;

  if (currentDiscount > allowedDiscount) {
    state = 'VIOLATION';
    deltaOver = Math.round((currentDiscount - allowedDiscount) * 10) / 10;
    message = `🔴 Exceeds allowed limit by ${deltaOver}%`;
    badgeClass = 'text-red';
  } else if (currentDiscount === allowedDiscount) {
    state = 'WARNING';
    message = '⚠ At maximum limit';
    badgeClass = 'text-amber';
  }

  const handleInputChange = (val: string) => {
    const num = Math.min(100, Math.max(0, parseFloat(val) || 0));
    onChangeDiscount(num);
  };

  if (compact) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <input
            type="number"
            min="0"
            max="100"
            value={currentDiscount}
            onChange={(e) => handleInputChange(e.target.value)}
            style={{
              width: '56px',
              background: 'var(--surface3)',
              border: `1px solid ${
                state === 'VIOLATION'
                  ? 'var(--red)'
                  : state === 'WARNING'
                  ? 'var(--amber)'
                  : 'var(--border)'
              }`,
              borderRadius: '4px',
              color:
                state === 'VIOLATION'
                  ? 'var(--red)'
                  : state === 'WARNING'
                  ? 'var(--amber)'
                  : 'var(--text)',
              padding: '2px 4px',
              fontSize: '11px',
              textAlign: 'center',
              fontWeight: 600,
            }}
          />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>%</span>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              padding: '0 2px',
            }}
            title="Inspect discount governance"
          >
            {state === 'VIOLATION' ? '🔴' : state === 'WARNING' ? '⚠️' : 'ℹ️'}
          </button>
        </div>

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              zIndex: 100,
              marginTop: '4px',
              width: '210px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '10px 12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              fontSize: '11px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontWeight: 700 }}>Discount Governance</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div style={{ color: 'var(--text-dim)', marginBottom: '4px' }}>
              Category ({category}): <strong>≤{categoryLimit}%</strong>
            </div>
            <div style={{ color: 'var(--text-dim)', marginBottom: '6px' }}>
              Customer Tier ({customerTier}): <strong>≤{tierLimit}%</strong>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>
              Allowed Ceiling: <span className="text-accent">{allowedDiscount}%</span>
            </div>
            <div style={{ marginTop: '6px', fontSize: '10px', fontWeight: 700 }} className={badgeClass}>
              {message}
            </div>
            {state === 'VIOLATION' && (
              <div style={{ fontSize: '9px', color: 'var(--red)', marginTop: '2px' }}>
                Risk: HIGH · Manager & Finance sign-off required
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--surface2)',
        border: `1px solid ${
          state === 'VIOLATION'
            ? 'var(--red)'
            : state === 'WARNING'
            ? 'var(--amber)'
            : 'var(--border)'
        }`,
        borderRadius: '8px',
        padding: '12px 14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Discount</span>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            Allowed: <strong>{allowedDiscount}%</strong> ({category} / {customerTier})
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Current:</span>
          <input
            type="number"
            min="0"
            max="100"
            value={currentDiscount}
            onChange={(e) => handleInputChange(e.target.value)}
            style={{
              width: '60px',
              background: 'var(--surface3)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text)',
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: 700,
              textAlign: 'center',
            }}
          />
          <span style={{ fontSize: '12px', fontWeight: 700 }}>%</span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '6px',
          borderTop: '1px solid var(--border)',
          fontSize: '11px',
        }}
      >
        <span className={badgeClass} style={{ fontWeight: 600 }}>
          {message}
        </span>
        {state === 'VIOLATION' && (
          <span className="badge badge-red" style={{ fontSize: '9px' }}>
            Risk: HIGH
          </span>
        )}
      </div>
    </div>
  );
}
