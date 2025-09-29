import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  Description as FileIcon,
  Info as InfoIcon,
  VerifiedUser as VerifiedIcon,
} from '@mui/icons-material';
import type { MetadataPanelProps } from './types';

/**
 * MetadataPanel component - Displays document metadata and extraction summary
 *
 * Shows:
 * - Document type
 * - Number of extracted fields
 * - Overall confidence score with color-coded progress bar
 */
export const MetadataPanel: React.FC<MetadataPanelProps> = ({
  metadata,
  fieldsCount,
}) => {
  if (!metadata) return null;

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'primary';
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.7) return 'warning';
    return 'error';
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 3,
        bgcolor: 'primary.50',
        border: '1px solid',
        borderColor: 'primary.200',
        borderRadius: 2,
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* Document Type */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileIcon color="primary" />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Document Type
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {metadata.licenseType || metadata.documentType || 'General License'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Fields Extracted Count */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Fields Extracted
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {fieldsCount} {fieldsCount === 1 ? 'field' : 'fields'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Overall Confidence Score */}
        {metadata.confidence !== undefined && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedIcon color="success" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Overall Confidence
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={metadata.confidence * 100}
                    sx={{ flex: 1, height: 6, borderRadius: 3 }}
                    color={getConfidenceColor(metadata.confidence)}
                  />
                  <Typography variant="body2" fontWeight={600}>
                    {Math.round(metadata.confidence * 100)}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default MetadataPanel;