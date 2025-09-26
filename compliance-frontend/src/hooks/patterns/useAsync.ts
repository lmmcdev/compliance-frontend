import { useState, useCallback, useRef, useEffect } from 'react';

export type AsyncStatus = 'idle' | 'pending' | 'resolved' | 'rejected';

export interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  status: AsyncStatus;
  loading: boolean;
}

export interface AsyncOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  resetOnExecute?: boolean;
  throwOnError?: boolean;
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface UseAsyncResult<T, P extends any[] = []> {
  data: T | null;
  error: Error | null;
  status: AsyncStatus;
  loading: boolean;
  execute: (...params: P) => Promise<T>;
  reset: () => void;
  cancel: () => void;
  retry: () => Promise<T>;
}

export function useAsync<T, P extends any[] = []>(
  asyncFunction: (...params: P) => Promise<T>,
  options: AsyncOptions<T> = {}
): UseAsyncResult<T, P> {
  const {
    immediate = false,
    onSuccess,
    onError,
    resetOnExecute = false,
    throwOnError = false,
    retryCount = 0,
    retryDelay = 1000,
    timeout,
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    status: 'idle',
    loading: false,
  });

  const mountedRef = useRef(true);
  const cancelRef = useRef<AbortController | null>(null);
  const lastParamsRef = useRef<P | null>(null);
  const retryCountRef = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cancelRef.current?.abort();
    };
  }, []);

  const safeSetState = useCallback((newState: Partial<AsyncState<T>>) => {
    if (mountedRef.current) {
      setState(prevState => ({ ...prevState, ...newState }));
    }
  }, []);

  const execute = useCallback(async (...params: P): Promise<T> => {
    if (resetOnExecute) {
      safeSetState({
        data: null,
        error: null,
        status: 'idle',
        loading: false,
      });
    }

    // Cancel previous request
    cancelRef.current?.abort();
    cancelRef.current = new AbortController();

    // Store params for retry
    lastParamsRef.current = params;
    retryCountRef.current = 0;

    safeSetState({
      status: 'pending',
      loading: true,
      error: null,
    });

    try {
      let promise = asyncFunction(...params);

      // Add timeout if specified
      if (timeout) {
        promise = Promise.race([
          promise,
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), timeout);
          }),
        ]);
      }

      const data = await promise;

      if (cancelRef.current.signal.aborted) {
        throw new Error('Request was cancelled');
      }

      safeSetState({
        data,
        status: 'resolved',
        loading: false,
        error: null,
      });

      onSuccess?.(data);
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      if (cancelRef.current.signal.aborted) {
        return Promise.reject(err);
      }

      // Retry logic
      if (retryCountRef.current < retryCount && err.message !== 'Request was cancelled') {
        retryCountRef.current++;

        await new Promise(resolve => setTimeout(resolve, retryDelay));

        if (mountedRef.current && !cancelRef.current.signal.aborted) {
          return execute(...params);
        }
      }

      safeSetState({
        error: err,
        status: 'rejected',
        loading: false,
      });

      onError?.(err);

      if (throwOnError) {
        throw err;
      }

      return Promise.reject(err);
    }
  }, [
    asyncFunction,
    onSuccess,
    onError,
    resetOnExecute,
    throwOnError,
    retryCount,
    retryDelay,
    timeout,
    safeSetState,
  ]);

  const reset = useCallback(() => {
    cancelRef.current?.abort();
    safeSetState({
      data: null,
      error: null,
      status: 'idle',
      loading: false,
    });
    lastParamsRef.current = null;
    retryCountRef.current = 0;
  }, [safeSetState]);

  const cancel = useCallback(() => {
    cancelRef.current?.abort();
    safeSetState({
      loading: false,
      status: 'idle',
    });
  }, [safeSetState]);

  const retry = useCallback(async (): Promise<T> => {
    if (!lastParamsRef.current) {
      throw new Error('No previous execution to retry');
    }
    return execute(...lastParamsRef.current);
  }, [execute]);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate && lastParamsRef.current === null) {
      execute(...([] as unknown as P));
    }
  }, [immediate, execute]);

  return {
    data: state.data,
    error: state.error,
    status: state.status,
    loading: state.loading,
    execute,
    reset,
    cancel,
    retry,
  };
}

export default useAsync;