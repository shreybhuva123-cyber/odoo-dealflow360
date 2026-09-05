import {
  CustomerQuote,
  CustomerTimelineEvent,
  CustomerQuoteStatus,
  NegotiationItemRequest,
} from '@/types';

const PORTAL_QUOTES_KEY = 'dealflow_portal_quotes_v2';
const PORTAL_ACTIVITY_KEY = 'dealflow_portal_activity_v2';

export const DEFAULT_PORTAL_QUOTES: Record<string, CustomerQuote> = {
  portal_acme_1042: {
    id: 'quote_1042',
    quoteNumber: 'QT-1024',
    customerName: 'Acme Corporation',
    customerEmail: 'procurement@acme.com',
    issueDate: '2026-09-02',
    validUntil: '2026-09-30',
    status: 'awaiting_response',
    currency: '₹',
    items: [
      {
        id: 'cqi_1',
        productId: 'prod_laptop',
        productName: 'ProLaptop X1',
        description: 'High-performance business laptop with Intel Core Ultra 7, 32GB RAM & 1TB NVMe SSD',
        quantity: 10,
        unitPrice: 80000,
        discountAmount: 50000,
        total: 750000,
        category: 'Computing Hardware',
      },
      {
        id: 'cqi_2',
        productId: 'prod_monitor',
        productName: 'UltraDisplay 4K HDR',
        description: '27-inch 4K UHD color-calibrated IPS monitor with Thunderbolt 4 daisy-chaining',
        quantity: 10,
        unitPrice: 20000,
        discountAmount: 0,
        total: 200000,
        category: 'Displays',
      },
      {
        id: 'cqi_3',
        productId: 'prod_cloud',
        productName: 'CloudBase Pro Suite',
        description: 'Enterprise cloud intelligence, real-time sync, and automated workflow orchestrations',
        quantity: 1,
        unitPrice: 100000,
        discountAmount: 0,
        total: 100000,
        category: 'Software Subscription',
        badge: 'Annual SaaS',
      },
    ],
    subtotal: 1100000,
    discount: 50000,
    tax: 189000, // 18% GST on net subtotal
    shipping: 0,
    total: 1239000,
    version: 1,
    salesRepName: 'Alex Morgan',
    salesRepEmail: 'a.morgan@dealflow360.com',
    notes: 'Includes standard 3-year enterprise manufacturer warranty and 24/7 priority onboarding support.',
    termsAndConditions: 'Payment terms: Net 30 days from dispatch. Delivery scheduled within 7 business days of written acceptance.',
  },

  portal_apex_1001_secure: {
    id: 'quote_1001',
    quoteNumber: 'QT-1001',
    customerName: 'Apex Logistics Ltd',
    customerEmail: 'operations@apexlogistics.com',
    issueDate: '2026-09-01',
    validUntil: '2026-10-15',
    status: 'viewed',
    currency: '₹',
    version: 2,
    previousVersion: {
      versionNumber: 1,
      updatedAt: '2026-09-04T14:30:00Z',
      total: 1130000,
      summary: 'Sales representative revised line pricing and added volume discounts per customer negotiation request.',
      changes: [
        {
          item: 'ProLaptop X1 Quantity',
          previous: '10 units',
          updated: '12 units (+2 units added)',
        },
        {
          item: 'UltraDisplay 4K Unit Price',
          previous: '₹22,000 / unit',
          updated: '₹20,000 / unit (₹2,000 discount applied)',
        },
        {
          item: 'Total Agreement Value',
          previous: '₹11,30,000',
          updated: '₹12,90,000 (Adjusted after revision)',
        },
      ],
    },
    items: [
      {
        id: 'cqi_11',
        productId: 'prod_laptop',
        productName: 'ProLaptop X1',
        description: 'High-performance business laptop with Intel Core Ultra 7, 32GB RAM & 1TB NVMe SSD',
        quantity: 12,
        unitPrice: 80000,
        discountAmount: 60000,
        total: 900000,
        category: 'Computing Hardware',
      },
      {
        id: 'cqi_12',
        productId: 'prod_monitor',
        productName: 'UltraDisplay 4K HDR',
        description: '27-inch 4K UHD color-calibrated IPS monitor with Thunderbolt 4 daisy-chaining',
        quantity: 10,
        unitPrice: 20000,
        discountAmount: 0,
        total: 200000,
        category: 'Displays',
      },
      {
        id: 'cqi_13',
        productId: 'prod_support',
        productName: 'Enterprise SLA & Support 24/7',
        description: 'Guaranteed 1-hour response SLA, dedicated technical account manager, and on-site dispatch',
        quantity: 1,
        unitPrice: 190000,
        discountAmount: 0,
        total: 190000,
        category: 'Services',
        badge: 'Annual Plan',
      },
    ],
    subtotal: 1350000,
    discount: 60000,
    tax: 232200,
    shipping: 0,
    total: 1522200,
    salesRepName: 'Maria Chen',
    salesRepEmail: 'm.chen@dealflow360.com',
    notes: 'Revised pricing approved per agreement on volume expansion.',
    termsAndConditions: 'Standard commercial terms apply. Valid across all regional warehouses.',
  },

  portal_expired_demo: {
    id: 'quote_1030',
    quoteNumber: 'QT-1030',
    customerName: 'Legacy Enterprises',
    customerEmail: 'it@legacy.com',
    issueDate: '2026-07-15',
    validUntil: '2026-08-15',
    status: 'expired',
    currency: '₹',
    version: 1,
    items: [
      {
        id: 'cqi_31',
        productId: 'prod_server',
        productName: 'Enterprise Rack Server Node',
        description: 'Dual Xeon Gold, 128GB ECC RAM, 4TB SSD RAID storage',
        quantity: 2,
        unitPrice: 260000,
        discountAmount: 0,
        total: 520000,
        category: 'Infrastructure',
      },
    ],
    subtotal: 520000,
    discount: 0,
    tax: 93600,
    shipping: 0,
    total: 613600,
    salesRepName: 'David Park',
    salesRepEmail: 'd.park@dealflow360.com',
    notes: 'Special quarterly promotion terms have lapsed.',
    termsAndConditions: 'Quotation validity period expired on 15 Aug 2026.',
  },
};

const DEFAULT_ACTIVITY: Record<string, CustomerTimelineEvent[]> = {
  portal_acme_1042: [
    {
      id: 'act_1',
      timestamp: '02 Sep 2026, 10:14 AM',
      title: 'Quotation Generated & Dispatched',
      description: 'Sales team issued quotation QT-1024 with Net 30 payment terms.',
      actorType: 'sales_team',
    },
    {
      id: 'act_2',
      timestamp: '03 Sep 2026, 09:30 AM',
      title: 'Quotation Accessed via Secure Link',
      description: 'Customer opened quotation for commercial review.',
      actorType: 'customer',
    },
  ],
  portal_apex_1001_secure: [
    {
      id: 'act_11',
      timestamp: '01 Sep 2026, 11:00 AM',
      title: 'Initial Quotation Issued',
      description: 'Quotation QT-1001 Version 1 prepared for 10 units.',
      actorType: 'sales_team',
    },
    {
      id: 'act_12',
      timestamp: '03 Sep 2026, 04:15 PM',
      title: 'Customer Requested Terms Negotiation',
      description: 'Customer requested 2 additional laptops and unit price adjustment on monitors.',
      actorType: 'customer',
    },
    {
      id: 'act_13',
      timestamp: '04 Sep 2026, 02:30 PM',
      title: 'Updated Quotation Version 2 Issued',
      description: 'Sales team revised terms with volume discounts applied.',
      actorType: 'sales_team',
    },
  ],
};

function loadStoredQuotes(): Record<string, CustomerQuote> {
  try {
    const raw = localStorage.getItem(PORTAL_QUOTES_KEY);
    if (!raw) {
      localStorage.setItem(PORTAL_QUOTES_KEY, JSON.stringify(DEFAULT_PORTAL_QUOTES));
      return { ...DEFAULT_PORTAL_QUOTES };
    }
    return JSON.parse(raw);
  } catch {
    return { ...DEFAULT_PORTAL_QUOTES };
  }
}

function saveStoredQuotes(quotes: Record<string, CustomerQuote>) {
  try {
    localStorage.setItem(PORTAL_QUOTES_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.error('Failed to persist portal quotes', err);
  }
}

function loadStoredActivity(): Record<string, CustomerTimelineEvent[]> {
  try {
    const raw = localStorage.getItem(PORTAL_ACTIVITY_KEY);
    if (!raw) {
      localStorage.setItem(PORTAL_ACTIVITY_KEY, JSON.stringify(DEFAULT_ACTIVITY));
      return { ...DEFAULT_ACTIVITY };
    }
    return JSON.parse(raw);
  } catch {
    return { ...DEFAULT_ACTIVITY };
  }
}

function saveStoredActivity(activity: Record<string, CustomerTimelineEvent[]>) {
  try {
    localStorage.setItem(PORTAL_ACTIVITY_KEY, JSON.stringify(activity));
  } catch (err) {
    console.error('Failed to persist portal activity', err);
  }
}

export const customerPortalApi = {
  async getCustomerQuote(token: string): Promise<CustomerQuote | null> {
    await new Promise((r) => setTimeout(r, 120));
    const quotes = loadStoredQuotes();
    const quote = quotes[token];
    if (!quote) return null;

    // Check expiry
    const validUntilDate = new Date(quote.validUntil);
    const now = new Date();
    if (validUntilDate < now && quote.status !== 'accepted' && quote.status !== 'rejected') {
      quote.status = 'expired';
      quotes[token] = quote;
      saveStoredQuotes(quotes);
    }

    return quote;
  },

  async recordQuoteView(token: string): Promise<void> {
    try {
      const quotes = loadStoredQuotes();
      const quote = quotes[token];
      if (quote && quote.status === 'awaiting_response') {
        quote.status = 'viewed';
        quotes[token] = quote;
        saveStoredQuotes(quotes);

        // Add activity
        const activity = loadStoredActivity();
        const list = activity[token] || [];
        list.push({
          id: `act_${Date.now()}`,
          timestamp: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          title: 'Quotation Viewed by Customer',
          description: 'Recipient accessed and reviewed quotation details.',
          actorType: 'customer',
        });
        activity[token] = list;
        saveStoredActivity(activity);
      }
    } catch {
      // Non-blocking analytics logging
    }
  },

  async acceptCustomerQuote(
    token: string,
    payload: {
      signatoryName: string;
      signatoryEmail: string;
      signatoryTitle?: string;
      notes?: string;
    }
  ): Promise<CustomerQuote> {
    await new Promise((r) => setTimeout(r, 150));
    const quotes = loadStoredQuotes();
    const quote = quotes[token];
    if (!quote) throw new Error('Quotation not found or invalid token');

    if (quote.status === 'expired') {
      throw new Error('This quotation has expired and cannot be accepted.');
    }

    quote.status = 'accepted';
    quotes[token] = quote;
    saveStoredQuotes(quotes);

    // Record activity
    const activity = loadStoredActivity();
    const list = activity[token] || [];
    list.unshift({
      id: `act_${Date.now()}`,
      timestamp: 'Just now',
      title: 'Quotation Accepted & Finalized',
      description: `Digitally confirmed by ${payload.signatoryName} (${payload.signatoryEmail})${payload.signatoryTitle ? `, ${payload.signatoryTitle}` : ''}. ${payload.notes ? `Note: "${payload.notes}"` : ''}`,
      actorType: 'customer',
    });
    activity[token] = list;
    saveStoredActivity(activity);

    return quote;
  },

  async rejectCustomerQuote(
    token: string,
    payload: { reason: string; customerName?: string }
  ): Promise<CustomerQuote> {
    await new Promise((r) => setTimeout(r, 150));
    const quotes = loadStoredQuotes();
    const quote = quotes[token];
    if (!quote) throw new Error('Quotation not found');

    quote.status = 'rejected';
    quotes[token] = quote;
    saveStoredQuotes(quotes);

    const activity = loadStoredActivity();
    const list = activity[token] || [];
    list.unshift({
      id: `act_${Date.now()}`,
      timestamp: 'Just now',
      title: 'Quotation Declined by Customer',
      description: `Reason: "${payload.reason}"`,
      actorType: 'customer',
    });
    activity[token] = list;
    saveStoredActivity(activity);

    return quote;
  },

  async requestQuoteChanges(
    token: string,
    payload: {
      items: NegotiationItemRequest[];
      message: string;
      customerName: string;
    }
  ): Promise<CustomerQuote> {
    await new Promise((r) => setTimeout(r, 200));
    const quotes = loadStoredQuotes();
    const quote = quotes[token];
    if (!quote) throw new Error('Quotation not found');

    quote.status = 'changes_requested';
    quotes[token] = quote;
    saveStoredQuotes(quotes);

    // Append to timeline
    const activity = loadStoredActivity();
    const list = activity[token] || [];
    const itemSummaries = payload.items
      .map(
        (it) =>
          `${it.productName}: Qty ${it.currentQuantity} → ${it.requestedQuantity}, Rate ₹${it.currentPrice.toLocaleString()} → ₹${it.requestedPrice.toLocaleString()}`
      )
      .join('; ');

    list.unshift({
      id: `act_${Date.now()}`,
      timestamp: 'Just now',
      title: 'Customer Requested Terms Revision',
      description: `Changes requested on ${payload.items.length} item(s): [${itemSummaries}]. Message: "${payload.message}"`,
      actorType: 'customer',
    });
    activity[token] = list;
    saveStoredActivity(activity);

    return quote;
  },

  async getCustomerQuoteActivity(token: string): Promise<CustomerTimelineEvent[]> {
    await new Promise((r) => setTimeout(r, 80));
    const activity = loadStoredActivity();
    return activity[token] || [];
  },
};
