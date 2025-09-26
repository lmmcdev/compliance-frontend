import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../../middleware/apiClient';
import type { AxiosResponse, AxiosError } from 'axios';

interface ApiQueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

interface UseApiQueryOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchInterval?: number;
  cacheTime?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

interface UseApiQueryResult<T> extends ApiQueryState<T> {
  refetch: () => Promise<void>;
  reset: () => void;
  isFetching: boolean;
}

/**
 * Generic hook for API queries that leverages the centralized Azure Functions client
 */
export function useApiQuery<T = any>(
  key: string,
  endpoint: string,
  options: UseApiQueryOptions = {}
): UseApiQueryResult<T> {
  const {
    enabled = true,
    refetchOnMount = true,
    refetchInterval,
    cacheTime = 5 * 60 * 1000, // 5 minutes default cache
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<ApiQueryState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetched: null,
  });

  const [isFetching, setIsFetching] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (ignoreCache = false) => {
    if (!enabled) return;

    // Check cache validity
    if (!ignoreCache && state.data && state.lastFetched && cacheTime > 0) {
      const cacheAge = Date.now() - state.lastFetched.getTime();
      if (cacheAge < cacheTime) {
        console.log(`[useApiQuery] Using cached data for ${key}`);
        return;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsFetching(true);

    if (!state.data) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      console.log(`[useApiQuery] Fetching data for ${key} from ${endpoint}`);

      const response: AxiosResponse<T> = await apiClient.get(endpoint, {
        signal: abortControllerRef.current.signal,
      });

      const newState = {
        data: response.data,
        loading: false,
        error: null,
        lastFetched: new Date(),
      };

      setState(newState);

      if (onSuccess) {
        onSuccess(response.data);
      }

      console.log(`[useApiQuery] Successfully fetched data for ${key}`);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log(`[useApiQuery] Request cancelled for ${key}`);
        return;
      }

      const axiosError = error as AxiosError;
      const errorMessage = typeof axiosError.response?.data === 'string'
        ? axiosError.response.data
        : axiosError.message || 'An error occurred';

      console.error(`[useApiQuery] Error fetching ${key}:`, errorMessage);

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsFetching(false);
      abortControllerRef.current = null;
    }
  }, [key, endpoint, enabled, cacheTime, state.data, state.lastFetched, onSuccess, onError]);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    });
  }, []);

  // Initial fetch
  useEffect(() => {
    if (enabled && refetchOnMount) {
      fetchData();
    }
  }, [enabled, refetchOnMount, fetchData]);

  // Auto-refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        fetchData();
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refetchInterval, enabled, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    refetch,
    reset,
    isFetching,
  };
}