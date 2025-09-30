import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface StatusCardProps {
  count: number;
  label: string;
  status: 'new' | 'emergency' | 'inProgress' | 'pending' | 'done' | 'duplicated' | 'total';
  leftBorderColor: string;
  chipColor: string;
  chipTextColor?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({
  count,
  label,
  status,
  leftBorderColor,
  chipColor,
  chipTextColor = '#ffffff'
}) => {
  const theme = useTheme();

  const getBackgroundColor = () => {
    return theme.palette.status[status];
  };

  return (
    <Card
      sx={{
        height: '120px',
        position: 'relative',
        backgroundColor: getBackgroundColor(),
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease-in-out',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: leftBorderColor,
          borderRadius: '12px 0 0 12px',
        }
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative' }}>
        <Box display="flex" flexDirection="column" justifyContent="space-between" height="100%">
          <Typography
            variant="h3"
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
              color: '#1e293b',
              lineHeight: 1,
              mb: 1,
            }}
          >
            {count.toLocaleString()}
          </Typography>

          <Chip
            label={label}
            sx={{
              backgroundColor: chipColor,
              color: chipTextColor,
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
              '& .MuiChip-label': {
                px: 1.5,
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatusCard;