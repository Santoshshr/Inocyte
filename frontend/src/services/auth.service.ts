import { apiClient } from '../api/client';
import type { AuthResponse, User } from '../types/auth.types';

export const authService = {
  login: async (credentials: Record<string, string>): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/login/', credentials);
    return data.data;
  },

  register: async (userData: Record<string, string>): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/register/', userData);
    return data.data;
  },

  logout: async (refresh: string): Promise<void> => {
    await apiClient.post('/auth/logout/', { refresh });
  },

  getProfile: async (): Promise<{ status: string; data: User }> => {
    const { data } = await apiClient.get('/users/me/');
    return data;
  },
};
