import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export function useDebounce<T>(
  value: T,
  delay: number,
  options: DebounceOptions = {}
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const { leading = false, trailing = true, maxWait } = options;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let maxTimeoutId: NodeJS.Timeout | undefined;

    const updateValue = () => {
      setDebouncedValue(value);
      if (maxTimeoutId) {
        clearTimeout(maxTimeoutId);
        maxTimeoutId = undefined;
      }
    };

    // Handle leading edge
    if (leading && debouncedValue !== value) {
      updateValue();
      return;
    }

    // Set up trailing edge
    if (trailing) {
      timeoutId = setTimeout(updateValue, delay);

      // Set up max wait timeout
      if (maxWait && !maxTimeoutId) {
        maxTimeoutId = setTimeout(updateValue, maxWait);
      }
    }

    return () => {
      clearTimeout(timeoutId);
      if (maxTimeoutId) {
        clearTimeout(maxTimeoutId);
      }
    };
  }, [value, delay, leading, trailing, maxWait, debouncedValue]);

  return debouncedValue;
}

export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  const { leading = false, trailing = true, maxWait } = options;
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const maxTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastCallTimeRef = useRef<number | undefined>(undefined);
  const lastInvokeTimeRef = useRef<number>(0);
  const lastArgsRef = useRef<Parameters<T> | undefined>(undefined);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const invokeFunction = useCallback(() => {
    const args = lastArgsRef.current;
    if (args) {
      callbackRef.current(...args);
      lastInvokeTimeRef.current = Date.now();
    }
  }, []);

  const startTimer = useCallback((pendingFunc: () => void, wait: number) => {
    return setTimeout(pendingFunc, wait);
  }, []);

  const shouldInvoke = useCallback((time: number) => {
    const timeSinceLastCall = time - (lastCallTimeRef.current || 0);
    const timeSinceLastInvoke = time - lastInvokeTimeRef.current;

    return (
      lastCallTimeRef.current === undefined ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }, [delay, maxWait]);

  const trailingEdge = useCallback((_time: number) => {
    timeoutRef.current = undefined;

    if (trailing && lastArgsRef.current) {
      invokeFunction();
    }
    lastArgsRef.current = undefined;
  }, [trailing, invokeFunction]);

  const timerExpired = useCallback(() => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }

    const timeSinceLastCall = time - (lastCallTimeRef.current || 0);
    const remainingWait = delay - timeSinceLastCall;
    timeoutRef.current = startTimer(timerExpired, remainingWait);
  }, [shouldInvoke, trailingEdge, delay, startTimer]);

  const leadingEdge = useCallback((time: number) => {
    lastInvokeTimeRef.current = time;
    timeoutRef.current = startTimer(timerExpired, delay);

    if (leading) {
      invokeFunction();
    }
  }, [leading, invokeFunction, timerExpired, delay, startTimer]);

  const debouncedFunction = useCallback((...args: Parameters<T>) => {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgsRef.current = args;
    lastCallTimeRef.current = time;

    if (isInvoking) {
      if (timeoutRef.current === undefined) {
        return leadingEdge(time);
      }
      if (maxWait !== undefined) {
        timeoutRef.current = startTimer(timerExpired, delay);
        if (maxTimeoutRef.current === undefined) {
          maxTimeoutRef.current = startTimer(timerExpired, maxWait);
        }
        return invokeFunction();
      }
    }

    if (timeoutRef.current === undefined) {
      timeoutRef.current = startTimer(timerExpired, delay);
    }
  }, [shouldInvoke, leadingEdge, timerExpired, delay, maxWait, startTimer, invokeFunction]);

  const cancel = useCallback(() => {
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (maxTimeoutRef.current !== undefined) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = undefined;
    }
    lastInvokeTimeRef.current = 0;
    lastCallTimeRef.current = undefined;
    lastArgsRef.current = undefined;
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current !== undefined && lastArgsRef.current) {
      invokeFunction();
      cancel();
    }
  }, [invokeFunction, cancel]);

  const pending = useCallback(() => {
    return timeoutRef.current !== undefined;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cancel;
  }, [cancel]);

  return useMemo(() => {
    const fn = debouncedFunction as DebouncedFunction<T>;
    fn.cancel = cancel;
    fn.flush = flush;
    fn.pending = pending;
    return fn;
  }, [debouncedFunction, cancel, flush, pending]);
}

export default useDebounce;