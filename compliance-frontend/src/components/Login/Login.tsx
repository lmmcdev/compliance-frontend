import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Alert, CircularProgress, Button, Typography, Box } from '@mui/material';

const Login = () => {
  const { login, authError, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      clearError();
      await login();
    } catch (error) {
      // Error is already handled in AuthContext
      console.log('Login error handled by AuthContext');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <Typography variant="h4" component="h2" gutterBottom>
          Welcome to Compliance Management System
        </Typography>

        <Typography variant="body1" paragraph>
          Please sign in with your Microsoft account to continue
        </Typography>

        {authError && authError.code !== 'user_blocked' && (
          <Alert
            severity="error"
            onClose={clearError}
            sx={{ mb: 2 }}
          >
            Authentication failed: {authError.message}
          </Alert>
        )}

        <Button
          onClick={handleLogin}
          className="login-btn"
          variant="contained"
          size="large"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Signing in...' : 'Sign in with Microsoft'}
        </Button>

        <Box className="login-info" sx={{ mt: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            Features:
          </Typography>
          <ul>
            <li>License Management & Tracking</li>
            <li>Automated License Data Extraction</li>
            <li>Compliance Case Management</li>
            <li>Dashboard Analytics</li>
          </ul>
        </Box>
      </div>
    </div>
  );
};

export default Login;