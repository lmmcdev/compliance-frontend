import { useState, useCallback, useRef } from 'react';
import { apiClient } from '../../middleware/apiClient';
import type { AxiosResponse, AxiosError } from 'axios';

interface ApiMutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onSettled?: () => void;
}

interface UseApiMutationResult<T> extends ApiMutationState<T> {
  mutate: (data?: any) => Promise<T>;
  reset: () => void;
}

export function useApiMutation<T = any>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
  options: UseApiMutationOptions = {}
): UseApiMutationResult<T> {
  const {
    onSuccess,
    onError,
    onSettled,
  } = options;

  const [state, setState] = useState<ApiMutationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const mutate = useCallback(async (data?: any): Promise<T> => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      console.log(`[useApiMutation] ${method} request to ${endpoint}`, data);

      let response: AxiosResponse<T>;

      switch (method) {
        case 'POST':
          response = await apiClient.post(endpoint, data, {
            signal: abortControllerRef.current.signal,
          });
          break;
        case 'PUT':
          response = await apiClient.put(endpoint, data, {
            signal: abortControllerRef.current.signal,
          });
          break;
        case 'PATCH':
          response = await apiClient.patch(endpoint, data, {
            signal: abortControllerRef.current.signal,
          });
          break;
        case 'DELETE':
          response = await apiClient.delete(endpoint, {
            signal: abortControllerRef.current.signal,
          });
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      setState({
        data: response.data,
        loading: false,
        error: null,
      });

      if (onSuccess) {
        onSuccess(response.data);
      }

      console.log(`[useApiMutation] ${method} request successful`);
      return response.data;

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log(`[useApiMutation] ${method} request cancelled`);
        return Promise.reject(error);
      }

      const axiosError = error as AxiosError;
      const errorMessage = typeof axiosError.response?.data === 'string'
        ? axiosError.response.data
        : axiosError.message || 'An error occurred';

      console.error(`[useApiMutation] ${method} request failed:`, errorMessage);

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });

      if (onError) {
        onError(errorMessage);
      }

      throw error;
    } finally {
      if (onSettled) {
        onSettled();
      }
      abortControllerRef.current = null;
    }
  }, [endpoint, method, onSuccess, onError, onSettled]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}