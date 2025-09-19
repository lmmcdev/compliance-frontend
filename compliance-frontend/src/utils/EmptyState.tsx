import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import {
  SearchOff as NoDataIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  showRetry?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data available',
  description = 'There are no records to display at this time.',
  icon = <NoDataIcon sx={{ fontSize: 64, color: 'text.secondary' }} />,
  actionLabel = 'Retry',
  onAction,
  showRetry = true,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 4,
        textAlign: 'center',
        backgroundColor: 'transparent',
      }}
    >
      <Box sx={{ mb: 3 }}>
        {icon}
      </Box>

      <Typography
        variant="h6"
        component="h3"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          mb: 1,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          maxWidth: 400,
          mb: 3,
          lineHeight: 1.5,
        }}
      >
        {description}
      </Typography>

      {showRetry && onAction && (
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onAction}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;