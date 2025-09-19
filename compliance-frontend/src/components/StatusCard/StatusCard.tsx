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
        borderLeft: `4px solid ${leftBorderColor}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          transition: 'transform 0.2s ease-in-out',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" flexDirection="column" justifyContent="space-between" height="100%">
          <Typography
            variant="h3"
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: '2.5rem',
              color: leftBorderColor,
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
              alignSelf: 'flex-start',
              '& .MuiChip-label': {
                px: 1.5,
                py: 0.5,
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatusCard;