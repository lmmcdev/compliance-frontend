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
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Block as BlockIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { BlockedTool } from '../../types/incidentAnalytics';

interface BlockedToolDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  tool: BlockedTool | null;
}

export const BlockedToolDetailsDialog: React.FC<BlockedToolDetailsDialogProps> = ({
  open,
  onClose,
  tool,
}) => {
  if (!tool) return null;

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
          background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2.5,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            <BlockIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '28px' }} />
            Blocked Tool Details
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
            {tool.tool}
          </Typography>
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

      <DialogContent sx={{ p: 3 }}>
        {/* Statistics Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
            mb: 3,
          }}
        >
          <Box
            sx={{
              p: 2.5,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
              {tool.count}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Total Incidents
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2.5,
              borderRadius: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
            }}
          >
            <TrendingIcon sx={{ fontSize: '32px', color: '#f5576c', mb: 0.5 }} />
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
              Blocked Tool
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Timeline Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1e293b' }}>
            <ScheduleIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '20px' }} />
            Timeline
          </Typography>
          <Box
            sx={{
              p: 2.5,
              borderRadius: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
                First Occurrence
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                {formatDateTime(tool.firstOccurrence)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
                Last Occurrence
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                {formatDateTime(tool.lastOccurrence)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Related Incidents */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1e293b' }}>
            Related Incidents ({tool.incidents.length})
          </Typography>
          <List
            sx={{
              maxHeight: '250px',
              overflowY: 'auto',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              p: 0,
            }}
          >
            {tool.incidents.map((incidentId, index) => (
              <React.Fragment key={incidentId}>
                <ListItem
                  sx={{
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(245, 87, 108, 0.05)',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          sx={{
                            backgroundColor: '#f5576c',
                            color: 'white',
                            fontWeight: 600,
                            minWidth: '45px',
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          Incident ID: {incidentId}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < tool.incidents.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, backgroundColor: '#f8fafc' }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
            color: 'white',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
