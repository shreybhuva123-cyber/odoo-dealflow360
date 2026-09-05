import { NegotiationRequest, NegotiationItemRequest } from '@/types';
import { customerPortalApi } from './customerPortal.api';

const NEGOTIATIONS_KEY = 'dealflow_negotiations_v2';

const INITIAL_NEGOTIATIONS: Record<string, NegotiationRequest> = {
  portal_apex_1001_secure: {
    id: 'neg_101',
    quoteId: 'quote_1001',
    quoteNumber: 'QT-2026-088',
    token: 'portal_apex_1001_secure',
    customerName: 'Apex Logistics Ltd',
    customerEmail: 'ops-procurement@apexlogistics.com',
    items: [
      {
        itemId: 'cqi_apex_1',
        productName: 'Enterprise Fleet Tracker Pro',
        currentQuantity: 25,
        requestedQuantity: 30,
        currentPrice: 12000,
        requestedPrice: 11000,
        note: 'Increasing fleet volume by 5 units if rate is lowered to ₹11,000',
      },
    ],
    message:
      'We would like to commit to a larger order size of 30 units if we can get ₹11,000 per tracker. Looking forward to your revised quote.',
    createdAt: '2026-09-03T14:30:00Z',
    status: 'accepted',
    salesRepResponse: 'Revised quote issued as Version 2 with volume discount applied.',
  },
};

function loadStoredNegotiations(): Record<string, NegotiationRequest> {
  try {
    const raw = localStorage.getItem(NEGOTIATIONS_KEY);
    if (!raw) {
      localStorage.setItem(NEGOTIATIONS_KEY, JSON.stringify(INITIAL_NEGOTIATIONS));
      return { ...INITIAL_NEGOTIATIONS };
    }
    return JSON.parse(raw);
  } catch {
    return { ...INITIAL_NEGOTIATIONS };
  }
}

function saveStoredNegotiations(data: Record<string, NegotiationRequest>): void {
  try {
    localStorage.setItem(NEGOTIATIONS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save negotiations to localStorage', e);
  }
}

export const negotiationsApi = {
  async getNegotiation(token: string): Promise<NegotiationRequest | null> {
    await new Promise((r) => setTimeout(r, 120));
    const all = loadStoredNegotiations();
    return all[token] || null;
  },

  async submitNegotiation(
    token: string,
    payload: {
      items: NegotiationItemRequest[];
      message: string;
      customerName: string;
      customerEmail?: string;
    }
  ): Promise<NegotiationRequest> {
    await new Promise((r) => setTimeout(r, 250));
    const quote = await customerPortalApi.getCustomerQuote(token);
    if (!quote) throw new Error('Referenced quotation not found or invalid token');

    const newNegotiation: NegotiationRequest = {
      id: `neg_${Date.now()}`,
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      token,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail || quote.customerEmail,
      items: payload.items,
      message: payload.message,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    const all = loadStoredNegotiations();
    all[token] = newNegotiation;
    saveStoredNegotiations(all);

    // Synchronize quote status and timeline event
    await customerPortalApi.requestQuoteChanges(token, {
      items: payload.items,
      message: payload.message,
      customerName: payload.customerName,
    });

    return newNegotiation;
  },

  async listNegotiations(): Promise<NegotiationRequest[]> {
    await new Promise((r) => setTimeout(r, 150));
    const all = loadStoredNegotiations();
    return Object.values(all);
  },
};
