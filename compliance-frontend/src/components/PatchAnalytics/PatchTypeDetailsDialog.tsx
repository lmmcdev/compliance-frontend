import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { ComplianceByPatchType } from '../../types/patchAnalytics';

interface PatchTypeDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  patchType: ComplianceByPatchType | null;
}

export const PatchTypeDetailsDialog: React.FC<PatchTypeDetailsDialogProps> = ({
  open,
  onClose,
  patchType,
}) => {
  if (!patchType) return null;

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'installed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getComplianceColor = (rate: number): string => {
    if (rate >= 90) return '#10b981';
    if (rate >= 70) return '#f59e0b';
    return '#ef4444';
  };

  // Create byStatus array from the data if it doesn't exist
  const byStatus = patchType.byStatus || [
    { status: 'Installed', count: patchType.installed },
    { status: 'Pending', count: patchType.pending },
    { status: 'Failed', count: patchType.failed },
  ].filter(item => item.count > 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
      }}
    >
      <DialogTitle
        sx={{
          color: 'white',
          fontWeight: 600,
          fontSize: '1.5rem',
          pb: 2,
        }}
      >
        {patchType.patchType}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          bgcolor: '#f8fafc',
          p: 3,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Summary Section */}
          <Box
            sx={{
              bgcolor: 'white',
              p: 3,
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1e293b' }}>
              Summary
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Patches
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#667eea' }}>
                  {patchType.totalPatches}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Compliance Rate
                </Typography>
                <Chip
                  label={`${patchType.complianceRate.toFixed(1)}%`}
                  sx={{
                    bgcolor: getComplianceColor(patchType.complianceRate),
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1.25rem',
                    height: '40px',
                    mt: 0.5,
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Status Breakdown */}
          <Box
            sx={{
              bgcolor: 'white',
              p: 3,
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1e293b' }}>
              Status Breakdown
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {byStatus.map((statusEntry) => (
                <Box
                  key={statusEntry.status}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    borderRadius: '8px',
                    bgcolor: '#f8fafc',
                    border: `2px solid ${getStatusColor(statusEntry.status)}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: getStatusColor(statusEntry.status),
                      }}
                    />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {statusEntry.status}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {statusEntry.count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {((statusEntry.count / patchType.totalPatches) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Classification Breakdown */}
          {patchType.byClassification && patchType.byClassification.length > 0 && (
            <Box
              sx={{
                bgcolor: 'white',
                p: 3,
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1e293b' }}>
                Classification Breakdown
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {patchType.byClassification.map((classEntry) => (
                  <Box
                    key={classEntry.classification}
                    sx={{
                      p: 2,
                      borderRadius: '8px',
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {classEntry.classification}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#667eea' }}>
                        {classEntry.count}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {classEntry.byStatus.map((status) => (
                        <Chip
                          key={status.status}
                          label={`${status.status}: ${status.count}`}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(status.status),
                            color: 'white',
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
