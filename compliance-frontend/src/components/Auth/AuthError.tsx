import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Container,
  Stack
} from '@mui/material';
import { ErrorOutline, Home, Refresh } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface AuthErrorProps {
  errorCode?: string;
  errorMessage?: string;
}

const AuthError: React.FC<AuthErrorProps> = ({ errorCode, errorMessage }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlErrorCode = searchParams.get('code');
  const urlErrorMessage = searchParams.get('message');

  const finalErrorCode = errorCode || urlErrorCode || 'UNKNOWN_ERROR';
  const finalErrorMessage = errorMessage || urlErrorMessage || 'An unexpected authentication error occurred.';

  const getErrorDetails = (code: string) => {
    switch (code) {
      case 'USER_BLOCKED':
      case 'user_blocked':
        return {
          title: 'Account Blocked',
          description: 'Your account has been blocked by an administrator. Please contact your system administrator for assistance.',
          severity: 'error' as const,
          icon: <ErrorOutline fontSize="large" color="error" />
        };
      case 'CONSENT_REQUIRED':
      case 'consent_required':
        return {
          title: 'Consent Required',
          description: 'Additional consent is required to access this application. Please try logging in again.',
          severity: 'warning' as const,
          icon: <ErrorOutline fontSize="large" color="warning" />
        };
      case 'INVALID_REQUEST':
      case 'invalid_request':
        return {
          title: 'Invalid Request',
          description: 'The authentication request was invalid. Please try again.',
          severity: 'error' as const,
          icon: <ErrorOutline fontSize="large" color="error" />
        };
      case 'LOGIN_REQUIRED':
      case 'login_required':
        return {
          title: 'Login Required',
          description: 'You need to log in to access this application.',
          severity: 'info' as const,
          icon: <ErrorOutline fontSize="large" color="info" />
        };
      default:
        return {
          title: 'Authentication Error',
          description: 'An error occurred during authentication. Please try again.',
          severity: 'error' as const,
          icon: <ErrorOutline fontSize="large" color="error" />
        };
    }
  };

  const errorDetails = getErrorDetails(finalErrorCode);

  const handleRetry = () => {
    navigate('/login');
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        py={4}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 600,
            width: '100%',
            textAlign: 'center'
          }}
        >
          <Stack spacing={3} alignItems="center">
            {errorDetails.icon}

            <Typography variant="h4" component="h1" gutterBottom>
              {errorDetails.title}
            </Typography>

            <Alert
              severity={errorDetails.severity}
              sx={{ width: '100%', textAlign: 'left' }}
            >
              <Typography variant="body1">
                {errorDetails.description}
              </Typography>
            </Alert>

            {finalErrorMessage && finalErrorMessage !== errorDetails.description && (
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Technical Details:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    backgroundColor: 'grey.100',
                    p: 2,
                    borderRadius: 1,
                    wordBreak: 'break-all'
                  }}
                >
                  {finalErrorCode}: {finalErrorMessage}
                </Typography>
              </Box>
            )}

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleRetry}
                size="large"
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={handleHome}
                size="large"
              >
                Home
              </Button>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              If this problem persists, please contact your system administrator.
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default AuthError;