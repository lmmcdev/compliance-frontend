import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
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
      {/* Title */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Review & Edit Extracted Information
      </Typography>

      {/* Metadata Panel */}
      <MetadataPanel metadata={metadata} fieldsCount={fields.length} />

      {/* Instructions Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Review the automatically extracted information below. You can edit any field if needed.
        Fields with high confidence (green) are likely accurate, while those with lower confidence (yellow/red) should be verified.
      </Alert>

      {/* Dynamic Form Fields */}
      <Box component="form" noValidate>
        <Grid container spacing={3}>
          {fields.map((field) => (
            <Grid key={field.name} size={{ xs: 12, md: 6 }}>
              <FieldCard
                field={field}
                value={initialValues[field.name]}
                onChange={(value) => onFieldChange(field.name, value)}
                disabled={disabled || loading}
              />
            </Grid>
          ))}
        </Grid>

        {/* Submit Button */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
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