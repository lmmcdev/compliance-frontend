import  { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Box, Typography, Container, Paper } from '@mui/material';
import StatusCard from '../StatusCard/StatusCard';
import type { License } from '../../types';

const COLORS = ['#00A1FF', '#00B8A3', '#FFB900', '#FF8A00', '#8965E5'];

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
      leftBorderColor: '#FF6692',
      chipColor: '#FF6692',
    },
    {
      count: 5,
      label: 'Emergency',
      status: 'emergency' as const,
      leftBorderColor: '#FFB900',
      chipColor: '#FFB900',
    },
    {
      count: 11,
      label: 'In Progress',
      status: 'inProgress' as const,
      leftBorderColor: '#00A1FF',
      chipColor: '#00A1FF',
    },
    {
      count: 9,
      label: 'Pending',
      status: 'pending' as const,
      leftBorderColor: '#8965E5',
      chipColor: '#8965E5',
    },
    {
      count: 0,
      label: 'Done',
      status: 'done' as const,
      leftBorderColor: '#00B8A3',
      chipColor: '#00B8A3',
    },
    {
      count: 0,
      label: 'Duplicated',
      status: 'duplicated' as const,
      leftBorderColor: '#FF8A00',
      chipColor: '#FF8A00',
    },
    {
      count: metrics?.totalLicenses ?? DEFAULT_TOTAL_LICENSES,
      label: 'Total',
      status: 'total' as const,
      leftBorderColor: '#00A1FF',
      chipColor: '#00A1FF',
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
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        '& > *': {
          flex: { xs: '1 1 calc(50% - 8px)', md: '1 1 0' },
          minWidth: { xs: 'calc(50% - 8px)', md: 0 },
        },
        '@media (max-width: 475px)': {
          flexDirection: 'column',
          '& > *': {
            flex: '1 1 auto',
            minWidth: 'auto',
          }
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
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 3,
        width: '100%',
        mb: 4
      }}>
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
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

        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h6" gutterBottom>
            License Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.licensesByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#00A1FF" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" gutterBottom>
          Compliance Cases per Month
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metrics.complianceCasesByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#00A1FF" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default Dashboard;