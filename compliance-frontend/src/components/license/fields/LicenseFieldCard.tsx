import React from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import type { LicenseField } from '../../../types/license';
import { getConfidenceColor, formatConfidence } from '../../../utils/fieldExtractor';

const FieldCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: 12,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    borderColor: theme.palette.primary.light,
  },
}));

const ConfidenceChip = styled(Chip)<{ confidence: number }>(({ confidence }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  backgroundColor: confidence >= 0.8 ? '#4caf50' : confidence >= 0.6 ? '#ff9800' : '#f44336',
  color: 'white',
}));

interface LicenseFieldCardProps {
  field: LicenseField;
  value: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const LicenseFieldCard: React.FC<LicenseFieldCardProps> = ({
  field,
  value,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onChange,
  disabled = false,
}) => {
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onSave();
    } else if (event.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <FieldCard>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {field.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <ConfidenceChip
              confidence={field.confidence}
              label={formatConfidence(field.confidence)}
              size="small"
              color={getConfidenceColor(field.confidence) as any}
            />
            {!disabled && !isEditing && (
              <IconButton
                size="small"
                onClick={onEdit}
                sx={{ color: 'primary.main' }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {isEditing ? (
          <Box>
            <TextField
              fullWidth
              value={value}
              onChange={(e) => onChange(e.target.value)}
              variant="outlined"
              size="small"
              autoFocus
              onKeyDown={handleKeyPress}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <IconButton
                size="small"
                onClick={onCancel}
                color="error"
              >
                <CancelIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={onSave}
                color="primary"
              >
                <SaveIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: value ? 'text.primary' : 'text.secondary',
                fontStyle: value ? 'normal' : 'italic',
                minHeight: '1.5em',
                p: 1,
                bgcolor: '#f8f9fa',
                borderRadius: 1,
                border: '1px solid #e0e0e0',
              }}
            >
              {value || 'No value'}
            </Typography>
            {field.type && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Type: {field.type}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </FieldCard>
  );
};