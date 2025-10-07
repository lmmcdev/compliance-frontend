import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { incidentAnalyticsService } from '../services/incidentAnalyticsService';
import type { IncidentAnalyticsData } from '../types/incidentAnalytics';

interface IncidentAnalyticsContextValue {
  data: IncidentAnalyticsData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const IncidentAnalyticsContext = createContext<IncidentAnalyticsContextValue | undefined>(undefined);

interface IncidentAnalyticsProviderProps {
  children: ReactNode;
}

export const IncidentAnalyticsProvider: React.FC<IncidentAnalyticsProviderProps> = ({ children }) => {
  const [data, setData] = useState<IncidentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch function using the service
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await incidentAnalyticsService.getIncidentAnalytics();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch incident analytics';
      setError(errorMessage);
      console.error('[IncidentAnalyticsContext] Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Context value with stable reference
  const contextValue: IncidentAnalyticsContextValue = React.useMemo(
    () => ({
      data,
      loading,
      error,
      refresh: fetchData,
    }),
    [data, loading, error, fetchData]
  );

  return (
    <IncidentAnalyticsContext.Provider value={contextValue}>
      {children}
    </IncidentAnalyticsContext.Provider>
  );
};

export const useIncidentAnalytics = (): IncidentAnalyticsContextValue => {
  const context = useContext(IncidentAnalyticsContext);
  if (context === undefined) {
    throw new Error('useIncidentAnalytics must be used within an IncidentAnalyticsProvider');
  }
  return context;
};
