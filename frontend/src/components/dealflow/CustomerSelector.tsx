import React, { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { useCustomers } from '@/hooks/useQuotations';

interface CustomerSelectorProps {
  selectedCustomerId?: string;
  onSelectCustomer: (customer: Customer) => void;
  className?: string;
}

export function CustomerSelector({
  selectedCustomerId,
  onSelectCustomer,
  className = '',
}: CustomerSelectorProps) {
  const { data: customers = [] } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (selectedCustomerId && customers.length > 0) {
      const found =
        customers.find(
          (c) =>
            c.id === selectedCustomerId ||
            c.companyName.toLowerCase() === selectedCustomerId.toLowerCase()
        ) || customers[0];
      setSelectedCustomer(found);
    } else if (customers.length > 0 && !selectedCustomer) {
      setSelectedCustomer(customers[0]);
      onSelectCustomer(customers[0]);
    }
  }, [selectedCustomerId, customers]);

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.companyName.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.tier.toLowerCase().includes(q)
    );
  });

  const handleSelect = (c: Customer) => {
    setSelectedCustomer(c);
    onSelectCustomer(c);
  };

  const getTierBadge = (company: string, tier: string) => {
    if (company.includes('Acme') || company.includes('Vertex') || tier === 'ENTERPRISE') {
      return { label: 'Gold', badge: 'badge-green', ceiling: '≤15%' };
    }
    if (company.includes('Beta') || company.includes('TechCorp') || tier === 'MID_MARKET') {
      return { label: 'Silver', badge: 'badge-blue', ceiling: '≤10%' };
    }
    return { label: 'Bronze', badge: 'badge-gray', ceiling: '≤5%' };
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Input */}
      <div>
        <label className="field-label">Customer</label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="field-input"
            placeholder="🔍 Search customer name, industry, or tier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Selected Customer Active Card */}
      {selectedCustomer && (
        <div
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--accent)',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Customer
            </div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>
              {selectedCustomer.companyName}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
              Tier:{' '}
              <span
                className={`badge ${getTierBadge(selectedCustomer.companyName, selectedCustomer.tier).badge}`}
                style={{ marginLeft: '4px' }}
              >
                {getTierBadge(selectedCustomer.companyName, selectedCustomer.tier).label} (
                {getTierBadge(selectedCustomer.companyName, selectedCustomer.tier).ceiling})
              </span>{' '}
              · Currency: <strong style={{ color: 'var(--accent)' }}>{selectedCustomer.currency}</strong>
            </div>
          </div>
          <span className="badge badge-green">Selected ✓</span>
        </div>
      )}

      {/* Customer List / Options */}
      <div>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Recent & Available Customers
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
          {filteredCustomers.map((c) => {
            const isSelected = selectedCustomer?.id === c.id;
            const tierInfo = getTierBadge(c.companyName, c.tier);

            return (
              <div
                key={c.id}
                onClick={() => handleSelect(c)}
                style={{
                  padding: '10px 12px',
                  background: isSelected ? 'var(--accent-dim)' : 'var(--surface2)',
                  border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text)' }}>
                    ○ {c.companyName}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {tierInfo.label} · {c.tier} · {c.country}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${tierInfo.badge}`}>{tierInfo.label}</span>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Max: {tierInfo.ceiling}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
