import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FormField } from './FormField';
import { useApiMutation } from '../../../hooks/data';

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
}));

const FormHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const FormActions = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
}));

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'date' | 'file';
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  validation?: {
    pattern?: RegExp;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => string | null;
  };
  options?: Array<{ label: string; value: string | number }>;
  disabled?: boolean;
  hidden?: boolean;
  grid?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  dependsOn?: {
    field: string;
    value: any;
    condition?: 'equals' | 'not-equals' | 'includes' | 'greater-than' | 'less-than';
  };
}

export interface FormBuilderProps {
  title?: string;
  subtitle?: string;
  fields: FormFieldConfig[];
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  showCancelButton?: boolean;
  loading?: boolean;
  disabled?: boolean;
  endpoint?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  title,
  subtitle,
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  showCancelButton = false,
  loading: externalLoading = false,
  disabled = false,
  endpoint,
  method = 'POST',
  onSuccess,
  onError,
}) => {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // API mutation for form submission
  const mutation = useApiMutation(
    endpoint || '',
    method,
    {
      onSuccess: (data) => {
        console.log('[FormBuilder] Form submitted successfully');
        if (onSuccess) onSuccess(data);
      },
      onError: (error) => {
        console.error('[FormBuilder] Form submission failed:', error);
        if (onError) onError(error);
      },
    }
  );

  const loading = externalLoading || mutation.loading;

  // Field value change handler
  const handleFieldChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Field blur handler
  const handleFieldBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, values[name]);
  }, [values]);

  // Validate single field
  const validateField = useCallback((name: string, value: any) => {
    const field = fields.find(f => f.name === name);
    if (!field) return;

    let error = '';

    // Required validation
    if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
      error = `${field.label} is required`;
    }

    // Pattern validation
    if (value && field.validation?.pattern && !field.validation.pattern.test(value)) {
      error = `${field.label} format is invalid`;
    }

    // Length validation
    if (value && typeof value === 'string') {
      if (field.validation?.minLength && value.length < field.validation.minLength) {
        error = `${field.label} must be at least ${field.validation.minLength} characters`;
      }
      if (field.validation?.maxLength && value.length > field.validation.maxLength) {
        error = `${field.label} must be no more than ${field.validation.maxLength} characters`;
      }
    }

    // Numeric validation
    if (value && typeof value === 'number') {
      if (field.validation?.min !== undefined && value < field.validation.min) {
        error = `${field.label} must be at least ${field.validation.min}`;
      }
      if (field.validation?.max !== undefined && value > field.validation.max) {
        error = `${field.label} must be no more than ${field.validation.max}`;
      }
    }

    // Custom validation
    if (value && field.validation?.custom) {
      const customError = field.validation.custom(value);
      if (customError) {
        error = customError;
      }
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  }, [fields]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      if (!shouldShowField(field)) return;

      const error = validateField(field.name, values[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [fields, values, validateField]);

  // Check if field should be shown based on dependencies
  const shouldShowField = useCallback((field: FormFieldConfig) => {
    if (field.hidden) return false;

    if (!field.dependsOn) return true;

    const dependentValue = values[field.dependsOn.field];
    const condition = field.dependsOn.condition || 'equals';

    switch (condition) {
      case 'equals':
        return dependentValue === field.dependsOn.value;
      case 'not-equals':
        return dependentValue !== field.dependsOn.value;
      case 'includes':
        return Array.isArray(dependentValue) && dependentValue.includes(field.dependsOn.value);
      case 'greater-than':
        return dependentValue > field.dependsOn.value;
      case 'less-than':
        return dependentValue < field.dependsOn.value;
      default:
        return true;
    }
  }, [values]);

  // Form submission handler
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Mark all fields as touched
    const newTouched: Record<string, boolean> = {};
    fields.forEach(field => {
      newTouched[field.name] = true;
    });
    setTouched(newTouched);

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(values);
      } else if (endpoint) {
        await mutation.mutate(values);
      }
    } catch (error) {
      console.error('[FormBuilder] Form submission error:', error);
    }
  };

  // Get visible fields
  const visibleFields = fields.filter(shouldShowField);

  return (
    <FormContainer elevation={1}>
      <form onSubmit={handleSubmit}>
        {/* Header */}
        {(title || subtitle) && (
          <FormHeader>
            {title && (
              <Typography variant="h5" component="h2" gutterBottom>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            <Divider sx={{ mt: 2 }} />
          </FormHeader>
        )}

        {/* Error display */}
        {mutation.error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {mutation.error}
          </Alert>
        )}

        {/* Form fields */}
        <Grid container spacing={3}>
          {visibleFields.map((field) => (
            <Grid
              key={field.name}
              size={{
                xs: field.grid?.xs || 12,
                sm: field.grid?.sm || 6,
                md: field.grid?.md || 4,
                lg: field.grid?.lg || 3,
                xl: field.grid?.xl || 2
              }}
            >
              <FormField
                config={field}
                value={values[field.name] || ''}
                error={touched[field.name] ? errors[field.name] : ''}
                onChange={(value) => handleFieldChange(field.name, value)}
                onBlur={() => handleFieldBlur(field.name)}
                disabled={disabled || field.disabled}
              />
            </Grid>
          ))}
        </Grid>

        {/* Actions */}
        <FormActions>
          {showCancelButton && (
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={loading || disabled}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Submitting...' : submitLabel}
          </Button>
        </FormActions>
      </form>
    </FormContainer>
  );
};

export default FormBuilder;