import { useEffect, useRef, useCallback, useState } from 'react';

export interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  propsChanged: string[];
  reRenderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
}

export interface UsePerformanceMonitorOptions {
  enabled?: boolean;
  logToConsole?: boolean;
  trackProps?: boolean;
  componentName?: string;
  threshold?: number; // Log warning if render time exceeds this (ms)
}

export function usePerformanceMonitor(
  props?: Record<string, any>,
  options: UsePerformanceMonitorOptions = {}
): PerformanceMetrics {
  const {
    enabled = process.env.NODE_ENV === 'development',
    logToConsole = false,
    trackProps = false,
    componentName = 'Unknown Component',
    threshold = 16, // 16ms = 60fps threshold
  } = options;

  const renderStartTime = useRef<number>(0);
  const previousProps = useRef<Record<string, any> | undefined>(undefined);
  const renderTimes = useRef<number[]>([]);
  const reRenderCount = useRef<number>(0);

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentName,
    propsChanged: [],
    reRenderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
  });

  // Start timing at the beginning of render
  if (enabled) {
    renderStartTime.current = performance.now();
  }

  // Calculate which props changed
  const propsChanged = useCallback(() => {
    if (!trackProps || !props || !previousProps.current) {
      return [];
    }

    const changed: string[] = [];
    const allKeys = new Set([...Object.keys(props), ...Object.keys(previousProps.current)]);

    allKeys.forEach(key => {
      if (props[key] !== previousProps.current![key]) {
        changed.push(key);
      }
    });

    return changed;
  }, [props, trackProps]);

  // Effect to measure render completion
  useEffect(() => {
    if (!enabled) return;

    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;

    // Update render times array (keep last 10 renders)
    renderTimes.current.push(renderTime);
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift();
    }

    // Calculate average
    const averageRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;

    // Get changed props
    const changedProps = propsChanged();

    // Update re-render count
    reRenderCount.current += 1;

    // Update metrics
    const newMetrics: PerformanceMetrics = {
      renderTime,
      componentName,
      propsChanged: changedProps,
      reRenderCount: reRenderCount.current,
      averageRenderTime,
      lastRenderTime: renderTime,
    };

    setMetrics(newMetrics);

    // Log to console if enabled
    if (logToConsole) {
      const logLevel = renderTime > threshold ? 'warn' : 'log';
      console[logLevel](`[Performance] ${componentName}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        averageRenderTime: `${averageRenderTime.toFixed(2)}ms`,
        reRenderCount: reRenderCount.current,
        propsChanged: changedProps.length > 0 ? changedProps : 'No props tracked',
        exceedsThreshold: renderTime > threshold,
      });
    }

    // Update previous props for next comparison
    if (trackProps && props) {
      previousProps.current = { ...props };
    }
  }, [enabled, propsChanged, componentName, threshold, logToConsole, trackProps, props]);

  return metrics;
}

export interface UseRenderCountOptions {
  componentName?: string;
  logToConsole?: boolean;
}

export function useRenderCount(options: UseRenderCountOptions = {}): number {
  const { componentName = 'Component', logToConsole = false } = options;
  const renderCount = useRef(0);

  renderCount.current += 1;

  useEffect(() => {
    if (logToConsole) {
      console.log(`[Render Count] ${componentName} rendered ${renderCount.current} times`);
    }
  }, [componentName, logToConsole]);

  return renderCount.current;
}

export interface UseWhyDidYouUpdateOptions {
  name?: string;
  enabled?: boolean;
}

export function useWhyDidYouUpdate(
  props: Record<string, any>,
  options: UseWhyDidYouUpdateOptions = {}
): void {
  const { name = 'Component', enabled = process.env.NODE_ENV === 'development' } = options;
  const previousProps = useRef<Record<string, any> | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;

    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: any; to: any }> = {};

      allKeys.forEach(key => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log(`[Why Did You Update] ${name}:`, changedProps);
      }
    }

    previousProps.current = props;
  }, [props, name, enabled]);
}

export interface MemoryUsage {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedPercent: number;
}

export function useMemoryMonitor(interval: number = 5000): MemoryUsage | null {
  const [memoryUsage, setMemoryUsage] = useState<MemoryUsage | null>(null);

  useEffect(() => {
    // Check if performance.memory is available (Chrome only)
    if (!(window.performance as any)?.memory) {
      console.warn('[Memory Monitor] performance.memory is not available in this browser');
      return;
    }

    const checkMemory = () => {
      const memory = (window.performance as any).memory;
      const usage: MemoryUsage = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usedPercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
      setMemoryUsage(usage);
    };

    checkMemory(); // Initial check
    const intervalId = setInterval(checkMemory, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return memoryUsage;
}

export default usePerformanceMonitor;