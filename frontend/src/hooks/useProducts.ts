import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/services/api/products.api';
import { Product, ProductFilterOptions } from '@/types';
import { showToast } from '@/stores/toast.store';

export function useProducts(filters?: ProductFilterOptions) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.search(filters?.search || '', filters?.category, filters),
    staleTime: 30000,
  });
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => (id ? productsApi.getById(id) : null),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useProductMetrics() {
  return useQuery({
    queryKey: ['product-metrics'],
    queryFn: () => productsApi.getMetrics(),
    staleTime: 30000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
      productsApi.create(payload),
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-metrics'] });
      showToast(`Product "${newProduct.name}" created successfully`, 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to create product', 'red');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) =>
      productsApi.update(id, updates),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ['product', updatedProduct.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-metrics'] });
      showToast(`Product "${updatedProduct.name}" updated`, 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to update product', 'red');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-metrics'] });
      showToast('Product deleted from catalog', 'blue');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to delete product', 'red');
    },
  });
}
