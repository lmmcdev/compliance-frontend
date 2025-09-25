import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface LicenseField {
  name: string;
  value: string;
  confidence: number;
  type: string;
  boundingRegions?: Array<{
    pageNumber: number;
    polygon: number[];
  }>;
}

interface LicenseData {
  success: boolean;
  data: {
    result: {
      fields: LicenseField[];
      content: string;
      pages: number;
    };
    analyzeResult: {
      modelId: string;
      apiVersion: string;
      documentsCount: number;
    };
    timestamp: string;
  };
  meta: {
    traceId: string;
  };
}

export interface LicenseDataDisplayProps {
  licenseData: LicenseData | null;
  loading?: boolean;
  error?: string;
}

const FieldCard = styled(Card)(({ theme }) => ({
  marginBottom: theme?.spacing(2) || 16,
  border: '1px solid #e0e0e0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
}));

const ConfidenceChip = styled(Chip)<{ confidence: number }>(({ confidence }) => ({
  fontSize: '0.75rem',
  height: 20,
  backgroundColor: confidence >= 0.9 ? '#4caf50' : confidence >= 0.7 ? '#ff9800' : '#f44336',
  color: 'white',
}));

const LicenseDataDisplay: React.FC<LicenseDataDisplayProps> = ({
  licenseData,
  loading = false,
  error,
}) => {
  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Analyzing document...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error processing document: {error}
      </Alert>
    );
  }

  if (!licenseData || !licenseData.success) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        No license data available or processing failed.
      </Alert>
    );
  }

  const { fields, content, pages } = licenseData.data.result;
  const { modelId, documentsCount } = licenseData.data.analyzeResult;

  // Filter out empty fields
  const validFields = fields.filter(field => field.value && field.value.trim() !== '');

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.7) return 'warning';
    return 'error';
  };

  const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Extracted License Information
      </Typography>

      {/* Metadata */}
      <Card sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Model:</strong> {modelId}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Pages:</strong> {pages}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Documents:</strong> {documentsCount}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Processed:</strong> {new Date(licenseData.data.timestamp).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dynamic Fields */}
      {validFields.length > 0 ? (
        <Grid container spacing={2}>
          {validFields.map((field, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FieldCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      {field.name}
                    </Typography>
                    <ConfidenceChip
                      confidence={field.confidence}
                      label={formatConfidence(field.confidence)}
                      size="small"
                      color={getConfidenceColor(field.confidence) as any}
                    />
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
                    {field.value}
                  </Typography>
                  {field.boundingRegions && field.boundingRegions.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Page {field.boundingRegions[0].pageNumber}
                    </Typography>
                  )}
                </CardContent>
              </FieldCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info">
          No valid fields were extracted from the document.
        </Alert>
      )}

      {/* Document Content Preview */}
      {content && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Document Content Preview
          </Typography>
          <Card>
            <CardContent>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-line',
                  maxHeight: 200,
                  overflow: 'auto',
                  backgroundColor: '#f5f5f5',
                  padding: 2,
                  borderRadius: 1,
                }}
              >
                {content}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default LicenseDataDisplay;