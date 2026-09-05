import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '@/services/api/billing.api';
import { BillingFilterOptions, BillingSchedule } from '@/types';
import { showToast } from '@/stores/toast.store';

export function useBillingStats() {
  return useQuery({
    queryKey: ['billing-stats'],
    queryFn: () => billingApi.getBillingStats(),
    staleTime: 60000,
  });
}

export function useBillingSchedules(filters?: BillingFilterOptions) {
  return useQuery({
    queryKey: ['billing-schedules', filters],
    queryFn: () => billingApi.getBillingSchedules(filters),
    staleTime: 30000,
  });
}

export function useBillingSchedule(id?: string) {
  return useQuery({
    queryKey: ['billing-schedule', id],
    queryFn: () => billingApi.getBillingSchedule(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useUpdateBillingSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BillingSchedule> }) =>
      billingApi.updateBillingSchedule(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['billing-schedule', updated.id] });
      queryClient.invalidateQueries({ queryKey: ['billing-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      showToast('Billing schedule updated successfully', 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to update schedule', 'red');
    },
  });
}
