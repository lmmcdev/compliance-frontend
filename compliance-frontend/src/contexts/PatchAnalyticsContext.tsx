import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { patchAnalyticsService } from '../services/patchAnalyticsService';
import type { PatchAnalyticsData, PatchAnalyticsFilters } from '../types/patchAnalytics';

interface PatchAnalyticsContextValue {
  data: PatchAnalyticsData | null;
  loading: boolean;
  error: string | null;
  filters: PatchAnalyticsFilters;
  setFilters: (filters: PatchAnalyticsFilters) => void;
  refresh: () => Promise<void>;
}

const PatchAnalyticsContext = createContext<PatchAnalyticsContextValue | undefined>(undefined);

interface PatchAnalyticsProviderProps {
  children: ReactNode;
}

export const PatchAnalyticsProvider: React.FC<PatchAnalyticsProviderProps> = ({ children }) => {
  const [data, setData] = useState<PatchAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<PatchAnalyticsFilters>({});

  // Fetch function using the service
  const fetchData = useCallback(async (currentFilters: PatchAnalyticsFilters) => {
    try {
      setLoading(true);
      setError(null);

      const analyticsResult = await patchAnalyticsService.getPatchAnalytics(currentFilters);
      setData(analyticsResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patch analytics';
      setError(errorMessage);
      console.error('[PatchAnalyticsContext] Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters and refetch
  const setFilters = useCallback((newFilters: PatchAnalyticsFilters) => {
    setFiltersState(newFilters);
    fetchData(newFilters);
  }, [fetchData]);

  // Refresh with current filters
  const refresh = useCallback(async () => {
    await fetchData(filters);
  }, [fetchData, filters]);

  // Fetch on mount
  useEffect(() => {
    fetchData(filters);
  }, []); // Only on mount

  // Context value with stable reference
  const contextValue: PatchAnalyticsContextValue = React.useMemo(
    () => ({
      data,
      loading,
      error,
      filters,
      setFilters,
      refresh,
    }),
    [data, loading, error, filters, setFilters, refresh]
  );

  return (
    <PatchAnalyticsContext.Provider value={contextValue}>
      {children}
    </PatchAnalyticsContext.Provider>
  );
};

export const usePatchAnalytics = (): PatchAnalyticsContextValue => {
  const context = useContext(PatchAnalyticsContext);
  if (context === undefined) {
    throw new Error('usePatchAnalytics must be used within a PatchAnalyticsProvider');
  }
  return context;
};
