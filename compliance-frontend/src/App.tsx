import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthenticationProvider from './middleware/AuthenticationProvider';
import { theme } from './theme/theme';
import Layout from './components/Layout/Layout';
import { Login, AuthError } from './components/Auth';
import Dashboard from './components/Dashboard/Dashboard';
import { LicensesPage } from './components/LicenseManagement/LicensesPage';
import ComplianceForm from './components/ComplianceForm/ComplianceForm';
import { IncidentsPage } from './components/Incident/IncidentsPage';
import { IncidentAnalyticsDashboard } from './components/IncidentAnalytics/IncidentAnalyticsDashboard';
import { PatchAnalyticsDashboard, PatchDetailsDashboard } from './components/PatchAnalytics';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const LoadingSpinner = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: 2
    }}
  >
    <Box
      sx={{
        width: 40,
        height: 40,
        border: '4px solid #e2e8f0',
        borderTop: '4px solid #00A1FF',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        '@keyframes spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      }}
    />
    <Box sx={{ color: '#64748b', fontSize: '14px' }}>
      Loading application...
    </Box>
  </Box>
);

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Layout>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/auth-error"
          element={<AuthError />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/licenses"
          element={
            <ProtectedRoute>
              <LicensesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compliance"
          element={
            <ProtectedRoute>
              <ComplianceForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents"
          element={
            <ProtectedRoute>
              <IncidentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/charts"
          element={
            <ProtectedRoute>
              <IncidentAnalyticsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patch-analytics"
          element={
            <ProtectedRoute>
              <PatchAnalyticsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patch-details"
          element={
            <ProtectedRoute>
              <PatchDetailsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <AuthProvider>
          <AuthenticationProvider>
            <Router>
              <AppRoutes />
            </Router>
          </AuthenticationProvider>
        </AuthProvider>
      </Box>
    </ThemeProvider>
  );
}

export default App;
