import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '@/services/api/customers.api';
import { Customer } from '@/types';
import { showToast } from '@/stores/toast.store';

export function useCustomers(search?: string, tier?: string) {
  return useQuery({
    queryKey: ['customers', { search, tier }],
    queryFn: () => customersApi.search(search || '', tier),
    staleTime: 30000,
  });
}

export function useCustomer(id?: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => (id ? customersApi.getById(id) : null),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<Customer>) => customersApi.create(payload),
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      showToast(`Customer "${newCustomer.companyName}" created successfully`, 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to create customer', 'red');
    },
  });
}

export function useUpdateCustomerCredit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, creditProfile }: { id: string; creditProfile: Partial<Customer['creditProfile']> }) =>
      customersApi.updateCredit(id, creditProfile),
    onSuccess: (updatedCustomer) => {
      queryClient.invalidateQueries({ queryKey: ['customer', updatedCustomer.id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      showToast(`Credit profile updated for ${updatedCustomer.companyName}`, 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to update credit profile', 'red');
    },
  });
}
