import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehousesApi } from '@/services/api/warehouses.api';
import { WarehouseFilterOptions } from '@/types';
import { showToast } from '@/stores/toast.store';

export function useWarehouses(filters?: { search?: string }) {
  return useQuery({
    queryKey: ['warehouses', filters],
    queryFn: () => warehousesApi.getWarehouses(filters),
    staleTime: 60000,
  });
}

export function useWarehouse(id?: string) {
  return useQuery({
    queryKey: ['warehouse', id],
    queryFn: () => warehousesApi.getWarehouse(id),
    enabled: !!id,
    staleTime: 60000,
  });
}

export function useWarehouseStats() {
  return useQuery({
    queryKey: ['warehouse-stats'],
    queryFn: () => warehousesApi.getWarehouseStats(),
    staleTime: 60000,
  });
}

export function useWarehouseInventory(warehouseId?: string, filters?: WarehouseFilterOptions) {
  return useQuery({
    queryKey: ['warehouse-inventory', warehouseId, filters],
    queryFn: () => (warehouseId ? warehousesApi.getWarehouseInventory(warehouseId, filters) : []),
    enabled: !!warehouseId,
    staleTime: 30000,
  });
}

export function useStockAvailability(productIdOrSku?: string) {
  return useQuery({
    queryKey: ['stock-availability', productIdOrSku],
    queryFn: () => (productIdOrSku ? warehousesApi.getStockAvailability(productIdOrSku) : null),
    enabled: !!productIdOrSku,
    staleTime: 30000,
  });
}

export function useRestockInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      warehouseId,
      itemId,
      quantity,
    }: {
      warehouseId: string;
      itemId: string;
      quantity: number;
    }) => warehousesApi.restockInventoryItem(warehouseId, itemId, quantity),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-inventory', variables.warehouseId] });
      queryClient.invalidateQueries({ queryKey: ['warehouse', variables.warehouseId] });
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-stats'] });
      queryClient.invalidateQueries({ queryKey: ['stock-availability'] });
      showToast('Inventory replenishment logged successfully', 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to replenish stock', 'red');
    },
  });
}
