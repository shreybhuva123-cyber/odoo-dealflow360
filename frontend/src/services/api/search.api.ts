import { SearchResultItem } from '@/types';
import { productsApi } from './products.api';
import { pipelineApi } from './pipeline.api';
import { quotationsApi } from './quotations.api';
import { invoicesApi } from './invoices.api';
import { customersApi } from './customers.api';

const RECENT_SEARCHES_KEY = 'dealflow_recent_searches_v2';

export const searchApi = {
  async globalSearch(query: string): Promise<SearchResultItem[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const results: SearchResultItem[] = [];

    try {
      // 1. Search Deals
      const deals = await pipelineApi.getDeals();
      deals.forEach((d) => {
        if (
          d.name.toLowerCase().includes(q) ||
          d.customerName.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q)
        ) {
          results.push({
            id: d.id,
            type: 'DEAL',
            title: d.name,
            subtitle: `${d.customerName} • $${d.value.toLocaleString()} • ${d.stage.toUpperCase()}`,
            badge: d.health === 'healthy' ? 'Healthy' : d.health === 'at_risk' ? 'At Risk' : 'Critical',
            badgeColor: d.health === 'healthy' ? 'green' : d.health === 'at_risk' ? 'amber' : 'rose',
            route: `/app/pipeline/${d.id}`,
          });
        }
      });

      // 2. Search Quotations
      const quotes = await quotationsApi.getAll();
      quotes.forEach((qt) => {
        if (
          qt.quoteNumber.toLowerCase().includes(q) ||
          qt.customerName.toLowerCase().includes(q) ||
          qt.id.toLowerCase().includes(q)
        ) {
          results.push({
            id: qt.id,
            type: 'QUOTATION',
            title: `Quote ${qt.quoteNumber} — ${qt.customerName}`,
            subtitle: `Total: $${(qt.summary?.grandTotal ?? 0).toLocaleString()} • Margin: ${qt.summary?.overallMarginPct ?? 0}%`,
            badge: qt.status.replace('_', ' '),
            badgeColor: qt.status === 'APPROVED' ? 'green' : qt.status === 'PENDING_APPROVAL' ? 'amber' : 'blue',
            route: `/app/quotations/${qt.id}`,
          });
        }
      });

      // 3. Search Products
      const products = await productsApi.getAll();
      products.forEach((p) => {
        if (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        ) {
          results.push({
            id: p.id,
            type: 'PRODUCT',
            title: p.name,
            subtitle: `SKU: ${p.sku} • Base $${p.basePrice.toLocaleString()} • ${p.category}`,
            badge: p.type,
            badgeColor: p.type === 'PHYSICAL' ? 'blue' : p.type === 'SUBSCRIPTION' ? 'purple' : 'green',
            route: `/app/products/${p.id}`,
          });
        }
      });

      // 4. Search Customers
      const customers = await customersApi.getAll();
      customers.forEach((c) => {
        if (
          c.companyName.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.tier.toLowerCase().includes(q)
        ) {
          results.push({
            id: c.id,
            type: 'CUSTOMER',
            title: c.companyName,
            subtitle: `${c.industry} • Tier: ${c.tier} • Terms: ${c.creditProfile.paymentTerms}`,
            badge: c.tier,
            badgeColor: c.tier === 'ENTERPRISE' ? 'purple' : 'blue',
            route: `/app/customers`,
          });
        }
      });

      // 5. Search Invoices
      const invoices = await invoicesApi.getInvoices();
      invoices.forEach((inv) => {
        if (
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q) ||
          inv.id.toLowerCase().includes(q)
        ) {
          results.push({
            id: inv.id,
            type: 'INVOICE',
            title: `Invoice ${inv.invoiceNumber} — ${inv.customerName}`,
            subtitle: `Amount: $${inv.total.toLocaleString()} • Due: ${inv.dueDate}`,
            badge: inv.status.toUpperCase(),
            badgeColor: inv.status === 'paid' ? 'green' : inv.status === 'overdue' ? 'rose' : 'amber',
            route: `/app/invoices/${inv.id}`,
          });
        }
      });
    } catch (err) {
      console.error('Error executing global search:', err);
    }

    return results.slice(0, 15);
  },

  getRecentSearches(): string[] {
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      return raw ? JSON.parse(raw) : ['Acme', 'ProLaptop', 'Quote 1042', 'Pending Approval'];
    } catch {
      return ['Acme', 'ProLaptop', 'Quote 1042'];
    }
  },

  saveRecentSearch(query: string): void {
    const trimmed = query.trim();
    if (!trimmed) return;
    try {
      const recents = searchApi.getRecentSearches();
      const filtered = [trimmed, ...recents.filter((r) => r.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
    } catch (err) {
      console.error('Failed to save recent search:', err);
    }
  },

  clearRecentSearches(): void {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (err) {
      console.error('Failed to clear recent searches:', err);
    }
  },
};
