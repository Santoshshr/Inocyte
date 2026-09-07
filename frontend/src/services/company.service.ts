import { apiClient } from '../api/client';
import type { Company, Industry, PaginatedResponse } from '../types/company.types';

export const companyService = {
  getCompanies: async (params?: any): Promise<PaginatedResponse<Company>> => {
    const { data } = await apiClient.get('/companies/', { params });
    return data;
  },

  getCompany: async (id: string): Promise<Company> => {
    const { data } = await apiClient.get(`/companies/${id}/`);
    return data;
  },

  createCompany: async (formData: FormData): Promise<Company> => {
    const { data } = await apiClient.post('/companies/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  updateCompany: async (id: string, formData: FormData): Promise<Company> => {
    const { data } = await apiClient.patch(`/companies/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteCompany: async (id: string): Promise<void> => {
    await apiClient.delete(`/companies/${id}/`);
  },

  getIndustries: async (): Promise<PaginatedResponse<Industry>> => {
    const { data } = await apiClient.get('/industries/');
    return data;
  },
};
