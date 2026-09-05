import {
  Invoice,
  Payment,
  InvoiceFilterOptions,
} from '@/types';

const INVOICES_STORAGE_KEY = 'dealflow_invoices_v2';

export const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'INV-1024',
    invoiceNumber: 'INV-1024',
    quotationId: 'quote_1042',
    quotationNumber: 'Q-1042',
    dealId: 'deal-101',
    dealName: 'Acme Enterprise Hardware & SaaS Suite',
    fulfillmentId: 'FUL-1024',
    fulfillmentNumber: 'FUL-1024',
    customerId: 'cust_acme',
    customerName: 'Acme Corporation',
    customerEmail: 'billing@acme.com',
    subtotal: 1000000,
    discount: 50000,
    tax: 180000,
    shipping: 20000,
    total: 1150000,
    amountPaid: 800000,
    balanceDue: 350000,
    currency: '₹',
    issueDate: '2026-09-05',
    dueDate: '2026-09-15',
    status: 'pending',
    paymentTerms: 'NET 10 Days',
    notes: 'Includes 10x ThinkStation Pro and 10x 4K UltraDisplays with premium warranty support.',
    billTo: {
      name: 'Accounts Payable',
      company: 'Acme Corporation',
      address: '404 Innovation Way, Cyber City',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400051',
      taxId: '27AABCA1234F1Z9',
    },
    items: [
      {
        id: 'ii-1024-1',
        productId: 'prod_laptop_pro',
        productName: 'ThinkStation Pro Laptop X1 (32GB / 1TB SSD)',
        sku: 'LP-100',
        quantity: 10,
        unitPrice: 80000,
        lineTotal: 800000,
      },
      {
        id: 'ii-1024-2',
        productId: 'prod_display_4k',
        productName: 'UltraDisplay 27" 4K HDR Color-Calibrated Monitor',
        sku: 'MN-24',
        quantity: 10,
        unitPrice: 20000,
        lineTotal: 200000,
      },
    ],
    payments: [
      {
        id: 'pay-1024-1',
        invoiceId: 'INV-1024',
        amount: 500000,
        method: 'bank_transfer',
        reference: 'REF-928372',
        paymentDate: '2026-09-05',
        status: 'completed',
        recordedBy: 'Rahul Sharma',
        notes: 'Initial deposit 40% cleared via NEFT',
      },
      {
        id: 'pay-1024-2',
        invoiceId: 'INV-1024',
        amount: 300000,
        method: 'credit_card',
        reference: 'REF-837210',
        paymentDate: '2026-09-05',
        status: 'completed',
        recordedBy: 'Rahul Sharma',
        notes: 'Milestone payment tranche 2',
      },
    ],
    remindersSentCount: 0,
    createdAt: '2026-09-05T09:00:00Z',
    updatedAt: '2026-09-05T11:00:00Z',
  },
  {
    id: 'INV-1023',
    invoiceNumber: 'INV-1023',
    quotationId: 'quote_1040',
    quotationNumber: 'Q-1040',
    dealId: 'deal-102',
    dealName: 'XYZ Ltd Retail Systems Overhaul',
    fulfillmentId: 'FUL-1023',
    fulfillmentNumber: 'FUL-1023',
    customerId: 'cust_xyz',
    customerName: 'XYZ Ltd',
    customerEmail: 'finance@xyzretail.in',
    subtotal: 420000,
    discount: 10000,
    tax: 70000,
    shipping: 0,
    total: 480000,
    amountPaid: 480000,
    balanceDue: 0,
    currency: '₹',
    issueDate: '2026-09-01',
    dueDate: '2026-09-10',
    status: 'paid',
    paymentTerms: 'Immediate Payment',
    billTo: {
      name: 'Financial Controller',
      company: 'XYZ Ltd',
      address: '12 Connaught Place, Inner Circle',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      postalCode: '110001',
      taxId: '07AABCL9921D1ZZ',
    },
    items: [
      {
        id: 'ii-1023-1',
        productId: 'prod_1',
        productName: 'DealFlow Enterprise Edge AI Appliance X1',
        sku: 'DF-EDGE-X1',
        quantity: 5,
        unitPrice: 84000,
        lineTotal: 420000,
      },
    ],
    payments: [
      {
        id: 'pay-1023-1',
        invoiceId: 'INV-1023',
        amount: 480000,
        method: 'bank_transfer',
        reference: 'TXN-88422991',
        paymentDate: '2026-09-02',
        status: 'completed',
        recordedBy: 'Ananya Roy',
        notes: 'Full invoice amount settled via RTGS',
      },
    ],
    createdAt: '2026-09-01T14:00:00Z',
    updatedAt: '2026-09-02T16:30:00Z',
  },
  {
    id: 'INV-1025',
    invoiceNumber: 'INV-1025',
    quotationId: 'quote_1041',
    quotationNumber: 'Q-1041',
    dealId: 'deal-103',
    dealName: 'Beta Smart Factory Sensors & Edge Gateway',
    fulfillmentId: 'FUL-1025',
    fulfillmentNumber: 'FUL-1025',
    customerId: 'cust_beta',
    customerName: 'Beta Industries',
    customerEmail: 'accounts@betaindustries.com',
    subtotal: 1300000,
    discount: 20000,
    tax: 220000,
    shipping: 0,
    total: 1500000,
    amountPaid: 1050000,
    balanceDue: 450000,
    currency: '₹',
    issueDate: '2026-08-01',
    dueDate: '2026-08-15',
    status: 'overdue',
    paymentTerms: 'NET 14 Days',
    notes: 'Urgent collection: Balance outstanding over 21 days past due date.',
    billTo: {
      name: 'Accounts Department',
      company: 'Beta Industries',
      address: 'Plot 55, Electronic City Phase 1',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560100',
    },
    items: [
      {
        id: 'ii-1025-1',
        productId: 'prod_laptop_pro',
        productName: 'ThinkStation Pro Laptop X1 (32GB / 1TB SSD)',
        sku: 'LP-100',
        quantity: 10,
        unitPrice: 100000,
        lineTotal: 1000000,
      },
      {
        id: 'ii-1025-2',
        productId: 'prod_dock_thunderbolt',
        productName: 'Thunderbolt 4 Quad-Display Workstation Dock',
        sku: 'DK-400',
        quantity: 5,
        unitPrice: 60000,
        lineTotal: 300000,
      },
    ],
    payments: [
      {
        id: 'pay-1025-1',
        invoiceId: 'INV-1025',
        amount: 1050000,
        method: 'wire',
        reference: 'WIRE-BETA-771',
        paymentDate: '2026-08-05',
        status: 'completed',
        recordedBy: 'Finance Ops',
        notes: '70% Advance clearance',
      },
    ],
    remindersSentCount: 2,
    lastReminderSentAt: '2026-09-02T10:00:00Z',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-09-02T10:00:00Z',
  },
  {
    id: 'INV-1026',
    invoiceNumber: 'INV-1026',
    quotationId: 'quote_1038',
    quotationNumber: 'Q-1038',
    dealId: 'deal-105',
    dealName: 'Nexus Next-Gen Developer Workstations',
    fulfillmentId: 'FUL-1026',
    fulfillmentNumber: 'FUL-1026',
    customerId: 'cust_nexus',
    customerName: 'Nexus Dynamics',
    customerEmail: 'ap@nexusdynamics.io',
    subtotal: 720000,
    discount: 25000,
    tax: 125000,
    shipping: 0,
    total: 820000,
    amountPaid: 400000,
    balanceDue: 420000,
    currency: '₹',
    issueDate: '2026-09-02',
    dueDate: '2026-09-20',
    status: 'partially_paid',
    paymentTerms: 'NET 20 Days',
    billTo: {
      name: 'Procurement Accounts',
      company: 'Nexus Dynamics',
      address: 'Cyber Tower 2, Magarpatta City',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '411028',
    },
    items: [
      {
        id: 'ii-1026-1',
        productId: 'prod_laptop_pro',
        productName: 'ThinkStation Pro Laptop X1 (32GB / 1TB SSD)',
        sku: 'LP-100',
        quantity: 8,
        unitPrice: 90000,
        lineTotal: 720000,
      },
    ],
    payments: [
      {
        id: 'pay-1026-1',
        invoiceId: 'INV-1026',
        amount: 400000,
        method: 'upi',
        reference: 'UPI-NEX-99201',
        paymentDate: '2026-09-03',
        status: 'completed',
        recordedBy: 'Alex Morgan',
      },
    ],
    createdAt: '2026-09-02T09:15:00Z',
    updatedAt: '2026-09-03T12:00:00Z',
  },
  {
    id: 'INV-1027',
    invoiceNumber: 'INV-1027',
    quotationId: 'quote_1036',
    quotationNumber: 'Q-1036',
    dealId: 'deal-104',
    dealName: 'OmniCorp Global Enterprise Multi-site Network',
    fulfillmentId: 'FUL-1027',
    fulfillmentNumber: 'FUL-1027',
    customerId: 'cust_omnicorp',
    customerName: 'OmniCorp Global',
    customerEmail: 'invoicing@omnicorpglobal.com',
    subtotal: 1750000,
    discount: 50000,
    tax: 300000,
    shipping: 0,
    total: 2000000,
    amountPaid: 0,
    balanceDue: 2000000,
    currency: '₹',
    issueDate: '2026-09-04',
    dueDate: '2026-09-30',
    status: 'draft',
    paymentTerms: 'NET 30 Days',
    billTo: {
      name: 'OmniCorp Global AP',
      company: 'OmniCorp Global',
      address: 'OmniCorp Tower, Bandra Kurla Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400051',
    },
    items: [
      {
        id: 'ii-1027-1',
        productId: 'prod_1',
        productName: 'DealFlow Enterprise Edge AI Appliance X1',
        sku: 'DF-EDGE-X1',
        quantity: 10,
        unitPrice: 125000,
        lineTotal: 1250000,
      },
      {
        id: 'ii-1027-2',
        productId: 'prod_keyboard_mech',
        productName: 'Tactile Silent Mechanical Keyboard',
        sku: 'KB-10',
        quantity: 10,
        unitPrice: 50000,
        lineTotal: 500000,
      },
    ],
    payments: [],
    createdAt: '2026-09-04T11:00:00Z',
    updatedAt: '2026-09-04T11:00:00Z',
  },
  {
    id: 'INV-1028',
    invoiceNumber: 'INV-1028',
    quotationId: 'quote_1034',
    quotationNumber: 'Q-1034',
    dealId: 'deal-106',
    dealName: 'Quantum Cloud Hybrid Node Integration',
    fulfillmentId: 'FUL-1028',
    fulfillmentNumber: 'FUL-1028',
    customerId: 'cust_quantum',
    customerName: 'Quantum Dynamics',
    customerEmail: 'finance@quantumdynamics.com',
    subtotal: 550000,
    discount: 10000,
    tax: 100000,
    shipping: 0,
    total: 640000,
    amountPaid: 640000,
    balanceDue: 0,
    currency: '₹',
    issueDate: '2026-08-20',
    dueDate: '2026-08-25',
    status: 'paid',
    paymentTerms: 'Immediate Payment',
    billTo: {
      name: 'Accounts Payable',
      company: 'Quantum Dynamics',
      address: 'Old Mahabalipuram Road, IT Corridor',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      postalCode: '600096',
    },
    items: [
      {
        id: 'ii-1028-1',
        productId: 'prod_1',
        productName: 'DealFlow Enterprise Edge AI Appliance X1',
        sku: 'DF-EDGE-X1',
        quantity: 6,
        unitPrice: 91666,
        lineTotal: 550000,
      },
    ],
    payments: [
      {
        id: 'pay-1028-1',
        invoiceId: 'INV-1028',
        amount: 640000,
        method: 'bank_transfer',
        reference: 'IMPS-QD-881920',
        paymentDate: '2026-08-22',
        status: 'completed',
        recordedBy: 'Finance Lead',
      },
    ],
    createdAt: '2026-08-20T08:00:00Z',
    updatedAt: '2026-08-22T14:00:00Z',
  },
];

function loadStoredInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(INVOICES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(DEFAULT_INVOICES));
      return DEFAULT_INVOICES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_INVOICES;
  }
}

function saveStoredInvoices(invoices: Invoice[]): void {
  try {
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
  } catch (err) {
    console.error('Failed to persist invoices', err);
  }
}

export const invoicesApi = {
  async getInvoices(filters?: InvoiceFilterOptions): Promise<Invoice[]> {
    await new Promise((r) => setTimeout(r, 60));
    let list = loadStoredInvoices();

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q) ||
          (inv.dealName && inv.dealName.toLowerCase().includes(q)) ||
          (inv.quotationNumber && inv.quotationNumber.toLowerCase().includes(q)) ||
          inv.items.some((i) => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
      );
    }

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((inv) => inv.status.toLowerCase() === filters.status!.toLowerCase());
    }

    if (filters?.customerId && filters.customerId !== 'all') {
      list = list.filter((inv) => inv.customerId === filters.customerId);
    }

    if (filters?.minAmount !== undefined) {
      list = list.filter((inv) => inv.total >= filters.minAmount!);
    }

    if (filters?.maxAmount !== undefined) {
      list = list.filter((inv) => inv.total <= filters.maxAmount!);
    }

    return list;
  },

  async getInvoice(id?: string): Promise<Invoice | null> {
    await new Promise((r) => setTimeout(r, 50));
    if (!id) return null;
    const list = loadStoredInvoices();
    return (
      list.find(
        (inv) =>
          inv.id === id ||
          inv.invoiceNumber === id ||
          inv.quotationId === id ||
          inv.dealId === id ||
          inv.fulfillmentId === id
      ) || null
    );
  },

  async recordPayment(
    invoiceId: string,
    payload: {
      amount: number;
      method: Payment['method'];
      reference: string;
      paymentDate: string;
      notes?: string;
      recordedBy?: string;
    }
  ): Promise<Invoice> {
    await new Promise((r) => setTimeout(r, 120));
    const list = loadStoredInvoices();
    const idx = list.findIndex((inv) => inv.id === invoiceId);
    if (idx === -1) throw new Error('Invoice record not found');

    const invoice = list[idx];
    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      invoiceId,
      amount: Number(payload.amount),
      method: payload.method,
      reference: payload.reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentDate: payload.paymentDate || new Date().toISOString().split('T')[0],
      status: 'completed',
      recordedBy: payload.recordedBy || 'Finance Specialist',
      notes: payload.notes,
    };

    if (!invoice.payments) invoice.payments = [];
    invoice.payments.unshift(newPayment);

    // Recalculate totals
    const totalPaid = invoice.payments.reduce((acc, p) => acc + p.amount, 0);
    invoice.amountPaid = totalPaid;
    invoice.balanceDue = Math.max(0, invoice.total - totalPaid);

    if (invoice.balanceDue === 0) {
      invoice.status = 'paid';
    } else if (invoice.amountPaid > 0) {
      invoice.status = 'partially_paid';
    }

    invoice.updatedAt = new Date().toISOString();
    list[idx] = invoice;
    saveStoredInvoices(list);
    return invoice;
  },

  async createInvoice(payload: {
    quotationId?: string;
    quotationNumber?: string;
    dealId?: string;
    dealName?: string;
    fulfillmentId?: string;
    fulfillmentNumber?: string;
    customerId: string;
    customerName: string;
    customerEmail?: string;
    items: {
      productId: string;
      productName: string;
      sku: string;
      quantity: number;
      unitPrice: number;
    }[];
    discount?: number;
    paymentTerms?: string;
    dueDate?: string;
  }): Promise<Invoice> {
    await new Promise((r) => setTimeout(r, 120));
    const list = loadStoredInvoices();

    // Check if one already exists for this quotation
    if (payload.quotationId) {
      const existing = list.find((i) => i.quotationId === payload.quotationId);
      if (existing) return existing;
    }

    const newId = `INV-${1030 + list.length}`;
    const invoiceItems = payload.items.map((it, idx) => ({
      id: `ii-${newId}-${idx + 1}`,
      productId: it.productId,
      productName: it.productName,
      sku: it.sku,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      lineTotal: it.quantity * it.unitPrice,
    }));

    const subtotal = invoiceItems.reduce((acc, i) => acc + i.lineTotal, 0);
    const discount = payload.discount || 0;
    const net = Math.max(0, subtotal - discount);
    const tax = Math.round(net * 0.18);
    const total = net + tax;

    const newInvoice: Invoice = {
      id: newId,
      invoiceNumber: newId,
      quotationId: payload.quotationId,
      quotationNumber: payload.quotationNumber,
      dealId: payload.dealId,
      dealName: payload.dealName,
      fulfillmentId: payload.fulfillmentId,
      fulfillmentNumber: payload.fulfillmentNumber,
      customerId: payload.customerId,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail || 'accounts@client.com',
      subtotal,
      discount,
      tax,
      shipping: 0,
      total,
      amountPaid: 0,
      balanceDue: total,
      currency: '₹',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate:
        payload.dueDate ||
        new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'pending',
      paymentTerms: payload.paymentTerms || 'NET 15 Days',
      items: invoiceItems,
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newInvoice);
    saveStoredInvoices(list);
    return newInvoice;
  },

  async sendInvoice(invoiceId: string): Promise<Invoice> {
    await new Promise((r) => setTimeout(r, 100));
    const list = loadStoredInvoices();
    const idx = list.findIndex((inv) => inv.id === invoiceId);
    if (idx === -1) throw new Error('Invoice not found');

    const invoice = list[idx];
    if (invoice.status === 'draft') {
      invoice.status = 'pending';
    }
    invoice.updatedAt = new Date().toISOString();
    list[idx] = invoice;
    saveStoredInvoices(list);
    return invoice;
  },

  async sendPaymentReminder(invoiceId: string): Promise<Invoice> {
    await new Promise((r) => setTimeout(r, 100));
    const list = loadStoredInvoices();
    const idx = list.findIndex((inv) => inv.id === invoiceId);
    if (idx === -1) throw new Error('Invoice not found');

    const invoice = list[idx];
    invoice.remindersSentCount = (invoice.remindersSentCount || 0) + 1;
    invoice.lastReminderSentAt = new Date().toISOString();
    invoice.updatedAt = new Date().toISOString();

    list[idx] = invoice;
    saveStoredInvoices(list);
    return invoice;
  },

  async getPayments(invoiceId: string): Promise<Payment[]> {
    await new Promise((r) => setTimeout(r, 50));
    const inv = await this.getInvoice(invoiceId);
    return inv?.payments || [];
  },
};
