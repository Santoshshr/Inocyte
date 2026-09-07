import { apiClient } from '../api/client';
import type { User } from '../types/auth.types';
import type { PaginatedResponse } from '../types/company.types';

export const userService = {
  getUsers: async (params?: any): Promise<PaginatedResponse<User>> => {
    const { data } = await apiClient.get('/users/', { params });
    return data;
  },

  getUser: async (id: string): Promise<{ data: User }> => {
    const { data } = await apiClient.get(`/users/${id}/`);
    return data;
  },

  updateUser: async (id: string, updateData: Partial<User>): Promise<{ data: User }> => {
    const { data } = await apiClient.patch(`/users/${id}/`, updateData);
    return data;
  },

  createUser: async (userData: any): Promise<{ data: User }> => {
    const { data } = await apiClient.post('/users/', userData);
    return data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}/`);
  }
};
