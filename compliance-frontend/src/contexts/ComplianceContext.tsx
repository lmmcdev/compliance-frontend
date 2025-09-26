import React, { createContext, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useApiQuery, useApiMutation, usePagination, useSearch } from '../hooks/data';

interface ComplianceReport {
  id: string;
  accountId: string;
  licenseId: string;
  reportType: 'validation' | 'compliance' | 'audit';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  findings: ComplianceFinding[];
  score: number;
  createdAt: string;
  completedAt?: string;
  metadata: {
    rulesApplied: string[];
    documentsProcessed: number;
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
  };
}

interface ComplianceFinding {
  id: string;
  ruleId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'validation' | 'expiration' | 'coverage' | 'documentation';
  title: string;
  description: string;
  recommendation: string;
  fieldName?: string;
  currentValue?: string;
  expectedValue?: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'ignored';
}

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  conditions: any[];
  actions: any[];
  updatedAt: string;
}

interface ComplianceContextValue {
  // Reports management
  reports: {
    data: ComplianceReport[] | null;
    loading: boolean;
    error: string | null;
    pagination: ReturnType<typeof usePagination>;
    search: ReturnType<typeof useSearch>;
    refetch: () => Promise<void>;
    reset: () => void;
  };

  // Rules management
  rules: {
    data: ComplianceRule[] | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    reset: () => void;
  };

  // Findings management
  findings: {
    data: ComplianceFinding[] | null;
    loading: boolean;
    error: string | null;
    pagination: ReturnType<typeof usePagination>;
    refetch: () => Promise<void>;
    reset: () => void;
  };

  // Operations
  operations: {
    createReport: {
      mutate: (data: { accountId: string; licenseId: string; reportType: ComplianceReport['reportType'] }) => Promise<ComplianceReport>;
      loading: boolean;
      error: string | null;
    };
    updateReport: {
      mutate: (data: { id: string; updates: Partial<ComplianceReport> }) => Promise<ComplianceReport>;
      loading: boolean;
      error: string | null;
    };
    deleteReport: {
      mutate: (id: string) => Promise<void>;
      loading: boolean;
      error: string | null;
    };
    updateFinding: {
      mutate: (data: { id: string; updates: Partial<ComplianceFinding> }) => Promise<ComplianceFinding>;
      loading: boolean;
      error: string | null;
    };
    updateRule: {
      mutate: (data: { id: string; updates: Partial<ComplianceRule> }) => Promise<ComplianceRule>;
      loading: boolean;
      error: string | null;
    };
  };

  // Actions
  actions: {
    refreshReports: () => Promise<void>;
    refreshRules: () => Promise<void>;
    refreshFindings: () => Promise<void>;
    clearAllErrors: () => void;
  };
}

const ComplianceContext = createContext<ComplianceContextValue | undefined>(undefined);

interface ComplianceProviderProps {
  children: ReactNode;
}

export const ComplianceProvider: React.FC<ComplianceProviderProps> = ({ children }) => {
  // Pagination for reports
  const reportsPagination = usePagination({
    initialPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
  });

  // Pagination for findings
  const findingsPagination = usePagination({
    initialPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  });

  // Reports query with pagination
  const reportsQuery = useApiQuery<{ reports: ComplianceReport[]; total: number }>(
    `compliance-reports-page-${reportsPagination.page}-${reportsPagination.pageSize}`,
    `/compliance/reports?page=${reportsPagination.page}&limit=${reportsPagination.pageSize}&offset=${reportsPagination.offset}`,
    {
      refetchOnMount: true,
      cacheTime: 2 * 60 * 1000, // 2 minutes cache
      onSuccess: (data) => {
        if (data?.total !== undefined) {
          reportsPagination.setTotal(data.total);
        }
      },
      onError: (error) => console.error('[ComplianceContext] Failed to fetch reports:', error),
    }
  );

  // Reports search
  const reportsSearch = useSearch<{ reports: ComplianceReport[] }>(
    '/compliance/reports',
    'search',
    {
      debounceMs: 400,
      minQueryLength: 2,
    }
  );

  // Rules query
  const rulesQuery = useApiQuery<{ rules: ComplianceRule[] }>(
    'compliance-rules',
    '/compliance/rules',
    {
      refetchOnMount: true,
      cacheTime: 10 * 60 * 1000, // 10 minutes cache (rules change less frequently)
      onError: (error) => console.error('[ComplianceContext] Failed to fetch rules:', error),
    }
  );

  // Findings query with pagination
  const findingsQuery = useApiQuery<{ findings: ComplianceFinding[]; total: number }>(
    `compliance-findings-page-${findingsPagination.page}-${findingsPagination.pageSize}`,
    `/compliance/findings?page=${findingsPagination.page}&limit=${findingsPagination.pageSize}&offset=${findingsPagination.offset}`,
    {
      refetchOnMount: true,
      cacheTime: 1 * 60 * 1000, // 1 minute cache (findings change frequently)
      onSuccess: (data) => {
        if (data?.total !== undefined) {
          findingsPagination.setTotal(data.total);
        }
      },
      onError: (error) => console.error('[ComplianceContext] Failed to fetch findings:', error),
    }
  );

  // Mutations
  const createReportMutation = useApiMutation<ComplianceReport>(
    '/compliance/reports',
    'POST',
    {
      onSuccess: () => {
        reportsQuery.refetch();
        console.log('[ComplianceContext] Report created successfully');
      },
      onError: (error) => console.error('[ComplianceContext] Failed to create report:', error),
    }
  );

  const updateReportMutation = useApiMutation<ComplianceReport>(
    '',
    'PUT',
    {
      onSuccess: () => {
        reportsQuery.refetch();
        console.log('[ComplianceContext] Report updated successfully');
      },
      onError: (error) => console.error('[ComplianceContext] Failed to update report:', error),
    }
  );

  const deleteReportMutation = useApiMutation<void>(
    '',
    'DELETE',
    {
      onSuccess: () => {
        reportsQuery.refetch();
        console.log('[ComplianceContext] Report deleted successfully');
      },
      onError: (error) => console.error('[ComplianceContext] Failed to delete report:', error),
    }
  );

  const updateFindingMutation = useApiMutation<ComplianceFinding>(
    '',
    'PUT',
    {
      onSuccess: () => {
        findingsQuery.refetch();
        console.log('[ComplianceContext] Finding updated successfully');
      },
      onError: (error) => console.error('[ComplianceContext] Failed to update finding:', error),
    }
  );

  const updateRuleMutation = useApiMutation<ComplianceRule>(
    '',
    'PUT',
    {
      onSuccess: () => {
        rulesQuery.refetch();
        console.log('[ComplianceContext] Rule updated successfully');
      },
      onError: (error) => console.error('[ComplianceContext] Failed to update rule:', error),
    }
  );

  // Custom mutation wrappers
  const createReport = useCallback(async (data: { accountId: string; licenseId: string; reportType: ComplianceReport['reportType'] }) => {
    return await createReportMutation.mutate(data);
  }, [createReportMutation]);

  const updateReport = useCallback(async (data: { id: string; updates: Partial<ComplianceReport> }) => {
    const endpoint = `/compliance/reports/${data.id}`;
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://compliance-api-fybjasdddtcxhqfw.eastus2-01.azurewebsites.net/api/v1'}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data.updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update report: ${response.statusText}`);
    }

    const result = await response.json();
    await reportsQuery.refetch();
    return result;
  }, [reportsQuery]);

  const deleteReport = useCallback(async (id: string) => {
    const endpoint = `/compliance/reports/${id}`;
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://compliance-api-fybjasdddtcxhqfw.eastus2-01.azurewebsites.net/api/v1'}${endpoint}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete report: ${response.statusText}`);
    }

    await reportsQuery.refetch();
  }, [reportsQuery]);

  const updateFinding = useCallback(async (data: { id: string; updates: Partial<ComplianceFinding> }) => {
    const endpoint = `/compliance/findings/${data.id}`;
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://compliance-api-fybjasdddtcxhqfw.eastus2-01.azurewebsites.net/api/v1'}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data.updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update finding: ${response.statusText}`);
    }

    const result = await response.json();
    await findingsQuery.refetch();
    return result;
  }, [findingsQuery]);

  const updateRule = useCallback(async (data: { id: string; updates: Partial<ComplianceRule> }) => {
    const endpoint = `/compliance/rules/${data.id}`;
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://compliance-api-fybjasdddtcxhqfw.eastus2-01.azurewebsites.net/api/v1'}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data.updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update rule: ${response.statusText}`);
    }

    const result = await response.json();
    await rulesQuery.refetch();
    return result;
  }, [rulesQuery]);

  // Actions
  const refreshReports = useCallback(async () => {
    await reportsQuery.refetch();
  }, [reportsQuery]);

  const refreshRules = useCallback(async () => {
    await rulesQuery.refetch();
  }, [rulesQuery]);

  const refreshFindings = useCallback(async () => {
    await findingsQuery.refetch();
  }, [findingsQuery]);

  const clearAllErrors = useCallback(() => {
    reportsQuery.reset();
    rulesQuery.reset();
    findingsQuery.reset();
    reportsSearch.reset();
    createReportMutation.reset();
    updateReportMutation.reset();
    deleteReportMutation.reset();
    updateFindingMutation.reset();
    updateRuleMutation.reset();
  }, [
    reportsQuery,
    rulesQuery,
    findingsQuery,
    reportsSearch,
    createReportMutation,
    updateReportMutation,
    deleteReportMutation,
    updateFindingMutation,
    updateRuleMutation
  ]);

  const contextValue: ComplianceContextValue = {
    reports: {
      data: reportsQuery.data?.reports || null,
      loading: reportsQuery.loading,
      error: reportsQuery.error,
      pagination: reportsPagination,
      search: reportsSearch,
      refetch: reportsQuery.refetch,
      reset: reportsQuery.reset,
    },

    rules: {
      data: rulesQuery.data?.rules || null,
      loading: rulesQuery.loading,
      error: rulesQuery.error,
      refetch: rulesQuery.refetch,
      reset: rulesQuery.reset,
    },

    findings: {
      data: findingsQuery.data?.findings || null,
      loading: findingsQuery.loading,
      error: findingsQuery.error,
      pagination: findingsPagination,
      refetch: findingsQuery.refetch,
      reset: findingsQuery.reset,
    },

    operations: {
      createReport: {
        mutate: createReport,
        loading: createReportMutation.loading,
        error: createReportMutation.error,
      },
      updateReport: {
        mutate: updateReport,
        loading: updateReportMutation.loading,
        error: updateReportMutation.error,
      },
      deleteReport: {
        mutate: deleteReport,
        loading: deleteReportMutation.loading,
        error: deleteReportMutation.error,
      },
      updateFinding: {
        mutate: updateFinding,
        loading: updateFindingMutation.loading,
        error: updateFindingMutation.error,
      },
      updateRule: {
        mutate: updateRule,
        loading: updateRuleMutation.loading,
        error: updateRuleMutation.error,
      },
    },

    actions: {
      refreshReports,
      refreshRules,
      refreshFindings,
      clearAllErrors,
    },
  };

  return (
    <ComplianceContext.Provider value={contextValue}>
      {children}
    </ComplianceContext.Provider>
  );
};

// Hook to use compliance context
export const useComplianceContext = (): ComplianceContextValue => {
  const context = useContext(ComplianceContext);
  if (context === undefined) {
    throw new Error('useComplianceContext must be used within a ComplianceProvider');
  }
  return context;
};

// Convenience hooks for specific compliance operations
export const useComplianceReports = () => {
  const { reports, actions } = useComplianceContext();
  return {
    ...reports,
    refresh: actions.refreshReports,
  };
};

export const useComplianceRules = () => {
  const { rules, actions } = useComplianceContext();
  return {
    ...rules,
    refresh: actions.refreshRules,
  };
};

export const useComplianceFindings = () => {
  const { findings, actions } = useComplianceContext();
  return {
    ...findings,
    refresh: actions.refreshFindings,
  };
};

export const useComplianceOperations = () => {
  const { operations } = useComplianceContext();
  return operations;
};