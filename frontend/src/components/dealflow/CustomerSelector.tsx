import React, { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { useCustomers } from '@/hooks/useQuotations';
import { Search, Building2, Check, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const { data: customers = [], isLoading } = useCustomers();
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
    <div className={cn('space-y-4', className)}>
      {/* Search Input Bar */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
          <span>Customer Account</span>
          <span className="text-[10px] text-muted-foreground font-normal">
            {customers.length} accounts available
          </span>
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            placeholder="Search by company name, industry, or tier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Selected Customer Active Card */}
      {selectedCustomer && (
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-3.5 flex items-center justify-between gap-3 shadow-sm transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Active Customer
              </div>
              <div className="font-bold text-sm text-foreground truncate">
                {selectedCustomer.companyName}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                <span>Tier:</span>
                <span className={cn('badge', getTierBadge(selectedCustomer.companyName, selectedCustomer.tier).badge)}>
                  {getTierBadge(selectedCustomer.companyName, selectedCustomer.tier).label} ({getTierBadge(selectedCustomer.companyName, selectedCustomer.tier).ceiling})
                </span>
                <span>·</span>
                <span>Currency: <strong className="text-primary font-mono">{selectedCustomer.currency}</strong></span>
              </div>
            </div>
          </div>
          <span className="badge badge-green flex-shrink-0 text-xs px-2.5 py-1 shadow-sm">
            <Check className="w-3 h-3 mr-0.5" />
            Selected
          </span>
        </div>
      )}

      {/* Customer List / Radio Options */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          <span>Select an Account</span>
          <span className="text-[10px] font-normal lowercase">{filteredCustomers.length} results</span>
        </div>

        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground bg-surface2/40 rounded-xl border border-border">
              Loading accounts...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground bg-surface2/40 rounded-xl border border-border">
              No customer found matching "{searchQuery}"
            </div>
          ) : (
            filteredCustomers.map((c) => {
              const isSelected = selectedCustomer?.id === c.id;
              const tierInfo = getTierBadge(c.companyName, c.tier);

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className={cn(
                    'p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all duration-150 group shadow-sm',
                    isSelected
                      ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                      : 'border-border bg-surface hover:bg-surface2 hover:border-primary/40'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Modern Radio Button Circle */}
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground/40 group-hover:border-primary/60'
                      )}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-foreground truncate">
                        {c.companyName}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {c.industry} · {c.country}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-3 flex items-center gap-2">
                    <span className={cn('badge', tierInfo.badge)}>
                      {tierInfo.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">
                      Max: {tierInfo.ceiling}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
