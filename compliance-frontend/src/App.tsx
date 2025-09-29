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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

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
