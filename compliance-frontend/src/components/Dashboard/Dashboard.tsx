import  { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Box, Typography, Container, Paper } from '@mui/material';
import { PieChart as PieChartIcon, BarChart as BarChartIcon, Timeline as TimelineIcon } from '@mui/icons-material';
import StatusCard from '../common/Dashboard/StatusCard';
import type { License } from '../../types';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];

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
      px: { xs: 2, md: 4 },
      py: 3,
      margin: 0,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
    }}>
      {/* Hero Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '24px',
        p: { xs: 3, md: 5 },
        mb: 4,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 1
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          zIndex: 1
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Compliance Dashboard
          </Typography>
          <Typography
            variant="h5"
            sx={{
              opacity: 0.9,
              fontWeight: 300,
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              maxWidth: '600px'
            }}
          >
            Monitor your compliance status with real-time insights and comprehensive analytics
          </Typography>
        </Box>
      </Box>

      {/* Status Cards Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
          md: 'repeat(4, 1fr)',
          lg: 'repeat(7, 1fr)'
        },
        gap: 3,
        mb: 5,
        width: '100%',
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
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        gap: 4,
        width: '100%',
        mb: 5
      }}>
        <Paper sx={{
          p: 4,
          borderRadius: '20px',
          border: 'none',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          backgroundColor: '#ffffff',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
          }
        }}>
          <Typography variant="h5" sx={{
            fontWeight: 700,
            color: '#1e293b',
            mb: 3,
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}>
            <PieChartIcon sx={{
              fontSize: '28px',
              color: '#667eea',
              filter: 'drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3))'
            }} />
            Licenses by Type
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={metrics.licensesByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const percentage = props.percent !== undefined ? (props.percent * 100).toFixed(1) : '0';
                  return `${percentage}%`;
                }}
                outerRadius={100}
                innerRadius={40}
                fill="#8884d8"
                dataKey="count"
                stroke="none"
                paddingAngle={2}
              >
                {metrics.licensesByType.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    style={{
                      filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))',
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                  backdropFilter: 'blur(10px)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1e293b'
                }}
                labelStyle={{ color: '#1e293b', fontWeight: 700 }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Custom Legend */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1.5,
            mt: 3,
            px: 2
          }}>
            {metrics.licensesByType.map((item, index) => (
              <Box
                key={item.name}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  borderRadius: '8px',
                  backgroundColor: 'rgba(248, 250, 252, 0.8)',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(248, 250, 252, 1)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: COLORS[index % COLORS.length],
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#475569',
                    flex: 1
                  }}
                >
                  {item.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#1e293b'
                  }}
                >
                  {item.count}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper sx={{
          p: 4,
          borderRadius: '20px',
          border: 'none',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          backgroundColor: '#ffffff',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
          }
        }}>
          <Typography variant="h5" sx={{
            fontWeight: 700,
            color: '#1e293b',
            mb: 3,
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}>
            <BarChartIcon sx={{
              fontSize: '28px',
              color: '#764ba2',
              filter: 'drop-shadow(0 2px 4px rgba(118, 75, 162, 0.3))'
            }} />
            License Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              data={metrics.licensesByType}
              margin={{ top: 40, right: 30, left: 20, bottom: 85 }}
              barCategoryGap="12%"
            >
              <defs>
                <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00A1FF"/>
                  <stop offset="100%" stopColor="#0066CC"/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                cursor={false}
              />
              <Bar
                dataKey="count"
                fill="url(#barGradient2)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      <Paper sx={{
        p: 4,
        borderRadius: '20px',
        border: 'none',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        backgroundColor: '#ffffff',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
        }
      }}>
        <Typography variant="h5" sx={{
          fontWeight: 700,
          color: '#1e293b',
          mb: 3,
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <TimelineIcon sx={{
            fontSize: '28px',
            color: '#f093fb',
            filter: 'drop-shadow(0 2px 4px rgba(240, 147, 251, 0.3))'
          }} />
          Compliance Cases per Month
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={metrics.complianceCasesByMonth}
            margin={{ top: 30, right: 30, left: 20, bottom: 30 }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f093fb" stopOpacity={0.3}/>
                <stop offset="100%" stopColor="#f093fb" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="#e2e8f0"
              strokeOpacity={0.6}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              fontSize={12}
              fontWeight={600}
              tick={{ fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              fontWeight={600}
              tick={{ fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
              tickLine={{ stroke: '#e2e8f0' }}
              domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                backdropFilter: 'blur(10px)',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1e293b'
              }}
              labelStyle={{
                color: '#1e293b',
                fontWeight: 700,
                marginBottom: '4px'
              }}
              cursor={false}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#f093fb"
              strokeWidth={4}
              dot={{
                fill: '#f093fb',
                strokeWidth: 3,
                stroke: '#ffffff',
                r: 6,
                filter: 'drop-shadow(0 2px 4px rgba(240, 147, 251, 0.3))'
              }}
              activeDot={{
                r: 8,
                fill: '#f5576c',
                stroke: '#ffffff',
                strokeWidth: 3,
                filter: 'drop-shadow(0 4px 8px rgba(245, 87, 108, 0.4))'
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default Dashboard;