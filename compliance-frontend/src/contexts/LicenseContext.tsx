import React, { createContext, useContext, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { useApiQuery, useApiMutation, usePagination } from '../hooks/data';
import { useLicenseUpload } from '../hooks/useLicenseUpload';
import { useLicenseFields } from '../hooks/useLicenseFields';
import type { LicenseData } from '../types/license';

interface License {
  id: string;
  accountId: string;
  documentType: string;
  status: 'pending' | 'processed' | 'failed';
  data: LicenseData | null;
  uploadedAt: string;
  processedAt?: string;
  createdBy: string;
  updatedAt: string;
}

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
      mutate: (data: Omit<License, 'id' | 'uploadedAt' | 'updatedAt'>) => Promise<License>;
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
    process: {
      mutate: (id: string) => Promise<License>;
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
  const licensesQuery = useApiQuery<{ licenses: License[]; total: number }>(
    `licenses-page-${pagination.page}-${pagination.pageSize}`,
    `/licenses?page=${pagination.page}&limit=${pagination.pageSize}&offset=${pagination.offset}`,
    {
      refetchOnMount: true,
      cacheTime: 2 * 60 * 1000, // 2 minutes cache
      onSuccess: (data) => {
        if (data?.total !== undefined) {
          pagination.setTotal(data.total);
        }
      },
      onError: (error) => console.error('[LicenseContext] Failed to fetch licenses:', error),
    }
  );

  // License upload hook
  const licenseUpload = useLicenseUpload();

  // License fields management
  const licenseFields = useLicenseFields(currentLicenseData);

  // Create license mutation
  const createLicenseMutation = useApiMutation<License>(
    '/licenses',
    'POST',
    {
      onSuccess: () => {
        licensesQuery.refetch();
        console.log('[LicenseContext] License created successfully');
      },
      onError: (error) => console.error('[LicenseContext] Failed to create license:', error),
    }
  );

  // Update license mutation
  const updateLicenseMutation = useApiMutation<License>(
    '',
    'PUT',
    {
      onSuccess: () => {
        licensesQuery.refetch();
        console.log('[LicenseContext] License updated successfully');
      },
      onError: (error) => console.error('[LicenseContext] Failed to update license:', error),
    }
  );

  // Delete license mutation
  const deleteLicenseMutation = useApiMutation<void>(
    '',
    'DELETE',
    {
      onSuccess: () => {
        licensesQuery.refetch();
        console.log('[LicenseContext] License deleted successfully');
      },
      onError: (error) => console.error('[LicenseContext] Failed to delete license:', error),
    }
  );

  // Process license mutation
  const processLicenseMutation = useApiMutation<License>(
    '',
    'POST',
    {
      onSuccess: () => {
        licensesQuery.refetch();
        console.log('[LicenseContext] License processed successfully');
      },
      onError: (error) => console.error('[LicenseContext] Failed to process license:', error),
    }
  );

  // Custom mutation wrappers
  const createLicense = useCallback(async (licenseData: Omit<License, 'id' | 'uploadedAt' | 'updatedAt'>) => {
    return await createLicenseMutation.mutate(licenseData);
  }, [createLicenseMutation]);

  const updateLicense = useCallback(async (data: { id: string; updates: Partial<License> }) => {
    const endpoint = `/licenses/${data.id}`;
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://compliance-api-fybjasdddtcxhqfw.eastus2-01.azurewebsites.net/api/v1'}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data.updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update license: ${response.statusText}`);
    }

    const result = await response.json();
    await licensesQuery.refetch();
    return result;
  }, [licensesQuery]);

  const deleteLicense = useCallback(async (id: string) => {
    const endpoint = `/licenses/${id}`;
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://compliance-api-fybjasdddtcxhqfw.eastus2-01.azurewebsites.net/api/v1'}${endpoint}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete license: ${response.statusText}`);
    }

    await licensesQuery.refetch();
  }, [licensesQuery]);

  const processLicense = useCallback(async (id: string) => {
    const endpoint = `/licenses/${id}/process`;
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://compliance-api-fybjasdddtcxhqfw.eastus2-01.azurewebsites.net/api/v1'}${endpoint}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to process license: ${response.statusText}`);
    }

    const result = await response.json();
    await licensesQuery.refetch();
    return result;
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
    createLicenseMutation.reset();
    updateLicenseMutation.reset();
    deleteLicenseMutation.reset();
    processLicenseMutation.reset();
  }, [
    licensesQuery,
    licenseUpload,
    createLicenseMutation,
    updateLicenseMutation,
    deleteLicenseMutation,
    processLicenseMutation
  ]);

  const contextValue: LicenseContextValue = {
    currentLicense: {
      data: currentLicenseData,
      fields: licenseFields,
      upload: licenseUpload,
    },

    licenses: {
      data: licensesQuery.data?.licenses || null,
      loading: licensesQuery.loading,
      error: licensesQuery.error,
      pagination,
      refetch: licensesQuery.refetch,
      reset: licensesQuery.reset,
    },

    operations: {
      create: {
        mutate: createLicense,
        loading: createLicenseMutation.loading,
        error: createLicenseMutation.error,
      },
      update: {
        mutate: updateLicense,
        loading: updateLicenseMutation.loading,
        error: updateLicenseMutation.error,
      },
      delete: {
        mutate: deleteLicense,
        loading: deleteLicenseMutation.loading,
        error: deleteLicenseMutation.error,
      },
      process: {
        mutate: processLicense,
        loading: processLicenseMutation.loading,
        error: processLicenseMutation.error,
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