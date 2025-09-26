import React from 'react';
import { Box, Grid, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLayout } from '../../../hooks/patterns/useLayout';
import type { LayoutConfig } from '../../../hooks/patterns/useLayout';

const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(0),
  margin: 0,
  maxWidth: 'none !important',
  width: '100%',
}));

const ResponsiveBox = styled(Box)<{
  $isHidden?: boolean;
  $compact?: boolean;
}>(({ theme, $isHidden, $compact }) => ({
  display: $isHidden ? 'none' : 'flex',
  flexDirection: 'column',
  width: '100%',
  height: $compact ? 'auto' : '100%',
  overflow: $compact ? 'visible' : 'hidden',
  transition: theme.transitions.create([
    'padding',
    'margin',
    'flex-direction',
    'justify-content',
    'align-items',
  ], {
    duration: theme.transitions.duration.shorter,
  }),
}));

export interface ResponsiveContainerProps {
  children: React.ReactNode;
  config?: LayoutConfig;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onBreakpointChange?: (breakpoint: string) => void;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  config = {},
  maxWidth = false,
  disableGutters = true,
  className,
  style,
  onBreakpointChange,
}) => {
  const {
    layout,
    getPadding,
    getMargin,
    isHidden,
    getFlexProps,
    getDimensions,
  } = useLayout();

  // Notify parent of breakpoint changes
  React.useEffect(() => {
    if (onBreakpointChange) {
      onBreakpointChange(layout.currentBreakpoint);
    }
  }, [layout.currentBreakpoint, onBreakpointChange]);

  const hidden = isHidden(config);
  const padding = getPadding(config);
  const margin = getMargin(config);
  const flexProps = getFlexProps(config);
  const dimensions = getDimensions(config);

  const containerStyle: React.CSSProperties = {
    padding: `${padding * 8}px`,
    margin: `${margin * 8}px`,
    ...(flexProps.flexDirection && { flexDirection: flexProps.flexDirection as React.CSSProperties['flexDirection'] }),
    ...(flexProps.justifyContent && { justifyContent: flexProps.justifyContent as React.CSSProperties['justifyContent'] }),
    ...(flexProps.alignItems && { alignItems: flexProps.alignItems as React.CSSProperties['alignItems'] }),
    ...(flexProps.order && { order: flexProps.order }),
    ...dimensions,
    ...style,
  };

  if (hidden) {
    return null;
  }

  return (
    <StyledContainer
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      className={className}
    >
      <ResponsiveBox
        $isHidden={hidden}
        $compact={layout.isCompact}
        style={containerStyle}
      >
        {children}
      </ResponsiveBox>
    </StyledContainer>
  );
};

export interface ResponsiveGridProps {
  children: React.ReactNode;
  config?: LayoutConfig;
  itemConfig?: LayoutConfig;
  container?: boolean;
  item?: boolean;
  spacing?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  config = {},
  itemConfig,
  container = false,
  item = false,
  spacing,
  className,
  style,
}) => {
  const {
    getSpacing,
    getGridColumns,
    isHidden,
    getFlexProps,
    getDimensions,
  } = useLayout();

  const hidden = isHidden(config);
  const gridSpacing = spacing !== undefined ? spacing : getSpacing(config);
  const columns = getGridColumns(config);
  const flexProps = getFlexProps(config);
  const dimensions = getDimensions(config);

  if (hidden) {
    return null;
  }

  const gridSize = item ? {
    xs: itemConfig?.columns?.xs || Math.max(1, Math.floor(12 / columns)),
    sm: itemConfig?.columns?.sm || Math.max(1, Math.floor(12 / columns)),
    md: itemConfig?.columns?.md || Math.max(1, Math.floor(12 / columns)),
    lg: itemConfig?.columns?.lg || Math.max(1, Math.floor(12 / columns)),
    xl: itemConfig?.columns?.xl || Math.max(1, Math.floor(12 / columns)),
  } : undefined;

  const gridStyle: React.CSSProperties = {
    ...(flexProps.flexDirection && { flexDirection: flexProps.flexDirection as React.CSSProperties['flexDirection'] }),
    ...(flexProps.justifyContent && { justifyContent: flexProps.justifyContent as React.CSSProperties['justifyContent'] }),
    ...(flexProps.alignItems && { alignItems: flexProps.alignItems as React.CSSProperties['alignItems'] }),
    ...(flexProps.order && { order: flexProps.order }),
    ...dimensions,
    ...style,
  };

  return (
    <Grid
      container={container}
      size={gridSize}
      spacing={gridSpacing}
      className={className}
      style={gridStyle}
    >
      {children}
    </Grid>
  );
};

export interface AdaptiveLayoutProps {
  children: React.ReactNode;
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  config?: LayoutConfig;
  fallback?: 'mobile' | 'tablet' | 'desktop';
}

export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({
  children,
  mobile,
  tablet,
  desktop,
  config = {},
  fallback = 'mobile',
}) => {
  const { layout, isHidden } = useLayout();

  if (isHidden(config)) {
    return null;
  }

  // Determine which layout to show
  let content = children;

  if (layout.isMobile && mobile) {
    content = mobile;
  } else if (layout.isTablet && tablet) {
    content = tablet;
  } else if (layout.isDesktop && desktop) {
    content = desktop;
  } else {
    // Use fallback layout
    switch (fallback) {
      case 'mobile':
        content = mobile || children;
        break;
      case 'tablet':
        content = tablet || children;
        break;
      case 'desktop':
        content = desktop || children;
        break;
      default:
        content = children;
    }
  }

  return <>{content}</>;
};

export default ResponsiveContainer;