import { apiClient } from '../middleware/apiClient';
import type { License, LicenseData } from '../types';
import { fileUploadService } from './fileUploadService';

export const licenseService = {
  async getAllLicenses(): Promise<License[]> {
    const response = await apiClient.get('/api/license-types');
    // Handle nested response format: { success: true, data: [...] }
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // Fallback for direct array response
    return Array.isArray(response.data) ? response.data : [];
  },

  async getLicenseById(id: string): Promise<License> {
    const response = await apiClient.get(`/api/license-types/${id}`);
    // Handle nested response format if needed
    return response.data.data || response.data;
  },

  async createLicense(licenseData: LicenseData): Promise<License> {
    const response = await apiClient.post('/api/license-types', licenseData);
    // Handle nested response format if needed
    return response.data.data || response.data;
  },

  async updateLicense(id: string, licenseData: Partial<LicenseData>): Promise<License> {
    const response = await apiClient.put(`/api/license-types/${id}`, licenseData);
    // Handle nested response format if needed
    return response.data.data || response.data;
  },

  async deleteLicense(id: string): Promise<void> {
    await apiClient.delete(`/api/license-types/${id}`);
  },


  async uploadLicenseDocument(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/api/license-types/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.documentUrl;
  },

  async extractLicenseData(documentUrl: string): Promise<LicenseData> {
    const response = await apiClient.post('/api/license-types/extract', { documentUrl });
    return response.data;
  },

  async uploadLicenseDocumentToStorage(file: File): Promise<string> {
    const result = await fileUploadService.uploadLicenseDocument(file);
    return result.data.fileUrl;
  },
};