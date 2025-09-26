import apiClient from '../middleware/httpInterceptor';
import type { License, LicenseData } from '../types';
import { fileUploadService } from './fileUploadService';

export const licenseService = {
  async getAllLicenses(): Promise<License[]> {
    const response = await apiClient.get('/api/licenses');
    return response.data;
  },

  async getLicenseById(id: string): Promise<License> {
    const response = await apiClient.get(`/api/licenses/${id}`);
    return response.data;
  },

  async createLicense(licenseData: LicenseData): Promise<License> {
    const response = await apiClient.post('/api/licenses', licenseData);
    return response.data;
  },

  async updateLicense(id: string, licenseData: Partial<LicenseData>): Promise<License> {
    const response = await apiClient.put(`/api/licenses/${id}`, licenseData);
    return response.data;
  },

  async deleteLicense(id: string): Promise<void> {
    await apiClient.delete(`/api/licenses/${id}`);
  },

  async uploadLicenseDocument(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/api/licenses/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.documentUrl;
  },

  async extractLicenseData(documentUrl: string): Promise<LicenseData> {
    const response = await apiClient.post('/api/licenses/extract', { documentUrl });
    return response.data;
  },

  async uploadLicenseDocumentToStorage(file: File): Promise<string> {
    const result = await fileUploadService.uploadLicenseDocument(file);
    return result.data.fileUrl;
  },
};