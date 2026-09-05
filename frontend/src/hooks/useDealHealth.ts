import { useQuery } from '@tanstack/react-query';
import { dealHealthApi } from '@/services/api/dealHealth.api';
import { DealHealthFilterOptions } from '@/types';

export function useDealHealthDashboard(filters?: DealHealthFilterOptions) {
  return useQuery({
    queryKey: ['deal-health-dashboard', filters],
    queryFn: () => dealHealthApi.getDealHealthDashboard(filters),
    staleTime: 30000,
  });
}

export function useDealHealthDetail(dealId?: string) {
  return useQuery({
    queryKey: ['deal-health-detail', dealId],
    queryFn: () => (dealId ? dealHealthApi.getDealHealth(dealId) : null),
    enabled: !!dealId,
    staleTime: 30000,
  });
}

export function useDealHealthMetrics(quotationId?: string) {
  return useQuery({
    queryKey: ['deal-health-metrics', quotationId],
    queryFn: () => (quotationId ? dealHealthApi.getMetrics(quotationId) : []),
    enabled: !!quotationId,
    staleTime: 30000,
  });
}

export function useDealHealthEvents(quotationId?: string) {
  return useQuery({
    queryKey: ['deal-health-events', quotationId],
    queryFn: () => dealHealthApi.getEvents(quotationId),
    staleTime: 30000,
  });
}
