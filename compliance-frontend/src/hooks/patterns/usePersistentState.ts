import { useState, useEffect, useCallback, useRef } from 'react';

export type StorageType = 'localStorage' | 'sessionStorage';

export interface PersistentStateOptions<T> {
  serializer?: {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
  };
  storageType?: StorageType;
  syncAcrossTabs?: boolean;
  onError?: (error: Error) => void;
  validate?: (value: unknown) => value is T;
}

const defaultSerializer = {
  serialize: JSON.stringify,
  deserialize: JSON.parse,
};

export function usePersistentState<T>(
  key: string,
  initialValue: T,
  options: PersistentStateOptions<T> = {}
): [T, (value: T | ((prevValue: T) => T)) => void, () => void] {
  const {
    serializer = defaultSerializer,
    storageType = 'localStorage',
    syncAcrossTabs = true,
    onError,
    validate,
  } = options;

  const storage = typeof window !== 'undefined' ? window[storageType] : null;
  const isClient = typeof window !== 'undefined';
  const initialValueRef = useRef(initialValue);

  // Get initial value from storage
  const getStoredValue = useCallback((): T => {
    if (!isClient || !storage) {
      return initialValueRef.current;
    }

    try {
      const item = storage.getItem(key);
      if (item === null) {
        return initialValueRef.current;
      }

      const parsed = serializer.deserialize(item);

      // Validate the parsed value if validator provided
      if (validate && !validate(parsed)) {
        console.warn(`Invalid data found in storage for key "${key}", using initial value`);
        return initialValueRef.current;
      }

      return parsed;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      console.error(`Error reading from ${storageType}:`, err);
      return initialValueRef.current;
    }
  }, [key, serializer, storage, isClient, validate, onError, storageType]);

  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // Update storage when state changes
  const setValue = useCallback((value: T | ((prevValue: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (isClient && storage) {
        const serializedValue = serializer.serialize(valueToStore);
        storage.setItem(key, serializedValue);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      console.error(`Error writing to ${storageType}:`, err);
    }
  }, [key, serializer, storage, isClient, storedValue, onError, storageType]);

  // Remove item from storage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValueRef.current);
      if (isClient && storage) {
        storage.removeItem(key);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      console.error(`Error removing from ${storageType}:`, err);
    }
  }, [key, storage, isClient, onError, storageType]);

  // Listen for storage changes (cross-tab synchronization)
  useEffect(() => {
    if (!syncAcrossTabs || !isClient || storageType !== 'localStorage') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = serializer.deserialize(e.newValue);

          // Validate the new value if validator provided
          if (validate && !validate(newValue)) {
            console.warn(`Invalid data received from storage event for key "${key}"`);
            return;
          }

          setStoredValue(newValue);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          onError?.(err);
          console.error('Error parsing storage event data:', err);
        }
      } else if (e.key === key && e.newValue === null) {
        // Item was removed
        setStoredValue(initialValueRef.current);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, serializer, syncAcrossTabs, isClient, storageType, validate, onError]);

  // Update stored value if storage content changes on mount
  useEffect(() => {
    const currentStoredValue = getStoredValue();
    if (currentStoredValue !== storedValue) {
      setStoredValue(currentStoredValue);
    }
  }, []);

  return [storedValue, setValue, removeValue];
}

export interface UsePersistentStateResult<T> {
  value: T;
  setValue: (value: T | ((prevValue: T) => T)) => void;
  removeValue: () => void;
  isHydrated: boolean;
}

export function usePersistentStateObject<T>(
  key: string,
  initialValue: T,
  options: PersistentStateOptions<T> = {}
): UsePersistentStateResult<T> {
  const [isHydrated, setIsHydrated] = useState(false);
  const [value, setValue, removeValue] = usePersistentState(key, initialValue, options);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return {
    value,
    setValue,
    removeValue,
    isHydrated,
  };
}

export default usePersistentState;