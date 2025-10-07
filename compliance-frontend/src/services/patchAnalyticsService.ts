import { apiClient } from '../middleware/apiClient';
import type {
  PatchAnalyticsResponse,
  PatchAnalyticsData,
  PatchAnalyticsFilters,
  DeviceCountResponse,
  DeviceCountData
} from '../types/patchAnalytics';

export const patchAnalyticsService = {
  async getPatchAnalytics(filters: PatchAnalyticsFilters = {}): Promise<PatchAnalyticsData> {
    const response = await apiClient.post<PatchAnalyticsResponse>('/patchanalytics', filters);

    // Handle nested response format: { success: true, data: {...} }
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    // Fallback for direct data response
    return response.data as unknown as PatchAnalyticsData;
  },

  async getDeviceCount(filters: PatchAnalyticsFilters = {}): Promise<DeviceCountData> {
    const response = await apiClient.post<DeviceCountResponse>('/devices/count', filters);

    // Handle nested response format: { success: true, data: {...} }
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    // Fallback for direct data response
    return response.data as unknown as DeviceCountData;
  },
};
