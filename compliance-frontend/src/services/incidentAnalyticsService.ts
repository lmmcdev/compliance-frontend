import { apiClient } from '../middleware/apiClient';
import type { IncidentAnalyticsResponse, IncidentAnalyticsData } from '../types/incidentAnalytics';

export const incidentAnalyticsService = {
  async getIncidentAnalytics(): Promise<IncidentAnalyticsData> {
    const response = await apiClient.post<IncidentAnalyticsResponse>('/incidentanalytics', {});

    // Handle nested response format: { success: true, data: {...} }
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    // Fallback for direct data response
    return response.data as unknown as IncidentAnalyticsData;
  },
};
