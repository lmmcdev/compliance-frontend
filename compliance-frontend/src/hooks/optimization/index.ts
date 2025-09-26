// Memoization hooks
export { useMemoCompare, useDeepMemo, useShallowMemo, useArrayMemo } from './useMemoCompare';

// Virtualization hooks
export { useVirtualization, useGridVirtualization } from './useVirtualization';
export type {
  VirtualizationOptions,
  VirtualizedItem,
  UseVirtualizationResult,
  GridVirtualizationOptions,
  VirtualizedGridItem,
  UseGridVirtualizationResult,
} from './useVirtualization';

// Performance monitoring hooks
export {
  usePerformanceMonitor,
  useRenderCount,
  useWhyDidYouUpdate,
  useMemoryMonitor,
} from './usePerformanceMonitor';
export type {
  PerformanceMetrics,
  UsePerformanceMonitorOptions,
  UseRenderCountOptions,
  UseWhyDidYouUpdateOptions,
  MemoryUsage,
} from './usePerformanceMonitor';