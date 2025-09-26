import { useState, useCallback, useMemo } from 'react';
import type { LicenseData, LicenseField, LicenseFieldEditState } from '../types/license';
import { extractFields, getValidFields, createEditableFieldsMap, validateFieldValue } from '../utils/fieldExtractor';

/**
 * Custom hook for managing license field editing state and operations
 */
export const useLicenseFields = (licenseData: LicenseData | null) => {
  const [editState, setEditState] = useState<LicenseFieldEditState>({
    editableFields: {},
    isEditing: {},
    hasChanges: false,
  });

  // Extract fields from license data
  const fields = useMemo(() => {
    const extractedFields = extractFields(licenseData);
    return getValidFields(extractedFields);
  }, [licenseData]);

  // Initialize editable fields when license data changes
  const initializeFields = useCallback(() => {
    const editableFields = createEditableFieldsMap(fields);
    setEditState({
      editableFields,
      isEditing: {},
      hasChanges: false,
    });
  }, [fields]);

  // Initialize fields when component mounts or license data changes
  useMemo(() => {
    if (fields.length > 0) {
      initializeFields();
    }
  }, [fields, initializeFields]);

  const updateField = useCallback((fieldName: string, value: string) => {
    setEditState(prev => {
      const newEditableFields = {
        ...prev.editableFields,
        [fieldName]: value,
      };

      // Check if there are changes from original values
      const originalField = fields.find(f => f.name === fieldName);
      const hasChanges = Object.keys(newEditableFields).some(name => {
        const original = fields.find(f => f.name === name);
        return original && newEditableFields[name] !== original.value;
      });

      return {
        ...prev,
        editableFields: newEditableFields,
        hasChanges,
      };
    });
  }, [fields]);

  const startEditing = useCallback((fieldName: string) => {
    setEditState(prev => ({
      ...prev,
      isEditing: {
        ...prev.isEditing,
        [fieldName]: true,
      },
    }));
  }, []);

  const stopEditing = useCallback((fieldName: string) => {
    setEditState(prev => ({
      ...prev,
      isEditing: {
        ...prev.isEditing,
        [fieldName]: false,
      },
    }));
  }, []);

  const cancelEdit = useCallback((fieldName: string) => {
    const originalField = fields.find(f => f.name === fieldName);
    if (originalField) {
      setEditState(prev => ({
        ...prev,
        editableFields: {
          ...prev.editableFields,
          [fieldName]: originalField.value || '',
        },
        isEditing: {
          ...prev.isEditing,
          [fieldName]: false,
        },
      }));
    }
  }, [fields]);

  const validateField = useCallback((fieldName: string, value: string) => {
    const field = fields.find(f => f.name === fieldName);
    if (!field) return { isValid: false, error: 'Field not found' };

    return validateFieldValue(field, value);
  }, [fields]);

  const resetFields = useCallback(() => {
    initializeFields();
  }, [initializeFields]);

  const getFieldValue = useCallback((fieldName: string): string => {
    return editState.editableFields[fieldName] || '';
  }, [editState.editableFields]);

  const isFieldEditing = useCallback((fieldName: string): boolean => {
    return editState.isEditing[fieldName] || false;
  }, [editState.isEditing]);

  const getOriginalField = useCallback((fieldName: string): LicenseField | undefined => {
    return fields.find(f => f.name === fieldName);
  }, [fields]);

  return {
    fields,
    editableFields: editState.editableFields,
    isEditing: editState.isEditing,
    hasChanges: editState.hasChanges,
    updateField,
    startEditing,
    stopEditing,
    cancelEdit,
    validateField,
    resetFields,
    getFieldValue,
    isFieldEditing,
    getOriginalField,
  };
};