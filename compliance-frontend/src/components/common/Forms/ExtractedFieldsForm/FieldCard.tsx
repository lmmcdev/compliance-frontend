import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Chip,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import type { FieldCardProps, ConfidenceInfo } from './types';

/**
 * Get confidence level information based on confidence score
 */
const getConfidenceInfo = (confidence: number): ConfidenceInfo => {
  if (confidence >= 0.9) {
    return { label: 'High Confidence', color: 'success', icon: VerifiedIcon };
  } else if (confidence >= 0.7) {
    return { label: 'Medium Confidence', color: 'warning', icon: WarningIcon };
  } else {
    return { label: 'Low Confidence', color: 'error', icon: WarningIcon };
  }
};

/**
 * Format field name from camelCase to Title Case
 */
const formatFieldLabel = (name: string): string => {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

/**
 * FieldCard component - Displays a single extracted field with confidence indicator
 *
 * Features:
 * - Confidence score visualization with color coding
 * - Editable text field with original extracted value reference
 * - Hover effects for better UX
 * - Support for different field types (text, number, date)
 */
export const FieldCard: React.FC<FieldCardProps> = ({
  field,
  value,
  onChange,
  disabled = false,
}) => {
  const confidenceInfo = getConfidenceInfo(field.confidence);
  const ConfidenceIcon = confidenceInfo.icon;
  const fieldLabel = formatFieldLabel(field.name);

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2.5,
        borderRadius: 2,
        transition: 'all 0.2s',
        border: '2px solid',
        borderColor: 'transparent',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: 3,
        },
      }}
    >
      {/* Field Header with Confidence Badge */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={600} color="text.primary">
          {fieldLabel}
        </Typography>
        <Tooltip title={`${confidenceInfo.label} (${Math.round(field.confidence * 100)}%)`}>
          <Chip
            icon={<ConfidenceIcon />}
            label={`${Math.round(field.confidence * 100)}%`}
            size="small"
            color={confidenceInfo.color}
            variant="outlined"
          />
        </Tooltip>
      </Box>

      {/* Confidence Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={field.confidence * 100}
        sx={{
          mb: 2,
          height: 4,
          borderRadius: 2,
          bgcolor: 'grey.200',
        }}
        color={confidenceInfo.color}
      />

      {/* Editable Input Field */}
      <TextField
        fullWidth
        name={field.name}
        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
        value={value ?? field.value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${fieldLabel.toLowerCase()}`}
        variant="outlined"
        size="small"
        disabled={disabled}
        InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.paper',
          },
        }}
      />

      {/* Extracted Value Reference */}
      {field.value && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Extracted:
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              bgcolor: 'grey.100',
              px: 0.75,
              py: 0.25,
              borderRadius: 0.5,
            }}
          >
            {String(field.value)}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default FieldCard;