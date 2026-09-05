import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@/services/api/subscriptions.api';
import { SubscriptionFilterOptions } from '@/types';
import { showToast } from '@/stores/toast.store';

export function useSubscriptions(filters?: SubscriptionFilterOptions) {
  return useQuery({
    queryKey: ['subscriptions', filters],
    queryFn: () => subscriptionsApi.getSubscriptions(filters),
    staleTime: 30000,
  });
}

export function useSubscription(id?: string) {
  return useQuery({
    queryKey: ['subscription', id],
    queryFn: () => subscriptionsApi.getSubscription(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function usePauseSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionsApi.pauseSubscription(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', updated.id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      showToast(`Subscription ${updated.id} paused`, 'amber');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to pause subscription', 'red');
    },
  });
}

export function useResumeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionsApi.resumeSubscription(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', updated.id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      showToast(`Subscription ${updated.id} reactivated`, 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to reactivate subscription', 'red');
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionsApi.cancelSubscription(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', updated.id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      showToast(`Subscription ${updated.id} cancelled`, 'red');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to cancel subscription', 'red');
    },
  });
}
