import React from 'react';
import { Box, Typography, Card } from '@mui/material';
import type { LicenseField } from '../../../types/license';
import { LicenseFieldCard } from './LicenseFieldCard';

interface LicenseFieldListProps {
  fields: LicenseField[];
  editableFields: Record<string, string>;
  isEditing: Record<string, boolean>;
  onFieldEdit: (fieldName: string) => void;
  onFieldSave: (fieldName: string) => void;
  onFieldCancel: (fieldName: string) => void;
  onFieldChange: (fieldName: string, value: string) => void;
  disabled?: boolean;
}

export const LicenseFieldList: React.FC<LicenseFieldListProps> = ({
  fields,
  editableFields,
  isEditing,
  onFieldEdit,
  onFieldSave,
  onFieldCancel,
  onFieldChange,
  disabled = false,
}) => {
  if (fields.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
        <Typography variant="body1" color="text.secondary">
          No fields were extracted from the document. Please check the document quality or try uploading again.
        </Typography>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Extracted Fields ({fields.length})
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)'
        },
        gap: 3
      }}>
        {fields.map((field) => (
          <LicenseFieldCard
            key={field.name}
            field={field}
            value={editableFields[field.name] || ''}
            isEditing={isEditing[field.name] || false}
            onEdit={() => onFieldEdit(field.name)}
            onSave={() => onFieldSave(field.name)}
            onCancel={() => onFieldCancel(field.name)}
            onChange={(value) => onFieldChange(field.name, value)}
            disabled={disabled}
          />
        ))}
      </Box>
    </Box>
  );
};