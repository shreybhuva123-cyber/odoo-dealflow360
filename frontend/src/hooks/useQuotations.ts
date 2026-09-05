import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationsApi } from '@/services/api/quotations.api';
import { productsApi } from '@/services/api/products.api';
import { customersApi } from '@/services/api/customers.api';
import { recommendationsApi, DealRecommendation } from '@/services/api/recommendations.api';
import { Quotation, Product, Customer } from '@/types';
import { showToast } from '@/stores/toast.store';

export const QUOTATION_QUERY_KEYS = {
  all: ['quotations'] as const,
  lists: () => [...QUOTATION_QUERY_KEYS.all, 'list'] as const,
  detail: (id: string) => [...QUOTATION_QUERY_KEYS.all, 'detail', id] as const,
  products: ['products'] as const,
  customers: ['customers'] as const,
  recommendations: (id: string) => ['recommendations', id] as const,
};

export function useQuotations() {
  return useQuery<Quotation[]>({
    queryKey: QUOTATION_QUERY_KEYS.lists(),
    queryFn: () => quotationsApi.getAll(),
  });
}

export function useQuotation(id: string | undefined) {
  return useQuery<Quotation | null>({
    queryKey: QUOTATION_QUERY_KEYS.detail(id || 'new'),
    queryFn: () => (id ? quotationsApi.getById(id) : null),
    enabled: !!id && id !== 'new',
  });
}

export function useProducts(category?: string) {
  return useQuery<Product[]>({
    queryKey: [...QUOTATION_QUERY_KEYS.products, category || 'all'],
    queryFn: () => productsApi.search('', category),
  });
}

export function useCustomers() {
  return useQuery<Customer[]>({
    queryKey: QUOTATION_QUERY_KEYS.customers,
    queryFn: () => customersApi.getAll(),
  });
}

export function useRecommendations(quotationId: string = 'quote_1042') {
  return useQuery<DealRecommendation[]>({
    queryKey: QUOTATION_QUERY_KEYS.recommendations(quotationId),
    queryFn: () => recommendationsApi.getForQuotation(quotationId),
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<Quotation>) => quotationsApi.create(payload),
    onSuccess: (newQuote) => {
      queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEYS.all });
      showToast(`✓ Quotation created successfully — ${newQuote.quoteNumber}`, 'green');
    },
    onError: () => {
      showToast('Failed to create quotation', 'red');
    },
  });
}

export function useUpdateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Quotation> }) =>
      quotationsApi.update(id, data),
    onSuccess: (updatedQuote) => {
      queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEYS.all });
      queryClient.setQueryData(QUOTATION_QUERY_KEYS.detail(updatedQuote.id), updatedQuote);
      showToast(`✓ Quotation saved successfully — ${updatedQuote.quoteNumber}`, 'green');
    },
    onError: () => {
      showToast('Failed to save quotation', 'red');
    },
  });
}

export function useSubmitQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotationsApi.submit(id),
    onSuccess: (submittedQuote) => {
      queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEYS.all });
      queryClient.setQueryData(QUOTATION_QUERY_KEYS.detail(submittedQuote.id), submittedQuote);
      showToast(`Quotation ${submittedQuote.quoteNumber} submitted for approval`, 'amber');
    },
    onError: () => {
      showToast('Failed to submit quotation', 'red');
    },
  });
}
