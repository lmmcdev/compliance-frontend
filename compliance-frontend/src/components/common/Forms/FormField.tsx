import React from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Chip,
  OutlinedInput,
  Box,
  Button,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { styled } from '@mui/material/styles';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import type { FormFieldConfig } from './FormBuilder';

const FileUploadButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  width: '100%',
}));

const MultiSelectChips = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
}));

interface FormFieldProps {
  config: FormFieldConfig;
  value: any;
  error?: string;
  onChange: (value: any) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  config,
  value,
  error,
  onChange,
  onBlur,
  disabled = false,
}) => {
  const hasError = Boolean(error);

  const renderField = () => {
    switch (config.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'tel':
      case 'url':
        return (
          <TextField
            fullWidth
            label={config.label}
            type={config.type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={config.placeholder}
            helperText={error || config.helperText}
            error={hasError}
            required={config.required}
            disabled={disabled}
            inputProps={{
              min: config.validation?.min,
              max: config.validation?.max,
              minLength: config.validation?.minLength,
              maxLength: config.validation?.maxLength,
              pattern: config.validation?.pattern?.source,
            }}
          />
        );

      case 'textarea':
        return (
          <TextField
            fullWidth
            label={config.label}
            multiline
            rows={4}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={config.placeholder}
            helperText={error || config.helperText}
            error={hasError}
            required={config.required}
            disabled={disabled}
            inputProps={{
              minLength: config.validation?.minLength,
              maxLength: config.validation?.maxLength,
            }}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth error={hasError} required={config.required}>
            <InputLabel>{config.label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              label={config.label}
              disabled={disabled}
            >
              {config.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(error || config.helperText) && (
              <FormHelperText>{error || config.helperText}</FormHelperText>
            )}
          </FormControl>
        );

      case 'multiselect':
        return (
          <FormControl fullWidth error={hasError} required={config.required}>
            <InputLabel>{config.label}</InputLabel>
            <Select
              multiple
              value={Array.isArray(value) ? value : []}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              input={<OutlinedInput label={config.label} />}
              renderValue={(selected) => (
                <MultiSelectChips>
                  {(selected as string[]).map((val) => {
                    const option = config.options?.find(opt => opt.value === val);
                    return (
                      <Chip
                        key={val}
                        label={option?.label || val}
                        size="small"
                      />
                    );
                  })}
                </MultiSelectChips>
              )}
              disabled={disabled}
            >
              {config.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(error || config.helperText) && (
              <FormHelperText>{error || config.helperText}</FormHelperText>
            )}
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControl error={hasError}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(value)}
                  onChange={(e) => onChange(e.target.checked)}
                  onBlur={onBlur}
                  disabled={disabled}
                />
              }
              label={config.label}
            />
            {(error || config.helperText) && (
              <FormHelperText>{error || config.helperText}</FormHelperText>
            )}
          </FormControl>
        );

      case 'radio':
        return (
          <FormControl error={hasError} required={config.required}>
            <FormLabel component="legend">{config.label}</FormLabel>
            <RadioGroup
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
            >
              {config.options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio disabled={disabled} />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
            {(error || config.helperText) && (
              <FormHelperText>{error || config.helperText}</FormHelperText>
            )}
          </FormControl>
        );

      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={config.label}
              value={value ? new Date(value) : null}
              onChange={(date) => onChange(date?.toISOString())}
              disabled={disabled}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: hasError,
                  helperText: error || config.helperText,
                  required: config.required,
                  onBlur,
                },
              }}
            />
          </LocalizationProvider>
        );

      case 'file':
        return (
          <FormControl fullWidth error={hasError}>
            <input
              type="file"
              id={`file-input-${config.name}`}
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                onChange(file);
              }}
              onBlur={onBlur}
              disabled={disabled}
            />
            <label htmlFor={`file-input-${config.name}`}>
              <FileUploadButton
                variant="outlined"
                startIcon={<UploadIcon />}
                disabled={disabled}
              >
                {value ? value.name || 'File selected' : config.label}
              </FileUploadButton>
            </label>
            {(error || config.helperText) && (
              <FormHelperText>{error || config.helperText}</FormHelperText>
            )}
          </FormControl>
        );

      default:
        return (
          <TextField
            fullWidth
            label={config.label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={config.placeholder}
            helperText={error || config.helperText}
            error={hasError}
            required={config.required}
            disabled={disabled}
          />
        );
    }
  };

  return renderField();
};

export default FormField;