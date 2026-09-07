import { apiClient } from '../api/client';
import type { SiteSetting } from '../types/settings.types';

export const settingsService = {
  getSettings: async (group?: string): Promise<{ status: string; data: SiteSetting[] }> => {
    const params = group ? { group } : {};
    const { data } = await apiClient.get('/settings/', { params });
    return data;
  },

  getSetting: async (key: string): Promise<{ data: SiteSetting }> => {
    const { data } = await apiClient.get(`/settings/${key}/`);
    return data;
  },

  updateSetting: async (key: string, value: string): Promise<{ data: SiteSetting }> => {
    const { data } = await apiClient.patch(`/settings/${key}/`, { value });
    return data;
  },

  bulkUpdateSettings: async (
    settings: { key: string; value: string }[]
  ): Promise<{ status: string; data: SiteSetting[] }> => {
    const { data } = await apiClient.patch('/settings/bulk-update/', { settings });
    return data;
  },
};
