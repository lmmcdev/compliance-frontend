import React, { createContext, useContext, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { useApiQuery, usePagination } from '../hooks/data';
import { useLicenseUpload } from '../hooks/useLicenseUpload';
import { useLicenseFields } from '../hooks/useLicenseFields';
import { licenseService } from '../services/licenseService';
import type { License } from '../types';
import type { LicenseData } from '../types/license';

// Re-export License type for external use
export type { License };

interface LicenseContextValue {
  // Current license being processed
  currentLicense: {
    data: LicenseData | null;
    fields: ReturnType<typeof useLicenseFields>;
    upload: ReturnType<typeof useLicenseUpload>;
  };

  // License list management
  licenses: {
    data: License[] | null;
    loading: boolean;
    error: string | null;
    pagination: ReturnType<typeof usePagination>;
    refetch: () => Promise<void>;
    reset: () => void;
  };

  // License operations
  operations: {
    create: {
      mutate: (data: Omit<License, 'id' | 'createdAt' | 'updatedAt'>) => Promise<License>;
      loading: boolean;
      error: string | null;
    };
    update: {
      mutate: (data: { id: string; updates: Partial<License> }) => Promise<License>;
      loading: boolean;
      error: string | null;
    };
    delete: {
      mutate: (id: string) => Promise<void>;
      loading: boolean;
      error: string | null;
    };
  };

  // Actions
  actions: {
    setCurrentLicense: (licenseData: LicenseData | null) => void;
    clearCurrentLicense: () => void;
    refreshLicenses: () => Promise<void>;
    clearAllErrors: () => void;
  };
}

const LicenseContext = createContext<LicenseContextValue | undefined>(undefined);

interface LicenseProviderProps {
  children: ReactNode;
}

export const LicenseProvider: React.FC<LicenseProviderProps> = ({ children }) => {
  const [currentLicenseData, setCurrentLicenseData] = useState<LicenseData | null>(null);

  // Pagination for license list
  const pagination = usePagination({
    initialPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
  });

  // License list query with pagination
  const licensesQuery = useApiQuery<{ success: boolean; data: License[] }>(
    `license-types-page-${pagination.page}-${pagination.pageSize}`,
    '/license-types',
    {
      refetchOnMount: true,
      cacheTime: 2 * 60 * 1000, // 2 minutes cache
      onSuccess: (response) => {
        // Handle the nested response format
        const licenses = response?.data || [];
        console.log('[LicenseContext] API Response:', response);
        console.log('[LicenseContext] Extracted licenses:', licenses);
        console.log('[LicenseContext] Is array:', Array.isArray(licenses));
        if (Array.isArray(licenses)) {
          pagination.setTotal(licenses.length);
        }
      },
      onError: (error) => console.error('[LicenseContext] Failed to fetch licenses:', error),
    }
  );

  // License upload hook
  const licenseUpload = useLicenseUpload();

  // License fields management
  const licenseFields = useLicenseFields(currentLicenseData);


  // Custom mutation wrappers using licenseService
  const createLicense = useCallback(async (licenseData: Omit<License, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await licenseService.createLicense(licenseData as any);
      await licensesQuery.refetch();
      console.log('[LicenseContext] License created successfully');
      return result;
    } catch (error) {
      console.error('[LicenseContext] Failed to create license:', error);
      throw error;
    }
  }, [licensesQuery]);

  const updateLicense = useCallback(async (data: { id: string; updates: Partial<License> }) => {
    try {
      const result = await licenseService.updateLicense(data.id, data.updates as any);
      await licensesQuery.refetch();
      console.log('[LicenseContext] License updated successfully');
      return result;
    } catch (error) {
      console.error('[LicenseContext] Failed to update license:', error);
      throw error;
    }
  }, [licensesQuery]);

  const deleteLicense = useCallback(async (id: string) => {
    try {
      await licenseService.deleteLicense(id);
      await licensesQuery.refetch();
      console.log('[LicenseContext] License deleted successfully');
    } catch (error) {
      console.error('[LicenseContext] Failed to delete license:', error);
      throw error;
    }
  }, [licensesQuery]);


  // Actions
  const setCurrentLicense = useCallback((licenseData: LicenseData | null) => {
    setCurrentLicenseData(licenseData);
  }, []);

  const clearCurrentLicense = useCallback(() => {
    setCurrentLicenseData(null);
    licenseUpload.resetUpload();
    licenseFields.resetFields();
  }, [licenseUpload, licenseFields]);

  const refreshLicenses = useCallback(async () => {
    await licensesQuery.refetch();
  }, [licensesQuery]);

  const clearAllErrors = useCallback(() => {
    licensesQuery.reset();
    licenseUpload.clearError();
  }, [licensesQuery, licenseUpload]);

  const contextValue: LicenseContextValue = {
    currentLicense: {
      data: currentLicenseData,
      fields: licenseFields,
      upload: licenseUpload,
    },

    licenses: {
      data: licensesQuery.data?.data || null, // Extract data from nested response
      loading: licensesQuery.loading,
      error: licensesQuery.error,
      pagination,
      refetch: licensesQuery.refetch,
      reset: licensesQuery.reset,
    },

    operations: {
      create: {
        mutate: createLicense,
        loading: false, // We'll handle loading states in the individual functions if needed
        error: null,
      },
      update: {
        mutate: updateLicense,
        loading: false,
        error: null,
      },
      delete: {
        mutate: deleteLicense,
        loading: false,
        error: null,
      },
    },

    actions: {
      setCurrentLicense,
      clearCurrentLicense,
      refreshLicenses,
      clearAllErrors,
    },
  };

  return (
    <LicenseContext.Provider value={contextValue}>
      {children}
    </LicenseContext.Provider>
  );
};

// Hook to use license context
export const useLicenseContext = (): LicenseContextValue => {
  const context = useContext(LicenseContext);
  if (context === undefined) {
    throw new Error('useLicenseContext must be used within a LicenseProvider');
  }
  return context;
};

// Convenience hooks for specific license operations
export const useCurrentLicense = () => {
  const { currentLicense, actions } = useLicenseContext();
  return {
    ...currentLicense,
    setLicense: actions.setCurrentLicense,
    clearLicense: actions.clearCurrentLicense,
  };
};

export const useLicenses = () => {
  const { licenses, actions } = useLicenseContext();
  return {
    ...licenses,
    refresh: actions.refreshLicenses,
  };
};

export const useLicenseOperations = () => {
  const { operations } = useLicenseContext();
  return operations;
};