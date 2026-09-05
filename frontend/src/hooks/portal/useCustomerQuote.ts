import { useQuery } from '@tanstack/react-query';
import { customerPortalApi } from '@/services/api/customerPortal.api';
import { negotiationsApi } from '@/services/api/negotiations.api';

export function useCustomerQuote(token?: string) {
  return useQuery({
    queryKey: ['portal-quote', token],
    queryFn: () => (token ? customerPortalApi.getCustomerQuote(token) : null),
    enabled: !!token,
    staleTime: 10000,
    retry: 1,
  });
}

export function useCustomerQuoteActivity(token?: string) {
  return useQuery({
    queryKey: ['portal-quote-activity', token],
    queryFn: () => (token ? customerPortalApi.getCustomerQuoteActivity(token) : []),
    enabled: !!token,
    staleTime: 5000,
  });
}

export function useNegotiation(token?: string) {
  return useQuery({
    queryKey: ['portal-negotiation', token],
    queryFn: () => (token ? negotiationsApi.getNegotiation(token) : null),
    enabled: !!token,
    staleTime: 10000,
  });
}
