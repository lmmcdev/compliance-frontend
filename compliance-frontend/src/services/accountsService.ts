import { apiClient } from '../middleware/apiClient';

export interface Account {
  id: string;
  accountNumber: string;
  name: string;
  type: string;
  phone?: string;
  billingAddressId?: string | null;
  mdvitaDisenrollment: boolean;
  inHouse: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    traceId: string;
  };
}

export interface AccountsData {
  items: Account[];
  continuationToken: string | null;
}

export interface AccountsListResponse {
  accounts: Account[];
  continuationToken: string | null;
}

export const accountsService = {
  /**
   * Get all accounts with optional filters
   */
  async getAccounts(filters?: {
    type?: string;
    limit?: number;
    continuationToken?: string;
  }): Promise<AccountsListResponse> {
    const queryParams = new URLSearchParams();

    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.continuationToken) queryParams.append('continuationToken', filters.continuationToken);

    const endpoint = `/accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<ApiResponse<AccountsData>>(endpoint);

    return {
      accounts: response.data.data.items,
      continuationToken: response.data.data.continuationToken,
    };
  },

  /**
   * Get account by ID
   */
  async getAccountById(id: string): Promise<Account> {
    const response = await apiClient.get<ApiResponse<Account>>(`/accounts/${encodeURIComponent(id)}`);
    return response.data.data;
  },

  /**
   * Create new account
   */
  async createAccount(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const response = await apiClient.post<ApiResponse<Account>>('/accounts', account);
    return response.data.data;
  },

  /**
   * Update existing account
   */
  async updateAccount(id: string, updates: Partial<Omit<Account, 'id' | 'createdAt'>>): Promise<Account> {
    const response = await apiClient.patch<ApiResponse<Account>>(`/accounts/${encodeURIComponent(id)}`, updates);
    return response.data.data;
  },

  /**
   * Delete account
   */
  async deleteAccount(id: string): Promise<void> {
    await apiClient.delete(`/accounts/${encodeURIComponent(id)}`);
  },

  /**
   * Search accounts by query string
   */
  async searchAccounts(query: string, filters?: {
    type?: string;
    limit?: number;
  }): Promise<AccountsListResponse> {
    const queryParams = new URLSearchParams();

    queryParams.append('q', query);
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const endpoint = `/accounts/search?${queryParams.toString()}`;
    const response = await apiClient.get<ApiResponse<AccountsData>>(endpoint);

    return {
      accounts: response.data.data.items,
      continuationToken: response.data.data.continuationToken,
    };
  },

  /**
   * Bulk operations for accounts
   */
  async bulkCreateAccounts(accounts: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Account[]> {
    const response = await apiClient.post<ApiResponse<Account[]>>('/accounts/bulk', { accounts });
    return response.data.data;
  },

  /**
   * Get account statistics
   */
  async getAccountsStats(): Promise<{
    total: number;
    byType: Record<string, number>;
  }> {
    const response = await apiClient.get<ApiResponse<{
      total: number;
      byType: Record<string, number>;
    }>>('/accounts/stats');
    return response.data.data;
  },

  /**
   * Validate account data before creation/update
   */
  validateAccount(account: Partial<Account>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!account.name?.trim()) {
      errors.push('Account name is required');
    }

    if (!account.type?.trim()) {
      errors.push('Account type is required');
    }

    if (account.accountNumber && !account.accountNumber.trim()) {
      errors.push('Account number cannot be empty');
    }

    if (account.phone && !isValidPhone(account.phone)) {
      errors.push('Invalid phone number format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// Helper functions
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export default accountsService;