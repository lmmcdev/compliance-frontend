import React, { createContext, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useApiQuery, useApiMutation, useSearch } from '../hooks/data';
import type { Account } from '../services/accountsService';

interface AccountContextValue {
  // Query hooks
  accounts: {
    data: Account[] | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    reset: () => void;
  };

  // Search functionality
  search: {
    query: string;
    data: Account[] | null;
    loading: boolean;
    error: string | null;
    isSearching: boolean;
    hasSearched: boolean;
    setQuery: (query: string) => void;
    clearSearch: () => void;
    refetch: () => Promise<void>;
    reset: () => void;
  };

  // Mutation operations
  operations: {
    create: {
      mutate: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Account>;
      loading: boolean;
      error: string | null;
    };
    update: {
      mutate: (data: { id: string; updates: Partial<Account> }) => Promise<Account>;
      loading: boolean;
      error: string | null;
    };
    delete: {
      mutate: (id: string) => Promise<void>;
      loading: boolean;
      error: string | null;
    };
  };

  // Convenience methods
  actions: {
    refreshAccounts: () => Promise<void>;
    clearAllErrors: () => void;
  };
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

interface AccountProviderProps {
  children: ReactNode;
}

export const AccountProvider: React.FC<AccountProviderProps> = ({ children }) => {
  // Main accounts query
  const accountsQuery = useApiQuery<{ accounts: Account[] }>(
    'accounts',
    '/accounts',
    {
      refetchOnMount: true,
      cacheTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => console.error('[AccountContext] Failed to fetch accounts:', error),
    }
  );

  // Search functionality
  const accountsSearch = useSearch<{ accounts: Account[] }>(
    '/accounts',
    'search',
    {
      debounceMs: 300,
      minQueryLength: 2,
    }
  );

  // Create account mutation
  const createAccountMutation = useApiMutation<Account>(
    '/accounts',
    'POST',
    {
      onSuccess: () => {
        // Refresh accounts list after successful creation
        accountsQuery.refetch();
        console.log('[AccountContext] Account created successfully');
      },
      onError: (error) => console.error('[AccountContext] Failed to create account:', error),
    }
  );

  // Update account mutation
  const updateAccountMutation = useApiMutation<Account>(
    '',
    'PUT',
    {
      onSuccess: () => {
        // Refresh accounts list after successful update
        accountsQuery.refetch();
        console.log('[AccountContext] Account updated successfully');
      },
      onError: (error) => console.error('[AccountContext] Failed to update account:', error),
    }
  );

  // Delete account mutation
  const deleteAccountMutation = useApiMutation<void>(
    '',
    'DELETE',
    {
      onSuccess: () => {
        // Refresh accounts list after successful deletion
        accountsQuery.refetch();
        console.log('[AccountContext] Account deleted successfully');
      },
      onError: (error) => console.error('[AccountContext] Failed to delete account:', error),
    }
  );

  // Convenience methods
  const refreshAccounts = useCallback(async () => {
    await accountsQuery.refetch();
  }, [accountsQuery]);

  const clearAllErrors = useCallback(() => {
    accountsQuery.reset();
    accountsSearch.reset();
    createAccountMutation.reset();
    updateAccountMutation.reset();
    deleteAccountMutation.reset();
  }, [accountsQuery, accountsSearch, createAccountMutation, updateAccountMutation, deleteAccountMutation]);

  // Custom mutation wrappers to handle endpoint building
  const createAccount = useCallback(async (accountData: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await createAccountMutation.mutate(accountData);
  }, [createAccountMutation]);

  const updateAccount = useCallback(async (data: { id: string; updates: Partial<Account> }) => {
    // Set the endpoint dynamically for the specific account
    const endpoint = `/accounts/${data.id}`;
    // Create a new mutation with the specific endpoint
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://compliance-api-fybjasdddtcxhqfw.eastus2-01.azurewebsites.net/api/v1'}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data.updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update account: ${response.statusText}`);
    }

    const result = await response.json();
    await accountsQuery.refetch();
    return result;
  }, [accountsQuery]);

  const deleteAccount = useCallback(async (id: string) => {
    const endpoint = `/accounts/${id}`;
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://compliance-api-fybjasdddtcxhqfw.eastus2-01.azurewebsites.net/api/v1'}${endpoint}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete account: ${response.statusText}`);
    }

    await accountsQuery.refetch();
  }, [accountsQuery]);

  const contextValue: AccountContextValue = {
    accounts: {
      data: accountsQuery.data?.accounts || null,
      loading: accountsQuery.loading,
      error: accountsQuery.error,
      refetch: accountsQuery.refetch,
      reset: accountsQuery.reset,
    },

    search: {
      query: accountsSearch.query,
      data: accountsSearch.data?.accounts || null,
      loading: accountsSearch.loading,
      error: accountsSearch.error,
      isSearching: accountsSearch.isSearching,
      hasSearched: accountsSearch.hasSearched,
      setQuery: accountsSearch.setQuery,
      clearSearch: accountsSearch.clearSearch,
      refetch: accountsSearch.refetch,
      reset: accountsSearch.reset,
    },

    operations: {
      create: {
        mutate: createAccount,
        loading: createAccountMutation.loading,
        error: createAccountMutation.error,
      },
      update: {
        mutate: updateAccount,
        loading: updateAccountMutation.loading,
        error: updateAccountMutation.error,
      },
      delete: {
        mutate: deleteAccount,
        loading: deleteAccountMutation.loading,
        error: deleteAccountMutation.error,
      },
    },

    actions: {
      refreshAccounts,
      clearAllErrors,
    },
  };

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
};

// Hook to use account context
export const useAccountContext = (): AccountContextValue => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccountContext must be used within an AccountProvider');
  }
  return context;
};

// Convenience hooks for specific account operations
export const useAccounts = () => {
  const { accounts, actions } = useAccountContext();
  return {
    accounts: accounts.data,
    loading: accounts.loading,
    error: accounts.error,
    refetch: accounts.refetch,
    reset: accounts.reset,
    refresh: actions.refreshAccounts,
  };
};

export const useAccountSearch = () => {
  const { search } = useAccountContext();
  return search;
};

export const useAccountOperations = () => {
  const { operations } = useAccountContext();
  return operations;
};