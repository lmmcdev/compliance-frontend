import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Chip,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Description as FileIcon,
  Info as InfoIcon,
  VerifiedUser as VerifiedIcon,
  Psychology as ModelIcon,
  Api as ApiIcon,
  DocumentScanner as DocumentIcon,
  Analytics as AnalyticsIcon,
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
        p: 3,
        mb: 3,
        bgcolor: 'background.paper',
        border: '2px solid',
        borderColor: 'divider',
        borderRadius: 3,
      }}
    >
      <Grid container spacing={3} alignItems="center">
        {/* Document Type */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: 'primary.50',
            }}
          >
            <Box
              sx={{
                bgcolor: 'primary.main',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500, mb: 0.5 }}>
                Document Type
              </Typography>
              <Tooltip
                title={modelId || metadata.licenseType || metadata.documentType || 'General License'}
                arrow
                placement="top"
              >
                <Typography
                  variant="body1"
                  fontWeight={700}
                  color="primary.main"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    cursor: 'help',
                  }}
                >
                  {modelId || metadata.licenseType || metadata.documentType || 'General License'}
                </Typography>
              </Tooltip>
            </Box>
          </Box>
        </Grid>

        {/* Fields Extracted Count */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: 'info.50',
            }}
          >
            <Box
              sx={{
                bgcolor: 'info.main',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <InfoIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500, mb: 0.5 }}>
                Fields Extracted
              </Typography>
              <Typography variant="body1" fontWeight={700} color="info.main">
                {fieldsCount} {fieldsCount === 1 ? 'field' : 'fields'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Overall Confidence Score */}
        {metadata.confidence !== undefined && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: 'success.50',
              }}
            >
              <Box
                sx={{
                  bgcolor: getConfidenceColor(metadata.confidence) === 'success' ? 'success.main' :
                           getConfidenceColor(metadata.confidence) === 'warning' ? 'warning.main' : 'error.main',
                  borderRadius: 2,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <VerifiedIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500, mb: 0.5 }}>
                  Overall Confidence
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={metadata.confidence * 100}
                    sx={{ flex: 1, height: 8, borderRadius: 4 }}
                    color={getConfidenceColor(metadata.confidence)}
                  />
                  <Typography variant="body1" fontWeight={700} color={`${getConfidenceColor(metadata.confidence)}.main`}>
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
              <AnalyticsIcon fontSize="small" />
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