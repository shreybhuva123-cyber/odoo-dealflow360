import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Users, Package, Receipt, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface SearchItem {
  id: string;
  category: 'QUOTATIONS' | 'CUSTOMERS' | 'PRODUCTS' | 'INVOICES';
  title: string;
  subtitle: string;
  route: string;
}

const SEARCH_DATA: SearchItem[] = [
  // Quotations
  { id: 'q1', category: 'QUOTATIONS', title: '#1042 — Apex Logistics Global', subtitle: 'Enterprise AI Edge Fleet ($136,944)', route: ROUTES.APP.QUOTATION_DETAIL('quote_1001') },
  { id: 'q2', category: 'QUOTATIONS', title: '#1038 — Starlight BioMed', subtitle: 'IoT Diagnostics Cluster ($78,540)', route: ROUTES.APP.QUOTATION_DETAIL('quote_1002') },
  // Customers
  { id: 'c1', category: 'CUSTOMERS', title: 'Apex Logistics Global', subtitle: 'Enterprise • Available Credit: $195k', route: ROUTES.APP.CUSTOMERS },
  { id: 'c2', category: 'CUSTOMERS', title: 'Starlight BioMed Solutions', subtitle: 'Enterprise • NET60 terms', route: ROUTES.APP.CUSTOMERS },
  { id: 'c3', category: 'CUSTOMERS', title: 'Quantum Dynamics Tech', subtitle: 'Mid-Market • IoT Hardware', route: ROUTES.APP.CUSTOMERS },
  // Products
  { id: 'p1', category: 'PRODUCTS', title: 'DealFlow Enterprise Edge AI Appliance X1', subtitle: 'SKU: DF-EDGE-X1 • List $12,500', route: ROUTES.APP.PRODUCTS },
  { id: 'p2', category: 'PRODUCTS', title: 'DealFlow Intelligence Cloud Suite', subtitle: 'SKU: DF-CLOUD-CORE • Annual SaaS', route: ROUTES.APP.PRODUCTS },
  // Invoices
  { id: 'i1', category: 'INVOICES', title: 'INV-2026-089 — Apex Logistics', subtitle: 'Amount: $68,472 • Due Oct 15', route: ROUTES.APP.BILLING },
];

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const filtered = query.trim()
    ? SEARCH_DATA.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (route: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(route);
  };

  const categories = Array.from(new Set(filtered.map((item) => item.category)));

  const categoryIcons = {
    QUOTATIONS: FileText,
    CUSTOMERS: Users,
    PRODUCTS: Package,
    INVOICES: Receipt,
  };

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search deals, customers, quotes, invoices..."
          className="w-full h-8 pl-8 pr-7 text-xs rounded-md bg-secondary/50 border border-border/70 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 max-h-96 overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No matching deals, customers, or products found for "{query}".
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat];
                const items = filtered.filter((i) => i.category === cat);

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                      <Icon className="h-3 w-3 text-primary" />
                      <span>{cat}</span>
                    </div>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item.route)}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-secondary/70 cursor-pointer text-xs transition-colors group"
                      >
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{item.subtitle}</p>
                        </div>
                        <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
