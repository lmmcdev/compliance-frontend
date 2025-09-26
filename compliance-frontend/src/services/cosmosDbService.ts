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

const COSMOS_API_BASE_URL = process.env.REACT_APP_COSMOS_API_URL || 'https://your-cosmos-api.azurewebsites.net';

class CosmosDbService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<CosmosDbResponse<T>> {
    try {
      const response = await fetch(`${COSMOS_API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
        };
      }

      return {
        success: true,
        data,
        statusCode: response.status,
      };
    } catch (error) {
      console.error('Cosmos DB request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
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

    const endpoint = `/api/accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest<Account[]>(endpoint);
  }

  async getAccountById(id: string): Promise<CosmosDbResponse<Account>> {
    return this.makeRequest<Account>(`/api/accounts/${id}`);
  }

  async createAccount(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<CosmosDbResponse<Account>> {
    return this.makeRequest<Account>('/api/accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    });
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<CosmosDbResponse<Account>> {
    return this.makeRequest<Account>(`/api/accounts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteAccount(id: string): Promise<CosmosDbResponse<void>> {
    return this.makeRequest<void>(`/api/accounts/${id}`, {
      method: 'DELETE',
    });
  }

  // Search accounts by name or other criteria
  async searchAccounts(query: string): Promise<CosmosDbResponse<Account[]>> {
    return this.makeRequest<Account[]>(`/api/accounts/search?q=${encodeURIComponent(query)}`);
  }
}

export const cosmosDbService = new CosmosDbService();
export default cosmosDbService;