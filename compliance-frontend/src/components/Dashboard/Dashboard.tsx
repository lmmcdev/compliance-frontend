import  { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Box, Typography, Container, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import StatusCard from '../common/Dashboard/StatusCard';
import type { License } from '../../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Inline DashboardMetrics type to avoid import issues
interface DashboardMetrics {
  licensesByType: { name: string; count: number }[];
  expiringLicenses: License[];
  complianceCasesByMonth: { month: string; count: number }[];
  totalLicenses: number;
  totalComplianceCases: number;
}

const DEFAULT_TOTAL_LICENSES = 501;

const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
    // TODO: Fetch dashboard metrics from API endpoint, e.g. '/api/dashboard/metrics'
  useEffect(() => {
    // TODO: Fetch dashboard metrics from API
    const mockMetrics: DashboardMetrics = {
      licensesByType: [
        { name: 'Business License', count: 45 },
        { name: 'Professional License', count: 23 },
        { name: 'Operating Permit', count: 18 },
        { name: 'Safety Certificate', count: 12 },
      ],
      expiringLicenses: [],
      complianceCasesByMonth: [
        { month: 'Jan', count: 12 },
        { month: 'Feb', count: 19 },
        { month: 'Mar', count: 8 },
        { month: 'Apr', count: 15 },
        { month: 'May', count: 22 },
        { month: 'Jun', count: 18 },
      ],
      totalLicenses: DEFAULT_TOTAL_LICENSES,
      totalComplianceCases: 94,
    };

    setMetrics(mockMetrics);
    setLoading(false);
  }, []);

  const statusCardsData = [
    {
      count: 476,
      label: 'New',
      status: 'new' as const,
      leftBorderColor: '#e91e63',
      chipColor: '#e91e63',
    },
    {
      count: 5,
      label: 'Emergency',
      status: 'emergency' as const,
      leftBorderColor: '#ff9800',
      chipColor: '#ff9800',
    },
    {
      count: 11,
      label: 'In Progress',
      status: 'inProgress' as const,
      leftBorderColor: '#2196f3',
      chipColor: '#2196f3',
    },
    {
      count: 9,
      label: 'Pending',
      status: 'pending' as const,
      leftBorderColor: '#9c27b0',
      chipColor: '#9c27b0',
    },
    {
      count: 0,
      label: 'Done',
      status: 'done' as const,
      leftBorderColor: '#4caf50',
      chipColor: '#4caf50',
    },
    {
      count: 0,
      label: 'Duplicated',
      status: 'duplicated' as const,
      leftBorderColor: '#ff9800',
      chipColor: '#ff9800',
    },
    {
      count: metrics?.totalLicenses ?? DEFAULT_TOTAL_LICENSES,
      label: 'Total',
      status: 'total' as const,
      leftBorderColor: '#1976d2',
      chipColor: '#1976d2',
    },
  ];

  if (loading || !metrics) {
    return (
      <Container>
        <Typography variant="h6">Loading dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{
      width: '100%',
      maxWidth: 'none',
      px: 3,
      py: 2,
      margin: 0,
    }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Call Logs
      </Typography>

      {/* Status Cards Grid */}
      <Box sx={{
        display: 'flex',
        gap: 2,
        mb: 4,
        width: '100%',
        '& > *': {
          flex: '1 1 0',
          minWidth: 0,
        }
      }}>
        {statusCardsData.map((card, index) => (
          <StatusCard
            key={index}
            count={card.count}
            label={card.label}
            status={card.status}
            leftBorderColor={card.leftBorderColor}
            chipColor={card.chipColor}
          />
        ))}
      </Box>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ width: '100%' }}>
        <Grid>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Licenses by Type
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.licensesByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name} ${props.percent !== undefined ? (props.percent * 100).toFixed(0) : '0'}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {metrics.licensesByType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              License Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.licensesByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Compliance Cases per Month
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.complianceCasesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;