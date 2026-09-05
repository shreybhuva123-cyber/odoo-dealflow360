import { create } from 'zustand';
import { User, Role, Permission } from '@/types';
import { tokenStorage } from '@/services/storage/tokenStorage';
import { DEMO_USERS } from '@/constants/roles';

interface AuthState {
  user: User | null;
  role: Role | null;
  permissions: Permission[];
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (user: User, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  switchRole: (role: Role) => void;
  hasRole: (roles: Role | Role[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
  setLoading: (loading: boolean) => void;
}

// Hydrate from localStorage if existing, otherwise start logged in with Sales Manager for hackathon demo review
const savedUser = tokenStorage.getUserData<User>();
const savedAccessToken = tokenStorage.getAccessToken();
const savedRefreshToken = tokenStorage.getRefreshToken();

// Initial user: if saved in storage use it, or initialize demo session
const initialUser = savedUser ?? DEMO_USERS.SALES_MANAGER;
const initialAccessToken = savedAccessToken ?? 'demo-jwt-access-token';
const initialRefreshToken = savedRefreshToken ?? 'demo-jwt-refresh-token';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  role: initialUser?.role ?? null,
  permissions: initialUser?.permissions ?? [],
  accessToken: initialAccessToken,
  refreshToken: initialRefreshToken,
  isAuthenticated: !!initialUser && !!initialAccessToken,
  isLoading: false,

  login: (user: User, accessToken: string, refreshToken?: string) => {
    tokenStorage.setAccessToken(accessToken);
    if (refreshToken) tokenStorage.setRefreshToken(refreshToken);
    tokenStorage.setUserData(user);

    set({
      user,
      role: user.role,
      permissions: user.permissions,
      accessToken,
      refreshToken: refreshToken || null,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    tokenStorage.clearAll();
    set({
      user: null,
      role: null,
      permissions: [],
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setTokens: (accessToken: string, refreshToken?: string) => {
    tokenStorage.setAccessToken(accessToken);
    if (refreshToken) tokenStorage.setRefreshToken(refreshToken);
    set((state) => ({
      accessToken,
      refreshToken: refreshToken ?? state.refreshToken,
    }));
  },

  switchRole: (newRole: Role) => {
    const demoUser = DEMO_USERS[newRole];
    if (demoUser) {
      tokenStorage.setUserData(demoUser);
      tokenStorage.setAccessToken(`demo-token-${newRole.toLowerCase()}`);
      set({
        user: demoUser,
        role: demoUser.role,
        permissions: demoUser.permissions,
        accessToken: `demo-token-${newRole.toLowerCase()}`,
        isAuthenticated: true,
      });
    }
  },

  hasRole: (roles: Role | Role[]) => {
    const currentRole = get().role;
    if (!currentRole) return false;
    if (Array.isArray(roles)) {
      return roles.includes(currentRole);
    }
    return currentRole === roles;
  },

  hasPermission: (permission: Permission) => {
    const currentPerms = get().permissions;
    return currentPerms.includes(permission);
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
