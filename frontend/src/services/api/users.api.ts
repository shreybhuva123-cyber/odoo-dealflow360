import { apiClient } from './client';
import { User, ApiResponse } from '@/types';
import { DEMO_USERS } from '@/constants/roles';

export const usersApi = {
  async getAll(): Promise<User[]> {
    try {
      const res = await apiClient.get<ApiResponse<User[]>>('/users');
      return res.data.data;
    } catch {
      return Object.values(DEMO_USERS);
    }
  },

  async getById(id: string): Promise<User | null> {
    try {
      const res = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
      return res.data.data;
    } catch {
      return Object.values(DEMO_USERS).find((u) => u.id === id) || null;
    }
  },
};
