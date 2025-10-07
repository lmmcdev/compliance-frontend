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
  IconButton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  LocationOn as LocationIcon,
  Block as BlockIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
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
  Cell,
} from 'recharts';
import { IncidentAnalyticsProvider, useIncidentAnalytics } from '../../contexts/IncidentAnalyticsContext';
import { IncidentDetailsDialog } from './IncidentDetailsDialog';
import { BlockedToolDetailsDialog } from './BlockedToolDetailsDialog';
import { format } from 'date-fns';
import type { IncidentSummary, BlockedTool } from '../../types/incidentAnalytics';

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: '100%',
  backgroundColor: theme.palette.grey[50],
}));

const CATEGORY_COLORS: Record<string, string> = {
  'CyberSecurity (SOC): EndPoint': '#00A1FF',
  'CyberSecurity (SOC): Office365': '#10B981',
  'CyberSecurity (SOC): Network': '#F59E0B',
  'CyberSecurity (SOC): Email': '#8B5CF6',
  default: '#6B7280',
};

const HOUR_COLORS: Record<string, string> = {
  Closed: '#10B981',
  Open: '#EF4444',
  'In Progress': '#F59E0B',
};

interface IncidentAnalyticsDashboardContentProps {}

const IncidentAnalyticsDashboardContent: React.FC<IncidentAnalyticsDashboardContentProps> = () => {
  const { data, loading, error, refresh } = useIncidentAnalytics();

  // Dialog states
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);
  const [selectedIncidents, setSelectedIncidents] = useState<IncidentSummary[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const [toolDialogOpen, setToolDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<BlockedTool | null>(null);

  // Handlers
  const handleTimelineClick = (entry: any) => {
    const timelineEntry = data?.timeline.find(t =>
      format(new Date(t.date), 'MMM dd') === entry.date && t.category === entry.category
    );
    if (timelineEntry) {
      setSelectedIncidents(timelineEntry.incidents);
      setSelectedCategory(timelineEntry.category);
      setSelectedDate(format(new Date(timelineEntry.date), 'MMM dd, yyyy'));
      setIncidentDialogOpen(true);
    }
  };

  const handleToolClick = (tool: BlockedTool) => {
    setSelectedTool(tool);
    setToolDialogOpen(true);
  };

  const handleGeographicClick = (entry: any) => {
    const geoEntry = data?.geographicMap.find(g => g.ip === entry.ip);
    if (geoEntry && data) {
      // Find all incidents related to this IP
      const relatedIncidents: IncidentSummary[] = [];
      data.timeline.forEach(timelineEntry => {
        timelineEntry.incidents.forEach(incident => {
          if (geoEntry.incidents.includes(incident.id)) {
            relatedIncidents.push(incident);
          }
        });
      });
      setSelectedIncidents(relatedIncidents);
      setSelectedCategory(`IP: ${geoEntry.ip}`);
      setSelectedDate('');
      setIncidentDialogOpen(true);
    }
  };

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
          Failed to load incident analytics: {error}
        </Alert>
      </PageContainer>
    );
  }

  if (loading || !data) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Typography variant="h6" color="text.secondary">
            Loading incident analytics...
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  const { summary, timeline, heatmap, blockedTools, geographicMap } = data;

  // Format date range
  const dateRangeText = summary.dateRange.start && summary.dateRange.end
    ? `${format(new Date(summary.dateRange.start), 'MMM dd, yyyy')} - ${format(new Date(summary.dateRange.end), 'MMM dd, yyyy')}`
    : 'N/A';

  // Group timeline data by date for stacked bar chart
  const timelineByDate = timeline.reduce((acc, entry) => {
    const dateKey = format(new Date(entry.date), 'MMM dd');
    if (!acc[dateKey]) {
      acc[dateKey] = { date: dateKey };
    }
    acc[dateKey][entry.category] = entry.count;
    return acc;
  }, {} as Record<string, any>);

  const timelineStackedData = Object.values(timelineByDate);

  // Prepare heatmap data for chart
  const heatmapChartData = heatmap.map(entry => ({
    hour: `${entry.hour}:00`,
    activity: entry.activity,
    count: entry.count,
  }));

  // Get unique categories for legend
  const uniqueCategories = Array.from(new Set(timeline.map(t => t.category)));

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
                Incident Analytics Dashboard
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 400,
                  fontSize: '16px',
                }}
              >
                Real-time security incident monitoring and analysis
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon sx={{ fontSize: '1.2rem' }} />
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {dateRangeText}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        },
        gap: 3,
        mb: 4,
      }}>
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
              {summary.totalIncidents}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Total Incidents
            </Typography>
          </CardContent>
        </Card>
        <Card
          sx={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)',
          }}
        >
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {summary.uniqueCategories}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Unique Categories
            </Typography>
          </CardContent>
        </Card>
        <Card
          sx={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)',
          }}
        >
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {summary.uniqueIPs}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Unique IPs
            </Typography>
          </CardContent>
        </Card>
        <Card
          sx={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)',
          }}
        >
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {blockedTools.length}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Blocked Tools
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Charts Section */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
        gap: 3,
        mb: 3,
      }}>
        {/* Timeline Chart */}
        <Box>
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
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <TimelineIcon sx={{ fontSize: '28px', color: '#667eea' }} />
              Incident Timeline by Category
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={timelineStackedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                onClick={(data: any) => {
                  if (data && data.activePayload && data.activePayload.length > 0) {
                    const payload = data.activePayload[0].payload;
                    const clickedCategory = Object.keys(payload).find(key => key !== 'date' && payload[key] > 0);
                    if (clickedCategory) {
                      handleTimelineClick({ date: payload.date, category: clickedCategory });
                    }
                  }
                }}
              >
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
                  cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }}
                />
                {uniqueCategories.map((category, index) => (
                  <Bar
                    key={category}
                    dataKey={category}
                    stackId="a"
                    fill={CATEGORY_COLORS[category] || CATEGORY_COLORS.default}
                    radius={index === uniqueCategories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    cursor="pointer"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, justifyContent: 'center' }}>
              {uniqueCategories.map(category => (
                <Chip
                  key={category}
                  label={category}
                  sx={{
                    backgroundColor: CATEGORY_COLORS[category] || CATEGORY_COLORS.default,
                    color: 'white',
                    fontWeight: 600,
                  }}
                  size="small"
                />
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Heatmap Chart */}
        <Box>
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
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <TimelineIcon sx={{ fontSize: '28px', color: '#f093fb' }} />
              Activity Heatmap
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={heatmapChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {heatmapChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={HOUR_COLORS[entry.activity] || '#6B7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        gap: 3,
      }}>
        {/* Blocked Tools Table */}
        <Box>
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
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <BlockIcon sx={{ fontSize: '28px', color: '#f5576c' }} />
              Top Blocked Tools
            </Typography>
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {blockedTools.slice(0, 10).map((tool, index) => (
                <Box
                  key={index}
                  onClick={() => handleToolClick(tool)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    mb: 1,
                    borderRadius: '12px',
                    backgroundColor: 'rgba(248, 250, 252, 0.8)',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(245, 87, 108, 0.1)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(245, 87, 108, 0.2)',
                      borderColor: '#f5576c',
                    },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {tool.tool}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      First: {format(new Date(tool.firstOccurrence), 'MMM dd, HH:mm')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={tool.count}
                      sx={{
                        backgroundColor: '#f5576c',
                        color: 'white',
                        fontWeight: 700,
                        minWidth: '60px',
                      }}
                    />
                    <IconButton size="small" sx={{ color: '#f5576c' }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Geographic Map */}
        <Box>
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
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <LocationIcon sx={{ fontSize: '28px', color: '#00f2fe' }} />
              Geographic Distribution
            </Typography>
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {geographicMap.map((entry, index) => (
                <Box
                  key={index}
                  onClick={() => handleGeographicClick(entry)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    mb: 1,
                    borderRadius: '12px',
                    backgroundColor: 'rgba(248, 250, 252, 0.8)',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 242, 254, 0.1)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0, 242, 254, 0.2)',
                      borderColor: '#00f2fe',
                    },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {entry.ip}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {entry.incidents.length} incident{entry.incidents.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={entry.count}
                      sx={{
                        backgroundColor: '#00f2fe',
                        color: 'white',
                        fontWeight: 700,
                        minWidth: '60px',
                      }}
                    />
                    <IconButton size="small" sx={{ color: '#00f2fe' }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Dialogs */}
      <IncidentDetailsDialog
        open={incidentDialogOpen}
        onClose={() => setIncidentDialogOpen(false)}
        incidents={selectedIncidents}
        category={selectedCategory}
        date={selectedDate}
      />

      <BlockedToolDetailsDialog
        open={toolDialogOpen}
        onClose={() => setToolDialogOpen(false)}
        tool={selectedTool}
      />
    </PageContainer>
  );
};

// Main page component with context provider
export const IncidentAnalyticsDashboard: React.FC = () => {
  return (
    <IncidentAnalyticsProvider>
      <IncidentAnalyticsDashboardContent />
    </IncidentAnalyticsProvider>
  );
};

export default IncidentAnalyticsDashboard;
