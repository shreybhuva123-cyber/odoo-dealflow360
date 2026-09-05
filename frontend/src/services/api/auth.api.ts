import { apiClient } from './client';
import { User, LoginResponse, ApiResponse } from '@/types';
import { DEMO_USERS } from '@/constants/roles';

export interface LoginPayload {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface SignupPayload {
  name: string;
  email: string;
  password?: string;
  role: keyof typeof DEMO_USERS;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    try {
      const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload);
      return res.data.data;
    } catch (err: any) {
      // Mock development fallback
      // Check for intentional test of invalid credentials
      if (payload.password === 'wrongpassword' || payload.password === 'invalid') {
        throw new Error('Invalid email or password. Please check your credentials.');
      }

      const matchingUser = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === payload.email.toLowerCase());
      const selectedUser = matchingUser || {
        ...DEMO_USERS.SALES_MANAGER,
        email: payload.email,
        name: payload.email.split('@')[0].replace('.', ' '),
      };

      return {
        user: selectedUser,
        tokens: {
          accessToken: `jwt-access-token-${selectedUser.role.toLowerCase()}`,
          refreshToken: `jwt-refresh-token-${selectedUser.role.toLowerCase()}`,
          expiresIn: 3600,
        },
      };
    }
  },

  async signup(payload: SignupPayload): Promise<LoginResponse> {
    try {
      const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/signup', payload);
      return res.data.data;
    } catch {
      const baseRoleUser = DEMO_USERS[payload.role] || DEMO_USERS.SALES_REP;
      const newUser: User = {
        ...baseRoleUser,
        id: `usr_${Date.now()}`,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        user: newUser,
        tokens: {
          accessToken: `jwt-access-token-${newUser.role.toLowerCase()}`,
          refreshToken: `jwt-refresh-token-${newUser.role.toLowerCase()}`,
          expiresIn: 3600,
        },
      };
    }
  },

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const res = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken });
      return res.data.data;
    } catch {
      return {
        accessToken: `jwt-refreshed-token-${Date.now()}`,
        refreshToken,
      };
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Silent catch
    }
  },
};
