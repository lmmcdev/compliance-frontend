import { apiClient } from '../middleware/apiClient';
import type { ComplianceCase, DashboardMetrics } from '../types';

export const complianceService = {
  async getAllComplianceCases(): Promise<ComplianceCase[]> {
    const response = await apiClient.get('/api/compliance-cases');
    return response.data;
  },

  async getComplianceCaseById(id: string): Promise<ComplianceCase> {
    const response = await apiClient.get(`/api/compliance-cases/${id}`);
    return response.data;
  },

  async createComplianceCase(caseData: Omit<ComplianceCase, 'id'>): Promise<ComplianceCase> {
    const response = await apiClient.post('/api/compliance-cases', caseData);
    return response.data;
  },

  async updateComplianceCase(id: string, caseData: Partial<ComplianceCase>): Promise<ComplianceCase> {
    const response = await apiClient.put(`/api/compliance-cases/${id}`, caseData);
    return response.data;
  },

  async deleteComplianceCase(id: string): Promise<void> {
    await apiClient.delete(`/api/compliance-cases/${id}`);
  },

  async uploadDocument(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/api/compliance-cases/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.documentUrl;
  },

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await apiClient.get('/api/dashboard/metrics');
    return response.data;
  },
};