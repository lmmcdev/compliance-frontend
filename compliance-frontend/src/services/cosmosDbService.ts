import { apiClient } from '../middleware/apiClient';
import type { AxiosError } from 'axios';

export interface Account {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive';
  contactEmail?: string;
  contactPhone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CosmosDbResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

class CosmosDbService {
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    data?: any
  ): Promise<CosmosDbResponse<T>> {
    try {
      let response;

      switch (method) {
        case 'GET':
          response = await apiClient.get<T>(endpoint);
          break;
        case 'POST':
          response = await apiClient.post<T>(endpoint, data);
          break;
        case 'PATCH':
          response = await apiClient.patch<T>(endpoint, data);
          break;
        case 'DELETE':
          response = await apiClient.delete<T>(endpoint);
          break;
      }

      return {
        success: true,
        data: response.data,
        statusCode: response.status,
      };
    } catch (error) {
      console.error('Cosmos DB request failed:', error);
      const axiosError = error as AxiosError;

      return {
        success: false,
        error: typeof axiosError.response?.data === 'string'
          ? axiosError.response.data
          : axiosError.message || 'Unknown error occurred',
        statusCode: axiosError.response?.status,
      };
    }
  }

  async getAccounts(filters?: {
    status?: 'active' | 'inactive';
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<CosmosDbResponse<Account[]>> {
    const queryParams = new URLSearchParams();

    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.offset) queryParams.append('offset', filters.offset.toString());

    const endpoint = `/accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest<Account[]>(endpoint, 'GET');
  }

  async getAccountById(id: string): Promise<CosmosDbResponse<Account>> {
    return this.makeRequest<Account>(`/accounts/${id}`, 'GET');
  }

  async createAccount(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<CosmosDbResponse<Account>> {
    return this.makeRequest<Account>('/accounts', 'POST', account);
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<CosmosDbResponse<Account>> {
    return this.makeRequest<Account>(`/accounts/${id}`, 'PATCH', updates);
  }

  async deleteAccount(id: string): Promise<CosmosDbResponse<void>> {
    return this.makeRequest<void>(`/accounts/${id}`, 'DELETE');
  }

  // Search accounts by name or other criteria
  async searchAccounts(query: string): Promise<CosmosDbResponse<Account[]>> {
    return this.makeRequest<Account[]>(`/accounts/search?q=${encodeURIComponent(query)}`, 'GET');
  }
}

export const cosmosDbService = new CosmosDbService();
export default cosmosDbService;