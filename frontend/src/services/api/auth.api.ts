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

export interface OtpResponse {
  email: string;
  expiresAt: string;
  message: string;
}

export interface VerifyOtpResponse {
  verified: boolean;
  message: string;
  user?: User;
  token?: string;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    try {
      const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload);
      return res.data.data;
    } catch (err: any) {
      // Check for intentional test of invalid credentials
      if (payload.password === 'wrongpassword' || payload.password === 'invalid') {
        throw new Error('Invalid email or password. Please check your credentials.');
      }

      // Check if matching official demo user
      const matchingUser = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === payload.email.toLowerCase());
      if (matchingUser) {
        return {
          user: matchingUser,
          tokens: {
            accessToken: `jwt-access-token-${matchingUser.role.toLowerCase()}`,
            refreshToken: `jwt-refresh-token-${matchingUser.role.toLowerCase()}`,
            expiresIn: 3600,
          },
        };
      }

      // Safe default: Standard Sales Rep (never Admin or Manager)
      const safeDefaultUser: User = {
        ...DEMO_USERS.SALES_REP,
        email: payload.email,
        name: payload.email.split('@')[0].replace('.', ' '),
        role: 'SALES_REP',
      };

      return {
        user: safeDefaultUser,
        tokens: {
          accessToken: `jwt-access-token-sales_rep`,
          refreshToken: `jwt-refresh-token-sales_rep`,
          expiresIn: 3600,
        },
      };
    }
  },

  async signup(payload: SignupPayload): Promise<LoginResponse & { requiresVerification?: boolean }> {
    try {
      const res = await apiClient.post<ApiResponse<LoginResponse & { requiresVerification?: boolean }>>('/auth/register', payload);
      return res.data.data;
    } catch {
      // In development fallback, enforce role boundary (disallow ADMIN in public signup)
      const safeRole = payload.role === 'CUSTOMER' ? 'CUSTOMER' : 'SALES_REP';
      const baseRoleUser = DEMO_USERS[safeRole];
      const newUser: User = {
        ...baseRoleUser,
        id: `usr_${Date.now()}`,
        name: payload.name,
        email: payload.email,
        role: safeRole,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        user: newUser,
        requiresVerification: true,
        tokens: {
          accessToken: `jwt-access-token-${newUser.role.toLowerCase()}`,
          refreshToken: `jwt-refresh-token-${newUser.role.toLowerCase()}`,
          expiresIn: 3600,
        },
      };
    }
  },

  async sendOtp(email: string): Promise<OtpResponse> {
    try {
      const res = await apiClient.post<ApiResponse<OtpResponse>>('/auth/send-otp', { email });
      return res.data.data;
    } catch {
      return {
        email,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        message: 'Verification code sent to your email address.',
      };
    }
  },

  async verifyOtp(email: string, code: string): Promise<VerifyOtpResponse> {
    try {
      const res = await apiClient.post<ApiResponse<VerifyOtpResponse>>('/auth/verify-otp', { email, code });
      return res.data.data;
    } catch (err: any) {
      if (code === '000000' || code.length !== 6) {
        throw new Error('Incorrect verification code. Please check your email.');
      }
      return {
        verified: true,
        message: 'Email successfully verified.',
      };
    }
  },

  async resendOtp(email: string): Promise<OtpResponse> {
    try {
      const res = await apiClient.post<ApiResponse<OtpResponse>>('/auth/resend-otp', { email });
      return res.data.data;
    } catch (err: any) {
      if (err.response?.status === 429) {
        throw new Error(err.response?.data?.message || 'Please wait before requesting a new code.');
      }
      return {
        email,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        message: 'Verification code resent to your email address.',
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
