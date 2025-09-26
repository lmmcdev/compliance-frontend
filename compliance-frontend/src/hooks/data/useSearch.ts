import { useState, useCallback, useMemo, useEffect } from 'react';
import { useApiQuery } from './useApiQuery';

interface SearchState {
  query: string;
  isSearching: boolean;
  hasSearched: boolean;
}

interface UseSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  searchOnMount?: boolean;
  enabledByDefault?: boolean;
}

interface UseSearchResult<T> extends SearchState {
  data: T | null;
  loading: boolean;
  error: string | null;
  setQuery: (query: string) => void;
  clearSearch: () => void;
  refetch: () => Promise<void>;
  reset: () => void;
}

export function useSearch<T = any>(
  baseEndpoint: string,
  queryParam: string = 'search',
  options: UseSearchOptions = {}
): UseSearchResult<T> {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    searchOnMount = false,
    enabledByDefault = true,
  } = options;

  const [query, setQueryState] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Build the search endpoint
  const searchEndpoint = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < minQueryLength) {
      return '';
    }

    const separator = baseEndpoint.includes('?') ? '&' : '?';
    return `${baseEndpoint}${separator}${queryParam}=${encodeURIComponent(debouncedQuery)}`;
  }, [baseEndpoint, debouncedQuery, queryParam, minQueryLength]);

  // Determine if search should be enabled
  const isSearchEnabled = useMemo(() => {
    const hasValidQuery = debouncedQuery.length >= minQueryLength;
    return enabledByDefault && (hasValidQuery || searchOnMount);
  }, [debouncedQuery, minQueryLength, enabledByDefault, searchOnMount]);

  // Use the API query hook for actual data fetching
  const {
    data,
    loading,
    error,
    refetch: apiRefetch,
    reset: apiReset,
  } = useApiQuery<T>(
    `search-${baseEndpoint}-${debouncedQuery}`,
    searchEndpoint,
    {
      enabled: isSearchEnabled && !!searchEndpoint,
      refetchOnMount: searchOnMount,
      cacheTime: 2 * 60 * 1000, // 2 minutes cache for search results
    }
  );

  const isSearching = useMemo(() => {
    return loading && !!debouncedQuery;
  }, [loading, debouncedQuery]);

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    if (newQuery.length >= minQueryLength) {
      setHasSearched(true);
    }
  }, [minQueryLength]);

  const clearSearch = useCallback(() => {
    setQueryState('');
    setDebouncedQuery('');
    setHasSearched(false);
    apiReset();
  }, [apiReset]);

  const refetch = useCallback(async () => {
    if (searchEndpoint) {
      await apiRefetch();
    }
  }, [apiRefetch, searchEndpoint]);

  const reset = useCallback(() => {
    clearSearch();
    apiReset();
  }, [clearSearch, apiReset]);

  // Track search state changes
  useEffect(() => {
    if (debouncedQuery.length >= minQueryLength && !hasSearched) {
      setHasSearched(true);
    }
  }, [debouncedQuery, minQueryLength, hasSearched]);

  return {
    query,
    isSearching,
    hasSearched,
    data,
    loading,
    error,
    setQuery,
    clearSearch,
    refetch,
    reset,
  };
}