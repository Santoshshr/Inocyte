import { apiClient } from '../api/client';
import type { ContactInquiry } from '../types/inquiry.types';
import type { PaginatedResponse } from '../types/company.types';

export const inquiryService = {
  getInquiries: async (params?: any): Promise<PaginatedResponse<ContactInquiry>> => {
    const { data } = await apiClient.get('/inquiries/', { params });
    return data;
  },

  getInquiry: async (id: string): Promise<{ data: ContactInquiry }> => {
    const { data } = await apiClient.get(`/inquiries/${id}/`);
    return data;
  },

  updateInquiry: async (id: string, updateData: Partial<ContactInquiry>): Promise<{ data: ContactInquiry }> => {
    const { data } = await apiClient.patch(`/inquiries/${id}/`, updateData);
    return data;
  },
  
  deleteInquiry: async (id: string): Promise<void> => {
    await apiClient.delete(`/inquiries/${id}/`);
  }
};
