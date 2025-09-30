import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Chip,
  Tooltip,
  LinearProgress,
  Collapse,
  IconButton,
  Divider,
} from '@mui/material';
import {
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Description as PageIcon,
  Category as CategoryIcon,
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
  const [expanded, setExpanded] = useState(false);
  const confidenceInfo = getConfidenceInfo(field.confidence);
  const ConfidenceIcon = confidenceInfo.icon;
  const fieldLabel = formatFieldLabel(field.name);

  // Check if there's additional metadata to show
  const hasMetadata = !!(field.page || field.category || field.description || field.type || field.rawText || field.source);

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary">
            {fieldLabel}
          </Typography>
          {field.required && (
            <Chip label="Required" size="small" color="error" variant="outlined" sx={{ height: 20 }} />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={`${confidenceInfo.label} (${Math.round(field.confidence * 100)}%)`}>
            <Chip
              icon={<ConfidenceIcon />}
              label={`${Math.round(field.confidence * 100)}%`}
              size="small"
              color={confidenceInfo.color}
              variant="outlined"
            />
          </Tooltip>
          {hasMetadata && (
            <Tooltip title="Show field details">
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                }}
              >
                <ExpandMoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
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
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
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

      {/* Expandable Metadata Section */}
      {hasMetadata && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
              <InfoIcon fontSize="small" />
              Field Details
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {field.type && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                    Type:
                  </Typography>
                  <Chip label={field.type} size="small" variant="outlined" sx={{ height: 20 }} />
                </Box>
              )}

              {field.category && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CategoryIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 70 }}>
                    Category:
                  </Typography>
                  <Typography variant="caption" fontWeight={500}>
                    {field.category}
                  </Typography>
                </Box>
              )}

              {field.page !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PageIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 70 }}>
                    Page:
                  </Typography>
                  <Typography variant="caption" fontWeight={500}>
                    {field.page}
                  </Typography>
                </Box>
              )}

              {field.description && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                    Description:
                  </Typography>
                  <Typography variant="caption" sx={{ flex: 1 }}>
                    {field.description}
                  </Typography>
                </Box>
              )}

              {field.source && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                    Source:
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      bgcolor: 'grey.100',
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 0.5,
                      fontSize: '0.7rem',
                    }}
                  >
                    {field.source}
                  </Typography>
                </Box>
              )}

              {field.rawText && field.rawText !== field.value && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                    Raw Text:
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      bgcolor: 'warning.lighter',
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 0.5,
                      fontSize: '0.7rem',
                    }}
                  >
                    {field.rawText}
                  </Typography>
                </Box>
              )}

              {field.boundingBox && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                    Position:
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                    }}
                  >
                    x:{field.boundingBox.x}, y:{field.boundingBox.y}, w:{field.boundingBox.width}, h:{field.boundingBox.height}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Collapse>
      )}
    </Paper>
  );
};

export default FieldCard;