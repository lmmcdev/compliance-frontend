import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

export type LayoutBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface LayoutConfig {
  columns?: Partial<Record<LayoutBreakpoint, number>>;
  spacing?: Partial<Record<LayoutBreakpoint, number>>;
  padding?: Partial<Record<LayoutBreakpoint, number>>;
  margin?: Partial<Record<LayoutBreakpoint, number>>;
  height?: Partial<Record<LayoutBreakpoint, string | number>>;
  width?: Partial<Record<LayoutBreakpoint, string | number>>;
  flexDirection?: Partial<Record<LayoutBreakpoint, 'row' | 'column' | 'row-reverse' | 'column-reverse'>>;
  justifyContent?: Partial<Record<LayoutBreakpoint, 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'>>;
  alignItems?: Partial<Record<LayoutBreakpoint, 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline'>>;
  hidden?: LayoutBreakpoint[];
  order?: Partial<Record<LayoutBreakpoint, number>>;
}

export interface LayoutState {
  currentBreakpoint: LayoutBreakpoint;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  containerWidth: number;
  containerHeight: number;
  isCompact: boolean;
}

export interface UseLayoutResult {
  layout: LayoutState;
  getResponsiveValue: <T>(config: Partial<Record<LayoutBreakpoint, T>>) => T | undefined;
  getGridColumns: (config?: LayoutConfig) => number;
  getSpacing: (config?: LayoutConfig) => number;
  getPadding: (config?: LayoutConfig) => number;
  getMargin: (config?: LayoutConfig) => number;
  isHidden: (config?: LayoutConfig) => boolean;
  getFlexProps: (config?: LayoutConfig) => {
    flexDirection?: string;
    justifyContent?: string;
    alignItems?: string;
    order?: number;
  };
  getDimensions: (config?: LayoutConfig) => {
    width?: string | number;
    height?: string | number;
  };
  getContainerProps: (config?: LayoutConfig) => {
    container: boolean;
    spacing: number;
    size: Partial<Record<LayoutBreakpoint, number>>;
  };
  adaptiveValue: <T>(values: Partial<Record<LayoutBreakpoint, T>>, fallback?: T) => T;
}

const breakpointOrder: LayoutBreakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];

export function useLayout(): UseLayoutResult {
  const theme = useTheme();

  // Media queries
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.only('xl'));

  // Device categories
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  // Container dimensions
  const [containerDimensions, setContainerDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Current breakpoint detection
  const currentBreakpoint: LayoutBreakpoint = useMemo(() => {
    if (isXs) return 'xs';
    if (isSm) return 'sm';
    if (isMd) return 'md';
    if (isLg) return 'lg';
    if (isXl) return 'xl';
    return 'md'; // fallback
  }, [isXs, isSm, isMd, isLg, isXl]);

  // Orientation detection
  const orientation = useMemo((): 'portrait' | 'landscape' => {
    return containerDimensions.width > containerDimensions.height ? 'landscape' : 'portrait';
  }, [containerDimensions]);

  // Compact mode detection (for dense layouts)
  const isCompact = useMemo(() => {
    return isMobile || containerDimensions.width < 768;
  }, [isMobile, containerDimensions.width]);

  // Layout state
  const layout: LayoutState = useMemo(() => ({
    currentBreakpoint,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isMobile,
    isTablet,
    isDesktop,
    orientation,
    containerWidth: containerDimensions.width,
    containerHeight: containerDimensions.height,
    isCompact,
  }), [
    currentBreakpoint,
    isXs, isSm, isMd, isLg, isXl,
    isMobile, isTablet, isDesktop,
    orientation,
    containerDimensions,
    isCompact,
  ]);

  // Update container dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setContainerDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get responsive value based on current breakpoint
  const getResponsiveValue = useCallback(<T>(
    config: Partial<Record<LayoutBreakpoint, T>>
  ): T | undefined => {
    // Try current breakpoint first
    if (config[currentBreakpoint] !== undefined) {
      return config[currentBreakpoint];
    }

    // Fall back to smaller breakpoints
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
    for (let i = currentIndex - 1; i >= 0; i--) {
      const bp = breakpointOrder[i];
      if (config[bp] !== undefined) {
        return config[bp];
      }
    }

    // Fall back to larger breakpoints
    for (let i = currentIndex + 1; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (config[bp] !== undefined) {
        return config[bp];
      }
    }

    return undefined;
  }, [currentBreakpoint]);

  // Adaptive value with fallback
  const adaptiveValue = useCallback(<T>(
    values: Partial<Record<LayoutBreakpoint, T>>,
    fallback?: T
  ): T => {
    const value = getResponsiveValue(values);
    return value !== undefined ? value : (fallback as T);
  }, [getResponsiveValue]);

  // Get grid columns
  const getGridColumns = useCallback((config?: LayoutConfig): number => {
    const defaultColumns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 6 };
    const columns = config?.columns || defaultColumns;
    return getResponsiveValue(columns) || defaultColumns[currentBreakpoint] || 3;
  }, [getResponsiveValue, currentBreakpoint]);

  // Get spacing
  const getSpacing = useCallback((config?: LayoutConfig): number => {
    const defaultSpacing = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 };
    const spacing = config?.spacing || defaultSpacing;
    return getResponsiveValue(spacing) || defaultSpacing[currentBreakpoint] || 2;
  }, [getResponsiveValue, currentBreakpoint]);

  // Get padding
  const getPadding = useCallback((config?: LayoutConfig): number => {
    const defaultPadding = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 };
    const padding = config?.padding || defaultPadding;
    return getResponsiveValue(padding) || defaultPadding[currentBreakpoint] || 2;
  }, [getResponsiveValue, currentBreakpoint]);

  // Get margin
  const getMargin = useCallback((config?: LayoutConfig): number => {
    const defaultMargin = { xs: 1, sm: 1, md: 2, lg: 2, xl: 3 };
    const margin = config?.margin || defaultMargin;
    return getResponsiveValue(margin) || defaultMargin[currentBreakpoint] || 1;
  }, [getResponsiveValue, currentBreakpoint]);

  // Check if element should be hidden
  const isHidden = useCallback((config?: LayoutConfig): boolean => {
    return config?.hidden?.includes(currentBreakpoint) || false;
  }, [currentBreakpoint]);

  // Get flex properties
  const getFlexProps = useCallback((config?: LayoutConfig) => {
    return {
      flexDirection: getResponsiveValue(config?.flexDirection || {}),
      justifyContent: getResponsiveValue(config?.justifyContent || {}),
      alignItems: getResponsiveValue(config?.alignItems || {}),
      order: getResponsiveValue(config?.order || {}),
    };
  }, [getResponsiveValue]);

  // Get dimensions
  const getDimensions = useCallback((config?: LayoutConfig) => {
    return {
      width: getResponsiveValue(config?.width || {}),
      height: getResponsiveValue(config?.height || {}),
    };
  }, [getResponsiveValue]);

  // Get container props for Material-UI Grid
  const getContainerProps = useCallback((config?: LayoutConfig) => {
    const columns = getGridColumns(config);
    const spacing = getSpacing(config);

    return {
      container: true,
      spacing,
      size: {
        xs: Math.max(1, Math.floor(12 / Math.max(1, columns))),
        sm: Math.max(1, Math.floor(12 / Math.max(1, columns))),
        md: Math.max(1, Math.floor(12 / Math.max(1, columns))),
        lg: Math.max(1, Math.floor(12 / Math.max(1, columns))),
        xl: Math.max(1, Math.floor(12 / Math.max(1, columns))),
      },
    };
  }, [getGridColumns, getSpacing]);

  return {
    layout,
    getResponsiveValue,
    getGridColumns,
    getSpacing,
    getPadding,
    getMargin,
    isHidden,
    getFlexProps,
    getDimensions,
    getContainerProps,
    adaptiveValue,
  };
}

export default useLayout;