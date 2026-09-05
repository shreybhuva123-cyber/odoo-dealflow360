import { useAuthStore } from '@/stores/auth.store';

export function useAuth() {
  const store = useAuthStore();
  return {
    user: store.user,
    role: store.role,
    permissions: store.permissions,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    login: store.login,
    logout: store.logout,
    switchRole: store.switchRole,
    hasRole: store.hasRole,
    hasPermission: store.hasPermission,
  };
}
