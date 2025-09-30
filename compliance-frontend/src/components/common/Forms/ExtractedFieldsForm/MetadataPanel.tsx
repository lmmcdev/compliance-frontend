import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  Description as FileIcon,
  Info as InfoIcon,
  VerifiedUser as VerifiedIcon,
  Source as ModelIcon,
  Api as ApiIcon,
  DocumentScanner as DocumentIcon,
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

  // Extract analyzeResult metadata if available
  const analyzeResult = (metadata as any).analyzeResult;
  const modelId = (metadata as any).modelId || analyzeResult?.modelId;
  const apiVersion = (metadata as any).apiVersion || analyzeResult?.apiVersion;
  const documentsCount = (metadata as any).documentsCount || analyzeResult?.documentsCount;

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
                {modelId || metadata.licenseType || metadata.documentType || 'General License'}
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

      {/* Analyze Result Details */}
      {(modelId || apiVersion || documentsCount !== undefined) && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
              <ModelIcon fontSize="small" />
              Analysis Details
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
              {modelId && (
                <Chip
                  icon={<ModelIcon fontSize="small" />}
                  label={`Model: ${modelId}`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
              {apiVersion && (
                <Chip
                  icon={<ApiIcon fontSize="small" />}
                  label={`API: ${apiVersion}`}
                  size="small"
                  variant="outlined"
                  color="default"
                />
              )}
              {documentsCount !== undefined && (
                <Chip
                  icon={<DocumentIcon fontSize="small" />}
                  label={`${documentsCount} ${documentsCount === 1 ? 'document' : 'documents'}`}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              )}
            </Box>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default MetadataPanel;