import { useRef, useEffect } from 'react';

type CompareFn<T> = (prev: T | undefined, next: T) => boolean;

export function useMemoCompare<T>(
  next: T,
  compare: CompareFn<T>
): T {
  const previousRef = useRef<T | undefined>(undefined);
  const previous = previousRef.current;

  const isEqual = compare(previous, next);

  useEffect(() => {
    if (!isEqual) {
      previousRef.current = next;
    }
  }, [isEqual, next]);

  return isEqual ? previous! : next;
}

export function useDeepMemo<T>(value: T): T {
  return useMemoCompare(value, (prev, next) => {
    return JSON.stringify(prev) === JSON.stringify(next);
  });
}

export function useShallowMemo<T extends Record<string, any>>(value: T): T {
  return useMemoCompare(value, (prev, next) => {
    if (!prev || !next) return prev === next;

    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);

    if (prevKeys.length !== nextKeys.length) return false;

    return prevKeys.every(key => prev[key] === next[key]);
  });
}

export function useArrayMemo<T>(array: T[]): T[] {
  return useMemoCompare(array, (prev, next) => {
    if (!prev || !next) return prev === next;
    if (prev.length !== next.length) return false;
    return prev.every((item, index) => item === next[index]);
  });
}

export default useMemoCompare;