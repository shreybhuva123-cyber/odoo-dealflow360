import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/api/admin.api';
import { AdminUser, Role, PermissionModule, PermissionAction, SystemSettings } from '@/types';
import { showToast } from '@/stores/toast.store';

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers(),
    staleTime: 30000,
  });
}

export function useAdminUser(id?: string) {
  return useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => (id ? adminApi.getUserById(id) : null),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<AdminUser, 'id' | 'createdAt'>) => adminApi.createUser(payload),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-log'] });
      showToast(`User "${newUser.name}" successfully created`, 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to create user', 'red');
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AdminUser> }) =>
      adminApi.updateUser(id, updates),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', updatedUser.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-log'] });
      showToast(`User "${updatedUser.name}" updated`, 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to update user', 'red');
    },
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.toggleUserStatus(id),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-log'] });
      showToast(
        `User ${updatedUser.name} is now ${updatedUser.status.toLowerCase()}`,
        updatedUser.status === 'ACTIVE' ? 'green' : 'amber'
      );
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to change user status', 'red');
    },
  });
}

export function useRolePermissions() {
  return useQuery({
    queryKey: ['role-permissions'],
    queryFn: () => adminApi.getRolePermissions(),
    staleTime: 30000,
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      role,
      permissions,
    }: {
      role: Role;
      permissions: Record<PermissionModule, PermissionAction[]>;
    }) => adminApi.updateRolePermissions(role, permissions),
    onSuccess: (config) => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-log'] });
      showToast(`Permissions for ${config.roleName} updated`, 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to update role permissions', 'red');
    },
  });
}

export function useSystemSettings() {
  return useQuery({
    queryKey: ['system-settings'],
    queryFn: () => adminApi.getSettings(),
    staleTime: 30000,
  });
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<SystemSettings>) => adminApi.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-log'] });
      showToast('System configuration saved successfully', 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to update system settings', 'red');
    },
  });
}

export function useAdminAuditLog() {
  return useQuery({
    queryKey: ['admin-audit-log'],
    queryFn: () => adminApi.getAuditLog(),
    staleTime: 15000,
  });
}
