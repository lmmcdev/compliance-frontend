import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { accountsService } from '../services/accountsService';
import type { Account } from '../services/accountsService';

// State interface
interface DataState {
  accounts: {
    data: Account[];
    loading: boolean;
    error: string | null;
    lastFetched: Date | null;
  };
}

// Action types
type DataAction =
  | { type: 'ACCOUNTS_LOADING' }
  | { type: 'ACCOUNTS_SUCCESS'; payload: Account[] }
  | { type: 'ACCOUNTS_ERROR'; payload: string }
  | { type: 'ACCOUNTS_CLEAR_ERROR' }
  | { type: 'ACCOUNT_ADD'; payload: Account }
  | { type: 'ACCOUNT_UPDATE'; payload: Account }
  | { type: 'ACCOUNT_DELETE'; payload: string };

// Initial state
const initialState: DataState = {
  accounts: {
    data: [],
    loading: false,
    error: null,
    lastFetched: null,
  },
};

// Reducer
function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'ACCOUNTS_LOADING':
      return {
        ...state,
        accounts: { ...state.accounts, loading: true, error: null },
      };

    case 'ACCOUNTS_SUCCESS':
      return {
        ...state,
        accounts: {
          ...state.accounts,
          data: action.payload,
          loading: false,
          error: null,
          lastFetched: new Date(),
        },
      };

    case 'ACCOUNTS_ERROR':
      return {
        ...state,
        accounts: {
          ...state.accounts,
          loading: false,
          error: action.payload,
        },
      };

    case 'ACCOUNTS_CLEAR_ERROR':
      return {
        ...state,
        accounts: { ...state.accounts, error: null },
      };

    case 'ACCOUNT_ADD':
      return {
        ...state,
        accounts: {
          ...state.accounts,
          data: [...state.accounts.data, action.payload],
        },
      };

    case 'ACCOUNT_UPDATE':
      return {
        ...state,
        accounts: {
          ...state.accounts,
          data: state.accounts.data.map(account =>
            account.id === action.payload.id ? action.payload : account
          ),
        },
      };

    case 'ACCOUNT_DELETE':
      return {
        ...state,
        accounts: {
          ...state.accounts,
          data: state.accounts.data.filter(account => account.id !== action.payload),
        },
      };

    default:
      return state;
  }
}

// Context interface
interface DataContextValue {
  state: DataState;
  actions: {
    fetchAccounts: (force?: boolean) => Promise<void>;
    searchAccounts: (query: string) => Promise<void>;
    addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;
    clearAccountsError: () => void;
    refreshAccounts: () => Promise<void>;
  };
}

// Context
const DataContext = createContext<DataContextValue | undefined>(undefined);

// Provider props
interface DataProviderProps {
  children: ReactNode;
}

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Provider component
export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Check if data needs refresh
  const needsRefresh = (lastFetched: Date | null): boolean => {
    if (!lastFetched) return true;
    return Date.now() - lastFetched.getTime() > CACHE_DURATION;
  };

  // Fetch accounts
  const fetchAccounts = useCallback(async (force = false) => {
    if (!force && !needsRefresh(state.accounts.lastFetched) && state.accounts.data.length > 0) {
      return;
    }

    dispatch({ type: 'ACCOUNTS_LOADING' });

    try {
      const response = await accountsService.getAccounts();
      const accounts = response.accounts || [];
      dispatch({ type: 'ACCOUNTS_SUCCESS', payload: accounts });
    } catch (error) {
      dispatch({
        type: 'ACCOUNTS_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to fetch accounts'
      });
    }
  }, [state.accounts.lastFetched, state.accounts.data.length]);

  // Search accounts
  const searchAccounts = useCallback(async (query: string) => {
    dispatch({ type: 'ACCOUNTS_LOADING' });

    try {
      const response = await accountsService.searchAccounts(query);
      const accounts = response.accounts || [];
      dispatch({ type: 'ACCOUNTS_SUCCESS', payload: accounts });
    } catch (error) {
      dispatch({
        type: 'ACCOUNTS_ERROR',
        payload: error instanceof Error ? error.message : 'Search failed'
      });
    }
  }, []);

  // Add account
  const addAccount = async (accountData: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Validate account data before sending
      const validation = accountsService.validateAccount(accountData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const newAccount = await accountsService.createAccount(accountData);
      dispatch({ type: 'ACCOUNT_ADD', payload: newAccount });
    } catch (error) {
      dispatch({
        type: 'ACCOUNTS_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to create account'
      });
      throw error;
    }
  };

  // Update account
  const updateAccount = async (id: string, updates: Partial<Account>) => {
    try {
      // Validate updates before sending
      const validation = accountsService.validateAccount(updates);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const updatedAccount = await accountsService.updateAccount(id, updates);
      dispatch({ type: 'ACCOUNT_UPDATE', payload: updatedAccount });
    } catch (error) {
      dispatch({
        type: 'ACCOUNTS_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to update account'
      });
      throw error;
    }
  };

  // Delete account
  const deleteAccount = async (id: string) => {
    try {
      await accountsService.deleteAccount(id);
      dispatch({ type: 'ACCOUNT_DELETE', payload: id });
    } catch (error) {
      dispatch({
        type: 'ACCOUNTS_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to delete account'
      });
      throw error;
    }
  };

  // Clear accounts error
  const clearAccountsError = useCallback(() => {
    dispatch({ type: 'ACCOUNTS_CLEAR_ERROR' });
  }, []);

  // Refresh accounts
  const refreshAccounts = useCallback(async () => {
    await fetchAccounts(true);
  }, [fetchAccounts]);

  // Load initial data
  useEffect(() => {
    fetchAccounts();
  }, []);

  const contextValue: DataContextValue = {
    state,
    actions: {
      fetchAccounts,
      searchAccounts,
      addAccount,
      updateAccount,
      deleteAccount,
      clearAccountsError,
      refreshAccounts,
    },
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// Hook to use the data context
export const useData = (): DataContextValue => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Hook to use accounts specifically
export const useAccounts = () => {
  const { state, actions } = useData();
  return {
    accounts: state.accounts.data,
    loading: state.accounts.loading,
    error: state.accounts.error,
    lastFetched: state.accounts.lastFetched,
    fetchAccounts: actions.fetchAccounts,
    searchAccounts: actions.searchAccounts,
    refreshAccounts: actions.refreshAccounts,
    clearError: actions.clearAccountsError,
  };
};

export default DataContext;