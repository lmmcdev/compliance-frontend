import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { IncidentSummary } from '../../types/incidentAnalytics';

interface IncidentDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  incidents: IncidentSummary[];
  category?: string;
  date?: string;
}

export const IncidentDetailsDialog: React.FC<IncidentDetailsDialogProps> = ({
  open,
  onClose,
  incidents,
  category,
  date,
}) => {
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
    } catch {
      return dateString;
    }
  };

  const calculateDuration = (created: string, resolved: string) => {
    try {
      const createdDate = new Date(created);
      const resolvedDate = new Date(resolved);
      const diffMs = resolvedDate.getTime() - createdDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    } catch {
      return 'N/A';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2.5,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Incident Details
          </Typography>
          {category && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
              <CategoryIcon sx={{ fontSize: '18px' }} />
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {category}
              </Typography>
            </Box>
          )}
          {date && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
              <CalendarIcon sx={{ fontSize: '18px' }} />
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {date}
              </Typography>
            </Box>
          )}
        </Box>
        <Button
          onClick={onClose}
          sx={{
            color: 'white',
            minWidth: 'auto',
            p: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1e293b' }}>
            {incidents.length} Incident{incidents.length !== 1 ? 's' : ''}
          </Typography>

          {incidents.map((incident) => (
            <Box
              key={incident.id}
              sx={{
                mb: 3,
                p: 3,
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Chip
                    label={`ID: ${incident.id}`}
                    size="small"
                    sx={{
                      backgroundColor: '#667eea',
                      color: 'white',
                      fontWeight: 600,
                      mb: 1,
                    }}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {incident.title}
                  </Typography>
                </Box>
                <Chip
                  label="Resolved"
                  size="small"
                  sx={{
                    backgroundColor: '#10B981',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#64748b', borderBottom: 'none', width: '40%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScheduleIcon sx={{ fontSize: '18px' }} />
                        Created
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: 'none' }}>
                      {formatDateTime(incident.created)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#64748b', borderBottom: 'none' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScheduleIcon sx={{ fontSize: '18px' }} />
                        Resolved
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: 'none' }}>
                      {formatDateTime(incident.resolved)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#64748b', borderBottom: 'none' }}>
                      Duration
                    </TableCell>
                    <TableCell sx={{ borderBottom: 'none' }}>
                      <Chip
                        label={calculateDuration(incident.created, incident.resolved)}
                        size="small"
                        sx={{
                          backgroundColor: '#F0F9FF',
                          color: '#0369A1',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, backgroundColor: '#f8fafc' }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
