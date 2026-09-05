import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fulfillmentApi,
} from '@/services/api/fulfillment.api';
import {
  FulfillmentFilterOptions,
  FulfillmentStatus,
} from '@/types';
import { showToast } from '@/stores/toast.store';

export function useFulfillments(filters?: FulfillmentFilterOptions) {
  return useQuery({
    queryKey: ['fulfillments', filters],
    queryFn: () => fulfillmentApi.getFulfillments(filters),
    staleTime: 30000,
  });
}

export function useFulfillment(id?: string) {
  return useQuery({
    queryKey: ['fulfillment', id],
    queryFn: () => fulfillmentApi.getFulfillment(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useFulfillmentStats() {
  return useQuery({
    queryKey: ['fulfillment-stats'],
    queryFn: () => fulfillmentApi.getFulfillmentStats(),
    staleTime: 60000,
  });
}

export function useFulfillmentItems(fulfillmentId?: string) {
  return useQuery({
    queryKey: ['fulfillment-items', fulfillmentId],
    queryFn: () => (fulfillmentId ? fulfillmentApi.getFulfillmentItems(fulfillmentId) : []),
    enabled: !!fulfillmentId,
    staleTime: 30000,
  });
}

export function useFulfillmentActivity(fulfillmentId?: string) {
  return useQuery({
    queryKey: ['fulfillment-activity', fulfillmentId],
    queryFn: () => (fulfillmentId ? fulfillmentApi.getFulfillmentActivity(fulfillmentId) : []),
    enabled: !!fulfillmentId,
    staleTime: 30000,
  });
}

export function useAllocateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fulfillmentId,
      itemId,
      allocations,
      authorName,
      note,
    }: {
      fulfillmentId: string;
      itemId: string;
      allocations: { warehouseId: string; warehouseName: string; quantity: number }[];
      authorName?: string;
      note?: string;
    }) =>
      fulfillmentApi.allocateInventory(
        fulfillmentId,
        itemId,
        allocations,
        authorName,
        note
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fulfillment', variables.fulfillmentId] });
      queryClient.invalidateQueries({ queryKey: ['fulfillments'] });
      queryClient.invalidateQueries({ queryKey: ['fulfillment-stats'] });
      queryClient.invalidateQueries({ queryKey: ['fulfillment-items', variables.fulfillmentId] });
      queryClient.invalidateQueries({ queryKey: ['fulfillment-activity', variables.fulfillmentId] });
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-stats'] });
      queryClient.invalidateQueries({ queryKey: ['stock-availability'] });
      showToast('Warehouse inventory allocated successfully', 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to allocate warehouse stock', 'red');
    },
  });
}

export function useUpdateFulfillmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      authorName,
      note,
    }: {
      id: string;
      status: FulfillmentStatus;
      authorName?: string;
      note?: string;
    }) => fulfillmentApi.updateFulfillmentStatus(id, status, authorName, note),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['fulfillment', updatedOrder.id] });
      queryClient.invalidateQueries({ queryKey: ['fulfillments'] });
      queryClient.invalidateQueries({ queryKey: ['fulfillment-stats'] });
      queryClient.invalidateQueries({ queryKey: ['fulfillment-activity', updatedOrder.id] });
      showToast(`Fulfillment status updated to ${updatedOrder.status.replace('_', ' ').toUpperCase()}`, 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Status update failed', 'red');
    },
  });
}

export function useCreateFulfillment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      quotationId: string;
      quotationNumber?: string;
      dealId: string;
      dealName?: string;
      customerId: string;
      customerName: string;
      priority?: 'low' | 'normal' | 'high' | 'critical';
      items: {
        productId: string;
        productName: string;
        sku: string;
        quantity: number;
      }[];
    }) => fulfillmentApi.createFulfillment(payload),
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: ['fulfillments'] });
      queryClient.invalidateQueries({ queryKey: ['fulfillment-stats'] });
      showToast(`Fulfillment order ${newOrder.id} created successfully`, 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to create fulfillment order', 'red');
    },
  });
}
