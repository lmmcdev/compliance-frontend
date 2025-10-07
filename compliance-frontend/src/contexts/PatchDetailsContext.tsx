import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { patchAnalyticsService } from '../services/patchAnalyticsService';
import type { PatchAnalyticsData, PatchAnalyticsFilters, DeviceCountData } from '../types/patchAnalytics';

interface PatchDetailsFilters {
  Site_name: string;
  month: string;
}

interface PatchDetailsContextValue {
  patchData: PatchAnalyticsData | null;
  deviceData: DeviceCountData | null;
  loading: boolean;
  error: string | null;
  filters: PatchDetailsFilters | null;
  setFilters: (filters: PatchDetailsFilters) => void;
  refresh: () => Promise<void>;
}

const PatchDetailsContext = createContext<PatchDetailsContextValue | undefined>(undefined);

interface PatchDetailsProviderProps {
  children: ReactNode;
}

export const PatchDetailsProvider: React.FC<PatchDetailsProviderProps> = ({ children }) => {
  const [patchData, setPatchData] = useState<PatchAnalyticsData | null>(null);
  const [deviceData, setDeviceData] = useState<DeviceCountData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<PatchDetailsFilters | null>(null);

  // Fetch function using the service
  const fetchData = useCallback(async (currentFilters: PatchDetailsFilters) => {
    try {
      setLoading(true);
      setError(null);

      const patchFilters: PatchAnalyticsFilters = {
        Site_name: currentFilters.Site_name,
        month: currentFilters.month,
      };

      const deviceFilters = {
        Site_name: currentFilters.Site_name,
      };

      // Fetch both patch analytics and device count in parallel
      const [patchResult, deviceResult] = await Promise.all([
        patchAnalyticsService.getPatchAnalytics(patchFilters),
        patchAnalyticsService.getDeviceCount(deviceFilters),
      ]);

      setPatchData(patchResult);
      setDeviceData(deviceResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patch details';
      setError(errorMessage);
      console.error('[PatchDetailsContext] Error fetching details:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters and refetch
  const setFilters = useCallback((newFilters: PatchDetailsFilters) => {
    setFiltersState(newFilters);
    fetchData(newFilters);
  }, [fetchData]);

  // Refresh with current filters
  const refresh = useCallback(async () => {
    if (filters) {
      await fetchData(filters);
    }
  }, [fetchData, filters]);

  // Context value with stable reference
  const contextValue: PatchDetailsContextValue = React.useMemo(
    () => ({
      patchData,
      deviceData,
      loading,
      error,
      filters,
      setFilters,
      refresh,
    }),
    [patchData, deviceData, loading, error, filters, setFilters, refresh]
  );

  return (
    <PatchDetailsContext.Provider value={contextValue}>
      {children}
    </PatchDetailsContext.Provider>
  );
};

export const usePatchDetails = (): PatchDetailsContextValue => {
  const context = useContext(PatchDetailsContext);
  if (context === undefined) {
    throw new Error('usePatchDetails must be used within a PatchDetailsProvider');
  }
  return context;
};
