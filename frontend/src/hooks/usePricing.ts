import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pricingApi } from '@/services/api/pricing.api';
import { PricingRule, PricingCustomerTier } from '@/types';
import { showToast } from '@/stores/toast.store';

export function usePricingOverview() {
  return useQuery({
    queryKey: ['pricing-overview'],
    queryFn: () => pricingApi.getOverview(),
    staleTime: 30000,
  });
}

export function usePricingRules() {
  return useQuery({
    queryKey: ['pricing-rules'],
    queryFn: () => pricingApi.getRules(),
    staleTime: 30000,
  });
}

export function usePricingRule(id?: string) {
  return useQuery({
    queryKey: ['pricing-rule', id],
    queryFn: () => (id ? pricingApi.getRuleById(id) : null),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useCreatePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<PricingRule, 'id' | 'createdAt' | 'updatedAt'>) =>
      pricingApi.createRule(payload),
    onSuccess: (newRule) => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      queryClient.invalidateQueries({ queryKey: ['pricing-overview'] });
      showToast(`Rule "${newRule.name}" created`, 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to create pricing rule', 'red');
    },
  });
}

export function useUpdatePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PricingRule> }) =>
      pricingApi.updateRule(id, updates),
    onSuccess: (updatedRule) => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rule', updatedRule.id] });
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      queryClient.invalidateQueries({ queryKey: ['pricing-overview'] });
      showToast(`Rule "${updatedRule.name}" saved`, 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to update rule', 'red');
    },
  });
}

export function useDeletePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pricingApi.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      queryClient.invalidateQueries({ queryKey: ['pricing-overview'] });
      showToast('Pricing rule removed', 'blue');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to delete rule', 'red');
    },
  });
}

export function useTogglePricingRuleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pricingApi.toggleRuleStatus(id),
    onSuccess: (updatedRule) => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      queryClient.invalidateQueries({ queryKey: ['pricing-overview'] });
      showToast(
        `Rule "${updatedRule.name}" is now ${updatedRule.isActive ? 'Active' : 'Inactive'}`,
        updatedRule.isActive ? 'green' : 'amber'
      );
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to toggle rule status', 'red');
    },
  });
}

export function useCustomerTiers() {
  return useQuery({
    queryKey: ['customer-tiers'],
    queryFn: () => pricingApi.getTiers(),
    staleTime: 30000,
  });
}

export function useCustomerTier(id?: string) {
  return useQuery({
    queryKey: ['customer-tier', id],
    queryFn: () => (id ? pricingApi.getTierById(id) : null),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useUpdateCustomerTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PricingCustomerTier> }) =>
      pricingApi.updateTier(id, updates),
    onSuccess: (updatedTier) => {
      queryClient.invalidateQueries({ queryKey: ['customer-tier', updatedTier.id] });
      queryClient.invalidateQueries({ queryKey: ['customer-tiers'] });
      queryClient.invalidateQueries({ queryKey: ['discount-governance-matrix'] });
      showToast(`Customer tier "${updatedTier.name}" updated`, 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to update customer tier', 'red');
    },
  });
}

export function useDiscountGovernanceMatrix() {
  return useQuery({
    queryKey: ['discount-governance-matrix'],
    queryFn: () => pricingApi.getDiscountGovernanceMatrix(),
    staleTime: 30000,
  });
}
