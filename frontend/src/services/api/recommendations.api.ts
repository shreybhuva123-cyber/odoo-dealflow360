import { apiClient } from './client';
import { Recommendation, ApiResponse } from '@/types';

export interface DealRecommendation {
  id: string;
  quotationId: string;
  productId: string;
  name: string;
  description: string;
  category: 'Hardware' | 'Service' | 'Subscription';
  price: number;
  costPrice: number;
  revenueDelta: string;
  marginDelta: string;
  tag?: string;
  isDismissed?: boolean;
}

export const MOCK_DEAL_RECOMMENDATIONS: DealRecommendation[] = [
  {
    id: 'rec_usbc',
    quotationId: 'quote_1042',
    productId: 'prod_usbc_dock',
    name: 'USB-C Dock',
    description: 'Frequently purchased with ProLaptop X1',
    category: 'Hardware',
    price: 200,
    costPrice: 120,
    revenueDelta: '+$200 Revenue',
    marginDelta: '+$80 Margin',
    tag: 'Co-purchase',
  },
  {
    id: 'rec_support',
    quotationId: 'quote_1042',
    productId: 'prod_support',
    name: 'Premium Support Plan',
    description: 'Recommended for enterprise tier customers',
    category: 'Service',
    price: 1800,
    costPrice: 800,
    revenueDelta: '+$1,800 Revenue',
    marginDelta: 'margin +6.1%',
  },
  {
    id: 'rec_warranty',
    quotationId: 'quote_1042',
    productId: 'prod_warranty',
    name: 'Extended Warranty',
    description: 'Often paired with high-volume laptop orders',
    category: 'Hardware',
    price: 2400,
    costPrice: 800,
    revenueDelta: '+$2,400 Revenue',
    marginDelta: 'margin +4.2%',
    tag: 'Promo',
  },
];

export const recommendationsApi = {
  async getForQuotation(quotationId: string): Promise<DealRecommendation[]> {
    try {
      const res = await apiClient.get<ApiResponse<DealRecommendation[]>>(`/recommendations/quote/${quotationId}`);
      return res.data.data;
    } catch {
      return MOCK_DEAL_RECOMMENDATIONS.filter((r) => !r.isDismissed);
    }
  },

  async accept(quotationId: string, recId: string): Promise<boolean> {
    return true;
  },

  async dismiss(quotationId: string, recId: string): Promise<boolean> {
    const item = MOCK_DEAL_RECOMMENDATIONS.find((r) => r.id === recId);
    if (item) item.isDismissed = true;
    return true;
  },
};
