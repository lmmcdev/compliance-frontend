import axios from 'axios';

const API_BASE_URL = 'https://compliance-api-fybjasdddtcxhqfw.eastus2-01.azurewebsites.net/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface LicenseType {
  id: string;
  type: string;
  issuer: string;
  issueDate: string;
  expirationDate: string;
  status: 'active' | 'expired' | 'pending';
  documentUrl?: string;
}

export const licenseApi = {
  getLicenseTypes: async (): Promise<LicenseType[]> => {
    const response = await apiClient.get('/license-types');
    console.log(response)
    return response.data.data;
  },

  getLicenseType: async (id: string): Promise<LicenseType> => {
    const response = await apiClient.get(`/license-types/${id}`);
    return response.data;
  },

  createLicenseType: async (license: Omit<LicenseType, 'id'>): Promise<LicenseType> => {
    const response = await apiClient.post('/license-types', license);
    return response.data;
  },

  updateLicenseType: async (id: string, license: Partial<LicenseType>): Promise<LicenseType> => {
    const response = await apiClient.put(`/license-types/${id}`, license);
    return response.data;
  },

  deleteLicenseType: async (id: string): Promise<void> => {
    await apiClient.delete(`/license-types/${id}`);
  },
};

export default licenseApi;