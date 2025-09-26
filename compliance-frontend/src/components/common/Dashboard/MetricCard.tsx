import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Skeleton,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: theme.transitions.create(['box-shadow', 'transform'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  },
}));

const MetricHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(1),
}));

const MetricValue = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '2rem',
  lineHeight: 1.2,
  marginBottom: theme.spacing(0.5),
}));

const TrendContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

export interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  format?: 'number' | 'currency' | 'percentage' | 'custom';
  formatOptions?: Intl.NumberFormatOptions;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'flat';
    label?: string;
    period?: string;
  };
  status?: 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
  error?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  onRefresh?: () => void;
  onMenuClick?: () => void;
  children?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  format = 'number',
  formatOptions,
  subtitle,
  trend,
  status,
  loading = false,
  error,
  icon,
  color = 'primary',
  onRefresh,
  onMenuClick,
  children,
}) => {
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          ...formatOptions,
        }).format(val);
      case 'percentage':
        return new Intl.NumberFormat('en-US', {
          style: 'percent',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
          ...formatOptions,
        }).format(val / 100);
      case 'number':
        return new Intl.NumberFormat('en-US', {
          notation: val >= 1000000 ? 'compact' : 'standard',
          compactDisplay: 'short',
          ...formatOptions,
        }).format(val);
      default:
        return val.toString();
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUpIcon color="success" fontSize="small" />;
      case 'down':
        return <TrendingDownIcon color="error" fontSize="small" />;
      default:
        return <TrendingFlatIcon color="action" fontSize="small" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'success';
      case 'down':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusColor = () => {
    if (status) return status;
    return color;
  };

  if (loading) {
    return (
      <StyledCard>
        <CardContent>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={48} sx={{ my: 1 }} />
          <Skeleton variant="text" width="30%" height={20} />
        </CardContent>
      </StyledCard>
    );
  }

  if (error) {
    return (
      <StyledCard>
        <CardContent>
          <Typography variant="h6" color="error" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
          {onRefresh && (
            <Box sx={{ mt: 2 }}>
              <IconButton size="small" onClick={onRefresh}>
                <RefreshIcon />
              </IconButton>
            </Box>
          )}
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <StyledCard>
      <CardContent>
        <MetricHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon}
            <Typography
              variant="h6"
              component="h3"
              color={`${getStatusColor()}.main`}
              fontWeight="medium"
            >
              {title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {onRefresh && (
              <IconButton size="small" onClick={onRefresh}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            )}
            {onMenuClick && (
              <IconButton size="small" onClick={onMenuClick}>
                <MoreIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </MetricHeader>

        <Box sx={{ mb: 1 }}>
          <MetricValue color={`${getStatusColor()}.main`}>
            {formatValue(value)}
            {unit && (
              <Typography
                component="span"
                variant="h5"
                color="text.secondary"
                sx={{ ml: 0.5, fontWeight: 400 }}
              >
                {unit}
              </Typography>
            )}
          </MetricValue>

          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        {trend && (
          <TrendContainer>
            {getTrendIcon(trend.direction)}
            <Chip
              label={
                <>
                  {trend.value > 0 && trend.direction !== 'flat' && '+'}
                  {formatValue(trend.value)}
                  {trend.label && ` ${trend.label}`}
                </>
              }
              size="small"
              color={getTrendColor(trend.direction) as any}
              variant="outlined"
            />
            {trend.period && (
              <Typography variant="caption" color="text.secondary">
                {trend.period}
              </Typography>
            )}
          </TrendContainer>
        )}

        {children && (
          <Box sx={{ mt: 2 }}>
            {children}
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default MetricCard;