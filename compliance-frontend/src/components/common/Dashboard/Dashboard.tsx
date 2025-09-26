import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  Alert,
  Skeleton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { MetricCard } from './MetricCard';
import type { MetricCardProps } from './MetricCard';

const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: '100vh',
  backgroundColor: theme.palette.grey[50],
}));

const DashboardHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
}));

const MetricsGrid = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

export interface DashboardSection {
  title: string;
  metrics: (MetricCardProps & { id: string })[];
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export interface DashboardProps {
  title: string;
  subtitle?: string;
  sections: DashboardSection[];
  loading?: boolean;
  error?: string;
  onRefreshAll?: () => void;
  refreshing?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  title,
  subtitle,
  sections,
  loading = false,
  error,
  onRefreshAll,
  refreshing = false,
}) => {
  if (loading) {
    return (
      <DashboardContainer>
        <DashboardHeader elevation={2}>
          <Skeleton variant="text" width="40%" height={40} />
          <Skeleton variant="text" width="60%" height={24} sx={{ mt: 1 }} />
        </DashboardHeader>

        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
              <Paper sx={{ p: 3, height: 200 }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={48} sx={{ my: 1 }} />
                <Skeleton variant="text" width="30%" height={20} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* Header */}
      <DashboardHeader elevation={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="h6" sx={{ opacity: 0.9, mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          {onRefreshAll && (
            <Box>
              {/* Add refresh controls here if needed */}
            </Box>
          )}
        </Box>
      </DashboardHeader>

      {/* Sections */}
      {sections.map((section, sectionIndex) => (
        <Box key={sectionIndex} sx={{ mb: 4 }}>
          <SectionTitle variant="h5">
            {section.title}
          </SectionTitle>

          <MetricsGrid container spacing={3}>
            {section.metrics.map((metric) => {
              const columns = section.columns || { xs: 12, sm: 6, md: 4, lg: 3 };

              return (
                <Grid
                  key={metric.id}
                  size={{
                    xs: columns.xs || 12,
                    sm: columns.sm || 6,
                    md: columns.md || 4,
                    lg: columns.lg || 3,
                    xl: columns.xl || 2
                  }}
                >
                  <MetricCard
                    {...metric}
                    loading={refreshing || metric.loading}
                  />
                </Grid>
              );
            })}
          </MetricsGrid>

          {sectionIndex < sections.length - 1 && (
            <Divider sx={{ my: 4 }} />
          )}
        </Box>
      ))}
    </DashboardContainer>
  );
};

export default Dashboard;