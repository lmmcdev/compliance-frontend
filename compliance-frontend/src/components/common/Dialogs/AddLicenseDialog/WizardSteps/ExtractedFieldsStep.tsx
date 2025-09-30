import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { ExtractedFieldsForm } from '../../../Forms/ExtractedFieldsForm';

interface ExtractedFieldsStepProps {
  extractedData: any;
  formData: Record<string, any>;
  onFieldChange: (fieldName: string, value: any) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

/**
 * Step 3: Review & Edit Extracted Fields
 * Displays extracted document fields and allows user to review/edit them
 */
export const ExtractedFieldsStep: React.FC<ExtractedFieldsStepProps> = ({
  extractedData,
  formData,
  onFieldChange,
  onSubmit,
  disabled = false,
}) => {
  if (!extractedData || !extractedData.fields || extractedData.fields.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Review Extracted Information
        </Typography>
        <Alert severity="info">
          No fields were extracted from the document. You can still proceed to create the license manually.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <ExtractedFieldsForm
        fields={extractedData.fields}
        metadata={{
          licenseType: extractedData.licenseType || extractedData.documentType || 'Unknown',
          confidence: extractedData.confidence || 0,
          ...extractedData.metadata,
        }}
        initialValues={formData}
        onFieldChange={onFieldChange}
        onSubmit={onSubmit}
        loading={false}
        disabled={disabled}
      />
    </Box>
  );
};
