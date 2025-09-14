import { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Inline types to avoid import issues
interface License {
  id: string;
  type: string;
  issuer: string;
  issueDate: Date;
  expirationDate: Date;
  status: 'active' | 'expired' | 'pending';
  documentUrl?: string;
}

interface DashboardMetrics {
  licensesByType: { name: string; count: number }[];
  expiringLicenses: License[];
  complianceCasesByMonth: { month: string; count: number }[];
  totalLicenses: number;
  totalComplianceCases: number;
}

const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

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
      totalLicenses: 98,
      totalComplianceCases: 94,
    };
    
    setMetrics(mockMetrics);
    setLoading(false);
  }, []);

  if (loading || !metrics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography variant="h6">Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Compliance Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Licenses
              </Typography>
              <Typography variant="h3" color="primary">
                {metrics.totalLicenses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Compliance Cases
              </Typography>
              <Typography variant="h3" color="primary">
                {metrics.totalComplianceCases}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Expiring Soon
              </Typography>
              <Typography variant="h3" color="error">
                {metrics.expiringLicenses.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {metrics.licensesByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              License Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.licensesByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3498db" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Compliance Cases per Month
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.complianceCasesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3498db" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;