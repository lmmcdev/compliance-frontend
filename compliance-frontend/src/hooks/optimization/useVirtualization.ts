import { useState, useMemo, useCallback } from 'react';

export interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  scrollOffset?: number;
}

export interface VirtualizedItem<T> {
  index: number;
  data: T;
  style: React.CSSProperties;
  isVisible: boolean;
}

export interface UseVirtualizationResult<T> {
  virtualizedItems: VirtualizedItem<T>[];
  totalHeight: number;
  scrollElementProps: {
    style: React.CSSProperties;
    onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  };
  containerProps: {
    style: React.CSSProperties;
  };
}

export function useVirtualization<T>(
  items: T[],
  options: VirtualizationOptions
): UseVirtualizationResult<T> {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    scrollOffset = 0,
  } = options;

  const [scrollTop, setScrollTop] = useState(scrollOffset);

  const totalHeight = useMemo(() => {
    return items.length * itemHeight;
  }, [items.length, itemHeight]);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(items.length - 1, endIndex + overscan),
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const virtualizedItems = useMemo(() => {
    const result: VirtualizedItem<T>[] = [];

    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      const item = items[i];
      if (item !== undefined) {
        result.push({
          index: i,
          data: item,
          style: {
            position: 'absolute',
            top: i * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight,
          },
          isVisible: i >= Math.floor(scrollTop / itemHeight) &&
                    i <= Math.floor(scrollTop / itemHeight) + Math.ceil(containerHeight / itemHeight),
        });
      }
    }

    return result;
  }, [items, visibleRange, itemHeight, scrollTop, containerHeight]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const scrollElementProps = useMemo(() => ({
    style: {
      height: containerHeight,
      overflow: 'auto' as const,
      position: 'relative' as const,
    },
    onScroll: handleScroll,
  }), [containerHeight, handleScroll]);

  const containerProps = useMemo(() => ({
    style: {
      height: totalHeight,
      position: 'relative' as const,
    },
  }), [totalHeight]);

  return {
    virtualizedItems,
    totalHeight,
    scrollElementProps,
    containerProps,
  };
}

export interface GridVirtualizationOptions {
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  columns: number;
  overscan?: number;
  gap?: number;
}

export interface VirtualizedGridItem<T> {
  index: number;
  row: number;
  column: number;
  data: T;
  style: React.CSSProperties;
  isVisible: boolean;
}

export interface UseGridVirtualizationResult<T> {
  virtualizedItems: VirtualizedGridItem<T>[];
  totalHeight: number;
  scrollElementProps: {
    style: React.CSSProperties;
    onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  };
  containerProps: {
    style: React.CSSProperties;
  };
}

export function useGridVirtualization<T>(
  items: T[],
  options: GridVirtualizationOptions
): UseGridVirtualizationResult<T> {
  const {
    itemWidth,
    itemHeight,
    containerWidth,
    containerHeight,
    columns,
    overscan = 5,
    gap = 0,
  } = options;

  const [scrollTop, setScrollTop] = useState(0);

  const rows = Math.ceil(items.length / columns);
  const totalHeight = rows * (itemHeight + gap) - gap;

  const visibleRowRange = useMemo(() => {
    const startRow = Math.floor(scrollTop / (itemHeight + gap));
    const endRow = Math.min(
      startRow + Math.ceil(containerHeight / (itemHeight + gap)),
      rows - 1
    );

    return {
      start: Math.max(0, startRow - overscan),
      end: Math.min(rows - 1, endRow + overscan),
    };
  }, [scrollTop, itemHeight, gap, containerHeight, rows, overscan]);

  const virtualizedItems = useMemo(() => {
    const result: VirtualizedGridItem<T>[] = [];

    for (let row = visibleRowRange.start; row <= visibleRowRange.end; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        const item = items[index];

        if (item !== undefined) {
          result.push({
            index,
            row,
            column: col,
            data: item,
            style: {
              position: 'absolute',
              top: row * (itemHeight + gap),
              left: col * (itemWidth + gap),
              width: itemWidth,
              height: itemHeight,
            },
            isVisible: row >= Math.floor(scrollTop / (itemHeight + gap)) &&
                      row <= Math.floor(scrollTop / (itemHeight + gap)) + Math.ceil(containerHeight / (itemHeight + gap)),
          });
        }
      }
    }

    return result;
  }, [items, visibleRowRange, columns, itemWidth, itemHeight, gap, scrollTop, containerHeight]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const scrollElementProps = useMemo(() => ({
    style: {
      height: containerHeight,
      width: containerWidth,
      overflow: 'auto' as const,
      position: 'relative' as const,
    },
    onScroll: handleScroll,
  }), [containerHeight, containerWidth, handleScroll]);

  const containerProps = useMemo(() => ({
    style: {
      height: totalHeight,
      width: containerWidth,
      position: 'relative' as const,
    },
  }), [totalHeight, containerWidth]);

  return {
    virtualizedItems,
    totalHeight,
    scrollElementProps,
    containerProps,
  };
}

export default useVirtualization;