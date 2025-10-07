import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { PatchDetailsProvider, usePatchDetails } from '../../contexts/PatchDetailsContext';

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: '100%',
  backgroundColor: theme.palette.grey[50],
}));

const STATUS_COLORS = {
  Installed: '#10B981',
  Pending: '#F59E0B',
  Failed: '#EF4444',
  'No Patch Data': '#9CA3AF',
};

interface PatchDetailsDashboardContentProps {}

const PatchDetailsDashboardContent: React.FC<PatchDetailsDashboardContentProps> = () => {
  const { patchData, deviceData, loading, error, filters, setFilters, refresh } = usePatchDetails();

  const [siteName, setSiteName] = useState('');
  const [month, setMonth] = useState('');

  const handleApplyFilters = () => {
    if (siteName && month) {
      setFilters({ Site_name: siteName, month });
    }
  };

  // Calculate devices without patches
  const devicesWithoutPatches = useMemo(() => {
    if (!patchData?.patchesBySiteAndKB || !deviceData?.equipment) {
      return [];
    }

    // Get all device names that have patch data
    const devicesWithPatches = new Set<string>();
    patchData.patchesBySiteAndKB.forEach(kb => {
      kb.devices.forEach(device => {
        devicesWithPatches.add(device.Device_name);
      });
    });

    // Find devices without patches
    return deviceData.equipment.filter(
      device => !devicesWithPatches.has(device.Device_name)
    );
  }, [patchData, deviceData]);

  // Prepare data for KB distribution chart
  const kbChartData = useMemo(() => {
    if (!patchData?.patchesBySiteAndKB) return [];

    return patchData.patchesBySiteAndKB.map(kb => ({
      name: kb.KB_number,
      devices: kb.devices.length,
      installed: kb.devices.filter(d => d.Patch_status === 'Installed').length,
      pending: kb.devices.filter(d => d.Patch_status === 'Pending').length,
      failed: kb.devices.filter(d => d.Patch_status === 'Failed').length,
    }));
  }, [patchData]);

  // Prepare status distribution pie chart
  const statusPieData = useMemo(() => {
    if (!patchData || !deviceData) return [];

    const installed = patchData.summary.totalInstalled;
    const pending = patchData.summary.totalPending;
    const failed = patchData.summary.totalFailed;
    const noData = devicesWithoutPatches.length;

    return [
      { name: 'Installed', value: installed, color: STATUS_COLORS.Installed },
      { name: 'Pending', value: pending, color: STATUS_COLORS.Pending },
      { name: 'Failed', value: failed, color: STATUS_COLORS.Failed },
      { name: 'No Patch Data', value: noData, color: STATUS_COLORS['No Patch Data'] },
    ].filter(item => item.value > 0);
  }, [patchData, deviceData, devicesWithoutPatches]);

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
          Failed to load patch details: {error}
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Page Header */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Patch Details Dashboard
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Detailed patch analysis by site and KB
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={refresh}
            disabled={!filters}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Filters
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Site Name"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            sx={{ flex: 1 }}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant="contained"
            onClick={handleApplyFilters}
            disabled={!siteName || !month}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              px: 4,
            }}
          >
            Apply
          </Button>
        </Box>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Typography variant="h6" color="text.secondary">
            Loading patch details...
          </Typography>
        </Box>
      )}

      {!loading && !patchData && (
        <Alert severity="info">
          Please select a site and month to view detailed patch information.
        </Alert>
      )}

      {!loading && patchData && deviceData && (
        <>
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
              }}
            >
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {deviceData.total}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Devices
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                borderRadius: '16px',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckIcon />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {patchData.summary.totalInstalled}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Patched Devices
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                background: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
                color: 'white',
                borderRadius: '16px',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WarningIcon />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {devicesWithoutPatches.length}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Devices Without Patches
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                borderRadius: '16px',
              }}
            >
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {patchData.summary.overallComplianceRate.toFixed(1)}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Compliance Rate
                </Typography>
              </CardContent>
            </Card>
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
            {/* KB Distribution Chart */}
            {patchData.patchesBySiteAndKB && patchData.patchesBySiteAndKB.length > 0 && (
              <Paper
                sx={{
                  p: 4,
                  borderRadius: '20px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Patch Distribution by KB
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={kbChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="installed" fill={STATUS_COLORS.Installed} name="Installed" />
                    <Bar dataKey="pending" fill={STATUS_COLORS.Pending} name="Pending" />
                    <Bar dataKey="failed" fill={STATUS_COLORS.Failed} name="Failed" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            )}

            {/* Status Distribution Pie */}
            <Paper
              sx={{
                p: 4,
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Box>

          {/* KB Details Tables */}
          {patchData.patchesBySiteAndKB && patchData.patchesBySiteAndKB.length > 0 && (
            <Paper
              sx={{
                p: 4,
                mb: 3,
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Patches by KB Number
              </Typography>
              {patchData.patchesBySiteAndKB.map((kb, index) => (
                <Box key={index} sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 2,
                      p: 2,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                    }}
                  >
                    <DescriptionIcon />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {kb.KB_number}
                    </Typography>
                    <Chip
                      label={`${kb.devices.length} devices`}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Device Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {kb.devices.map((device, deviceIndex) => (
                          <TableRow key={deviceIndex}>
                            <TableCell>{device.Device_name}</TableCell>
                            <TableCell>
                              <Chip
                                label={device.Patch_status}
                                size="small"
                                sx={{
                                  backgroundColor: STATUS_COLORS[device.Patch_status as keyof typeof STATUS_COLORS] || '#9CA3AF',
                                  color: 'white',
                                  fontWeight: 500,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}
            </Paper>
          )}

          {/* Devices Without Patches */}
          {devicesWithoutPatches.length > 0 && (
            <Paper
              sx={{
                p: 4,
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                border: '2px solid #F59E0B',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <WarningIcon sx={{ fontSize: 32, color: '#F59E0B' }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Devices Without Patch Data ({devicesWithoutPatches.length})
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Device Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Hostname</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {devicesWithoutPatches.map((device, index) => (
                      <TableRow key={index}>
                        <TableCell>{device.Device_name}</TableCell>
                        <TableCell>{device.Hostname}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      )}
    </PageContainer>
  );
};

const PatchDetailsDashboard: React.FC = () => {
  return (
    <PatchDetailsProvider>
      <PatchDetailsDashboardContent />
    </PatchDetailsProvider>
  );
};

export default PatchDetailsDashboard;
