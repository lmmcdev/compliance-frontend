import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import { Check as CheckIcon, AutoAwesome as MagicIcon, Edit as EditIcon } from '@mui/icons-material';
import { FieldCard } from './FieldCard';
import { MetadataPanel } from './MetadataPanel';
import type { ExtractedFieldsFormProps } from './types';

/**
 * ExtractedFieldsForm component - Displays and allows editing of dynamically extracted document fields
 *
 * This component is designed to be reusable across different document upload workflows.
 * It displays extracted fields with confidence scores, metadata, and allows users to
 * review and edit the extracted information before submission.
 *
 * Features:
 * - Document metadata display (type, field count, overall confidence)
 * - Individual field cards with confidence indicators
 * - Real-time field editing
 * - Responsive grid layout
 * - Professional UI with clear visual hierarchy
 *
 * @example
 * ```tsx
 * <ExtractedFieldsForm
 *   fields={extractedFields}
 *   metadata={{ licenseType: 'Business License', confidence: 0.92 }}
 *   initialValues={formData}
 *   onFieldChange={handleFieldChange}
 *   onSubmit={handleSubmit}
 * />
 * ```
 */
export const ExtractedFieldsForm: React.FC<ExtractedFieldsFormProps> = ({
  fields,
  metadata,
  initialValues,
  onFieldChange,
  onSubmit,
  loading = false,
  disabled = false,
}) => {
  // Handle empty fields case
  if (!fields || fields.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Review & Edit Extracted Information
        </Typography>
        <Alert severity="warning">
          No fields were extracted from the uploaded document. Please try uploading a different file or contact support.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Modern Header */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            transform: 'translate(50%, -50%)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MagicIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
              AI-Extracted Information
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Review and edit the automatically extracted fields from your document
            </Typography>
          </Box>
          <EditIcon sx={{ fontSize: 40, color: 'rgba(255, 255, 255, 0.3)' }} />
        </Box>
      </Paper>

      {/* Metadata Panel */}
      <MetadataPanel metadata={metadata} fieldsCount={fields.length} />

      {/* Instructions Alert */}
      <Alert
        severity="info"
        sx={{
          mb: 3,
          borderRadius: 2,
          '& .MuiAlert-icon': {
            fontSize: 28,
          }
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Review the extracted information below. Fields with <strong>high confidence (green)</strong> are likely accurate,
          while those with <strong>lower confidence (yellow/red)</strong> should be verified carefully.
        </Typography>
      </Alert>

      {/* Section Divider */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Divider sx={{ flex: 1 }} />
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1 }}>
          {fields.length} Fields Extracted
        </Typography>
        <Divider sx={{ flex: 1 }} />
      </Box>

      {/* Dynamic Form Fields */}
      <Box component="form" noValidate>
        <Grid container spacing={3}>
          {fields.map((field, index) => (
            <Grid key={field.name} size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  animation: 'fadeIn 0.4s ease-out',
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: 'both',
                  '@keyframes fadeIn': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(10px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                <FieldCard
                  field={field}
                  value={initialValues[field.name]}
                  onChange={(value) => onFieldChange(field.name, value)}
                  disabled={disabled || loading}
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Submit Button - Hidden as navigation is handled by wizard */}
        <Box sx={{ mt: 4, display: 'none' }}>
          <Button
            variant="contained"
            size="large"
            onClick={onSubmit}
            disabled={loading || disabled}
            startIcon={<CheckIcon />}
            sx={{ minWidth: 200 }}
          >
            {loading ? 'Processing...' : 'Continue to Save'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ExtractedFieldsForm;