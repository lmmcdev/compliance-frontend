import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingIcon,
  Business as BusinessIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { PatchAnalyticsProvider, usePatchAnalytics } from '../../contexts/PatchAnalyticsContext';
import { FilterPanel } from './FilterPanel';
import { PatchTypeDetailsDialog } from './PatchTypeDetailsDialog';
import { SiteDetailsDialog } from './SiteDetailsDialog';
import { format } from 'date-fns';
import type { ComplianceByPatchType, ComplianceBySite } from '../../types/patchAnalytics';

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: '100%',
  backgroundColor: theme.palette.grey[50],
}));

const STATUS_COLORS = {
  installed: '#10B981',
  pending: '#F59E0B',
  failed: '#EF4444',
};

interface PatchAnalyticsDashboardContentProps {}

const PatchAnalyticsDashboardContent: React.FC<PatchAnalyticsDashboardContentProps> = () => {
  const { data, loading, error, refresh, filters, setFilters } = usePatchAnalytics();

  const [patchTypeDialogOpen, setPatchTypeDialogOpen] = useState(false);
  const [selectedPatchType, setSelectedPatchType] = useState<ComplianceByPatchType | null>(null);

  const [siteDialogOpen, setSiteDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<ComplianceBySite | null>(null);

  if (error) {
    return (
      <PageContainer>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refresh}>
              Retry
            </Button>
          }
        >
          Failed to load patch analytics: {error}
        </Alert>
      </PageContainer>
    );
  }

  if (loading || !data) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Typography variant="h6" color="text.secondary">
            Loading patch analytics...
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  const { summary, complianceByPatchType, temporalTrend, complianceBySite } = data;

  // Extract unique sites for filter
  const uniqueSites = complianceBySite.map(site => site.siteName);

  // Prepare data for pie chart
  const pieData = [
    { name: 'Installed', value: summary.totalInstalled, color: STATUS_COLORS.installed },
    { name: 'Pending', value: summary.totalPending, color: STATUS_COLORS.pending },
    { name: 'Failed', value: summary.totalFailed, color: STATUS_COLORS.failed },
  ].filter(item => item.value > 0);

  // Prepare temporal trend data for line chart
  const trendData = temporalTrend.map(trend => {
    const date = new Date(trend.date);
    return {
      date: isNaN(date.getTime()) ? trend.date : format(date, 'MMM dd'),
      installed: trend.installed,
      pending: trend.pending,
      failed: trend.failed,
      total: trend.total,
    };
  });

  const handlePatchTypeClick = (patchType: ComplianceByPatchType) => {
    setSelectedPatchType(patchType);
    setPatchTypeDialogOpen(true);
  };

  const handleSiteClick = (site: ComplianceBySite) => {
    setSelectedSite(site);
    setSiteDialogOpen(true);
  };

  return (
    <PageContainer>
      {/* Page Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          p: 4,
          mb: 3,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  mb: 1,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                }}
              >
                <SecurityIcon sx={{ mr: 2, fontSize: '2.5rem', verticalAlign: 'middle' }} />
                Patch Analytics Dashboard
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 400,
                  fontSize: '16px',
                }}
              >
                Monitor patch deployment and compliance across your infrastructure
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refresh}
              disabled={loading}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.5)',
                color: 'white',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Refresh
            </Button>
          </Box>
          {summary.dateRange.start && summary.dateRange.end && (
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {(() => {
                const startDate = new Date(summary.dateRange.start);
                const endDate = new Date(summary.dateRange.end);
                const startValid = !isNaN(startDate.getTime());
                const endValid = !isNaN(endDate.getTime());

                if (startValid && endValid) {
                  return `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`;
                }
                return `${summary.dateRange.start} - ${summary.dateRange.end}`;
              })()}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        sites={uniqueSites}
      />

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        <Card
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          }}
        >
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {summary.totalPatches}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Total Patches
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CheckIcon />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {summary.totalInstalled}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Installed
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <WarningIcon />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {summary.totalPending}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Pending
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            color: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ErrorIcon />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {summary.totalFailed}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Failed
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Additional Info Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        <Paper
          sx={{
            p: 3,
            borderRadius: '16px',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingIcon sx={{ fontSize: '28px', color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                {summary.overallComplianceRate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Compliance Rate
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: '16px',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BusinessIcon sx={{ fontSize: '28px', color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                {summary.uniqueSites}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Sites
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: '16px',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ComputerIcon sx={{ fontSize: '28px', color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                {summary.uniqueDevices}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Devices
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Charts Section */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Temporal Trend */}
        <Paper
          sx={{
            p: 4,
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1e293b',
              mb: 3,
            }}
          >
            Patch Deployment Trend
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="installed" stroke={STATUS_COLORS.installed} strokeWidth={2} name="Installed" />
              <Line type="monotone" dataKey="pending" stroke={STATUS_COLORS.pending} strokeWidth={2} name="Pending" />
              <Line type="monotone" dataKey="failed" stroke={STATUS_COLORS.failed} strokeWidth={2} name="Failed" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Status Distribution */}
        <Paper
          sx={{
            p: 4,
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1e293b',
              mb: 3,
            }}
          >
            Status Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Compliance by Patch Type & Site */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 3,
        }}
      >
        {/* Patch Type Compliance */}
        <Paper
          sx={{
            p: 4,
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1e293b',
              mb: 3,
            }}
          >
            Compliance by Patch Type
          </Typography>
          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {complianceByPatchType.map((patchType, index) => (
              <Box
                key={index}
                onClick={() => handlePatchTypeClick(patchType)}
                sx={{
                  p: 2.5,
                  mb: 2,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(248, 250, 252, 0.8)',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                    borderColor: '#667eea',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {patchType.patchType}
                  </Typography>
                  <Chip
                    label={`${patchType.complianceRate}%`}
                    sx={{
                      backgroundColor: patchType.complianceRate >= 90 ? '#10B981' : patchType.complianceRate >= 70 ? '#F59E0B' : '#EF4444',
                      color: 'white',
                      fontWeight: 700,
                    }}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={`✓ ${patchType.installed}`} size="small" sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }} />
                  <Chip label={`⏳ ${patchType.pending}`} size="small" sx={{ backgroundColor: '#FFF8E1', color: '#F57C00' }} />
                  <Chip label={`✗ ${patchType.failed}`} size="small" sx={{ backgroundColor: '#FFEBEE', color: '#C62828' }} />
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Site Compliance */}
        <Paper
          sx={{
            p: 4,
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1e293b',
              mb: 3,
            }}
          >
            Compliance by Site
          </Typography>
          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {complianceBySite.map((site, index) => (
              <Box
                key={index}
                onClick={() => handleSiteClick(site)}
                sx={{
                  p: 2.5,
                  mb: 2,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(248, 250, 252, 0.8)',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(79, 172, 254, 0.2)',
                    borderColor: '#4facfe',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {site.siteName}
                  </Typography>
                  <Chip
                    label={`${site.complianceRate.toFixed(1)}%`}
                    sx={{
                      backgroundColor: site.complianceRate >= 90 ? '#10B981' : site.complianceRate >= 70 ? '#F59E0B' : '#EF4444',
                      color: 'white',
                      fontWeight: 700,
                    }}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={`✓ ${site.installed}`} size="small" sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }} />
                  <Chip label={`⏳ ${site.pending}`} size="small" sx={{ backgroundColor: '#FFF8E1', color: '#F57C00' }} />
                  <Chip label={`✗ ${site.failed}`} size="small" sx={{ backgroundColor: '#FFEBEE', color: '#C62828' }} />
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Dialogs */}
      <PatchTypeDetailsDialog
        open={patchTypeDialogOpen}
        onClose={() => setPatchTypeDialogOpen(false)}
        patchType={selectedPatchType}
      />

      <SiteDetailsDialog
        open={siteDialogOpen}
        onClose={() => setSiteDialogOpen(false)}
        site={selectedSite}
      />
    </PageContainer>
  );
};

// Main page component with context provider
export const PatchAnalyticsDashboard: React.FC = () => {
  return (
    <PatchAnalyticsProvider>
      <PatchAnalyticsDashboardContent />
    </PatchAnalyticsProvider>
  );
};

export default PatchAnalyticsDashboard;
