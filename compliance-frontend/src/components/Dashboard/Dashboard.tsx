import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { DashboardMetrics } from '../../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Compliance Dashboard</h2>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Licenses</h3>
          <p className="metric-value">{metrics.totalLicenses}</p>
        </div>
        
        <div className="metric-card">
          <h3>Total Compliance Cases</h3>
          <p className="metric-value">{metrics.totalComplianceCases}</p>
        </div>
        
        <div className="metric-card">
          <h3>Expiring Soon</h3>
          <p className="metric-value">{metrics.expiringLicenses.length}</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Licenses by Type</h3>
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
        </div>

        <div className="chart-container">
          <h3>License Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.licensesByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container full-width">
          <h3>Compliance Cases per Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.complianceCasesByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;