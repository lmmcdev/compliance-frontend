import type { LicenseData, LicenseField } from '../types/license';

/**
 * Extracts fields from license data using flexible path detection
 */
export const extractFields = (data: LicenseData | null): LicenseField[] => {
  if (!data) return [];

  // Try different possible paths for fields
  if (data?.data?.result?.fields) {
    console.log('[Field Extractor] Found fields at data.result.fields');
    return data.data.result.fields;
  }

  if (data?.fields) {
    console.log('[Field Extractor] Found fields at root level');
    return data.fields;
  }

  if (data?.result?.fields) {
    console.log('[Field Extractor] Found fields at result.fields');
    return data.result.fields;
  }

  console.log('[Field Extractor] No fields found in license data');
  return [];
};

/**
 * Filters fields to only include those with valid names
 */
export const getValidFields = (fields: LicenseField[]): LicenseField[] => {
  return fields.filter(field => field?.name && field.name.trim() !== '');
};

/**
 * Gets field count from license data
 */
export const getFieldCount = (data: LicenseData | null): number => {
  const fields = extractFields(data);
  return getValidFields(fields).length;
};

/**
 * Creates editable fields map from license fields
 */
export const createEditableFieldsMap = (fields: LicenseField[]): Record<string, string> => {
  const editableFields: Record<string, string> = {};

  getValidFields(fields).forEach(field => {
    editableFields[field.name] = field.value || '';
  });

  return editableFields;
};

/**
 * Validates field value based on field type
 */
export const validateFieldValue = (field: LicenseField, value: string): { isValid: boolean; error?: string } => {
  if (!value.trim()) {
    return { isValid: false, error: 'Field cannot be empty' };
  }

  // Add type-specific validation
  switch (field.type?.toLowerCase()) {
    case 'date':
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value)) {
        return { isValid: false, error: 'Date must be in YYYY-MM-DD format' };
      }
      break;

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { isValid: false, error: 'Invalid email format' };
      }
      break;

    case 'number':
      if (isNaN(Number(value))) {
        return { isValid: false, error: 'Must be a valid number' };
      }
      break;
  }

  return { isValid: true };
};

/**
 * Gets confidence color for UI display
 */
export const getConfidenceColor = (confidence: number): 'success' | 'warning' | 'error' => {
  if (confidence >= 0.8) return 'success';
  if (confidence >= 0.6) return 'warning';
  return 'error';
};

/**
 * Formats confidence as percentage
 */
export const formatConfidence = (confidence: number): string => {
  return `${Math.round(confidence * 100)}%`;
};