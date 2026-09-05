import { apiClient } from './client';
import { Customer, ApiResponse } from '@/types';

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust_acme',
    companyName: 'Acme Corporation',
    industry: 'Enterprise Technology',
    tier: 'ENTERPRISE',
    country: 'United States',
    currency: 'USD',
    accountManagerId: 'usr_rep_1',
    isActive: true,
    contacts: [
      { id: 'cnt_acme', name: 'John Miller', email: 'john@acmecorp.com', phone: '+1 555-0199', isPrimary: true, roleTitle: 'Director of Procurement' },
    ],
    creditProfile: {
      creditLimit: 250000,
      availableCredit: 195000,
      paymentTerms: 'NET30',
      riskRating: 'LOW',
      overdueBalance: 0,
    },
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-02-15T12:00:00Z',
  },
  {
    id: 'cust_techcorp',
    companyName: 'TechCorp International',
    industry: 'Cloud Infrastructure',
    tier: 'ENTERPRISE',
    country: 'United States',
    currency: 'USD',
    accountManagerId: 'usr_rep_1',
    isActive: true,
    contacts: [
      { id: 'cnt_tc', name: 'Alicia Vance', email: 'avance@techcorp.io', phone: '+1 555-0245', isPrimary: true, roleTitle: 'VP Infrastructure' },
    ],
    creditProfile: {
      creditLimit: 180000,
      availableCredit: 120000,
      paymentTerms: 'NET30',
      riskRating: 'LOW',
      overdueBalance: 0,
    },
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'cust_nova',
    companyName: 'Nova Ltd',
    industry: 'Digital Media & Software',
    tier: 'SMB',
    country: 'United Kingdom',
    currency: 'USD',
    accountManagerId: 'usr_rep_3',
    isActive: true,
    contacts: [
      { id: 'cnt_nova', name: 'David Smith', email: 'd.smith@novaltd.co.uk', phone: '+44 20 7946 0991', isPrimary: true, roleTitle: 'CTO' },
    ],
    creditProfile: {
      creditLimit: 50000,
      availableCredit: 42000,
      paymentTerms: 'NET15',
      riskRating: 'MEDIUM',
      overdueBalance: 0,
    },
    createdAt: '2026-03-01T11:00:00Z',
    updatedAt: '2026-03-02T14:00:00Z',
  },
  {
    id: 'cust_vertex',
    companyName: 'Vertex LLC',
    industry: 'Logistics Automation',
    tier: 'ENTERPRISE',
    country: 'United States',
    currency: 'USD',
    accountManagerId: 'usr_rep_1',
    isActive: true,
    contacts: [
      { id: 'cnt_vertex', name: 'Marcus Brody', email: 'm.brody@vertex.com', phone: '+1 555-0812', isPrimary: true, roleTitle: 'Operations VP' },
    ],
    creditProfile: {
      creditLimit: 300000,
      availableCredit: 209000,
      paymentTerms: 'NET30',
      riskRating: 'LOW',
      overdueBalance: 0,
    },
    createdAt: '2026-01-15T14:00:00Z',
    updatedAt: '2026-02-28T16:00:00Z',
  },
  {
    id: 'cust_beta',
    companyName: 'Beta Industries',
    industry: 'Advanced Manufacturing',
    tier: 'MID_MARKET',
    country: 'Germany',
    currency: 'EUR',
    accountManagerId: 'usr_rep_2',
    isActive: true,
    contacts: [
      { id: 'cnt_beta', name: 'Hans Mueller', email: 'h.mueller@betaind.de', phone: '+49 30 901820', isPrimary: true, roleTitle: 'Procurement Lead' },
    ],
    creditProfile: {
      creditLimit: 150000,
      availableCredit: 131800,
      paymentTerms: 'NET45',
      riskRating: 'LOW',
      overdueBalance: 0,
    },
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-03-01T12:00:00Z',
  },
];

const STORAGE_KEY = 'dealflow_customers_v2';

function loadStoredCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load customers from storage', e);
  }
  return MOCK_CUSTOMERS;
}

function saveStoredCustomers(customers: Customer[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  } catch (e) {
    console.warn('Failed to save customers to storage', e);
  }
}

export const customersApi = {
  async getAll(): Promise<Customer[]> {
    try {
      const res = await apiClient.get<ApiResponse<Customer[]>>('/customers');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        saveStoredCustomers(res.data.data);
        return res.data.data;
      }
      return loadStoredCustomers();
    } catch {
      return loadStoredCustomers();
    }
  },

  async search(query: string, tier?: string): Promise<Customer[]> {
    const all = await customersApi.getAll();
    const q = query.toLowerCase().trim();
    return all.filter((c) => {
      const matchesQ =
        !q ||
        c.companyName.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q);
      const matchesTier = !tier || tier === 'ALL' || c.tier === tier;
      return matchesQ && matchesTier;
    });
  },

  async getById(id: string): Promise<Customer | null> {
    try {
      const res = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
      return res.data.data;
    } catch {
      const list = loadStoredCustomers();
      return list.find((c) => c.id === id || c.companyName.toLowerCase() === id.toLowerCase()) || null;
    }
  },

  async create(payload: Partial<Customer>): Promise<Customer> {
    try {
      const res = await apiClient.post<ApiResponse<Customer>>('/customers', payload);
      return res.data.data;
    } catch {
      const list = loadStoredCustomers();
      const newCustomer: Customer = {
        id: `cust_${Date.now()}`,
        companyName: payload.companyName || 'New Client Enterprise',
        industry: payload.industry || 'General Commerce',
        tier: payload.tier || 'SMB',
        country: payload.country || 'United States',
        currency: payload.currency || 'USD',
        accountManagerId: payload.accountManagerId || 'usr_rep_1',
        isActive: true,
        contacts: payload.contacts || [
          {
            id: `cnt_${Date.now()}`,
            name: 'Primary Contact',
            email: 'contact@client.com',
            phone: '+1 555-0100',
            isPrimary: true,
            roleTitle: 'Procurement Lead',
          },
        ],
        creditProfile: payload.creditProfile || {
          creditLimit: 100000,
          availableCredit: 100000,
          paymentTerms: 'NET30',
          riskRating: 'LOW',
          overdueBalance: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [newCustomer, ...list];
      saveStoredCustomers(updated);
      return newCustomer;
    }
  },

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    try {
      const res = await apiClient.patch<ApiResponse<Customer>>(`/customers/${id}`, updates);
      return res.data.data;
    } catch {
      const list = loadStoredCustomers();
      const idx = list.findIndex((c) => c.id === id);
      if (idx >= 0) {
        const updated = {
          ...list[idx],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        list[idx] = updated;
        saveStoredCustomers(list);
        return updated;
      }
      return { ...MOCK_CUSTOMERS[0], ...updates };
    }
  },

  async updateCredit(id: string, creditProfile: Partial<Customer['creditProfile']>): Promise<Customer> {
    const list = loadStoredCustomers();
    const idx = list.findIndex((c) => c.id === id);
    if (idx >= 0) {
      const updated = {
        ...list[idx],
        creditProfile: {
          ...list[idx].creditProfile,
          ...creditProfile,
        },
        updatedAt: new Date().toISOString(),
      };
      list[idx] = updated;
      saveStoredCustomers(list);
      return updated;
    }
    throw new Error(`Customer ${id} not found`);
  },
};

