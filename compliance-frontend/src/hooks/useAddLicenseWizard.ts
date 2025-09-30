import { useState, useCallback } from 'react';
import { fileUploadService } from '../services/fileUploadService';
import { licenseExtractionService } from '../services/licenseExtractionService';
import type { Account } from '../services/accountsService';

interface ExtractedData {
  fields: any[];
  success: boolean;
  licenseType?: string;
  documentType?: string;
  confidence?: number;
  metadata?: any;
}

interface WizardState {
  activeStep: number;
  selectedAccount: Account | null;
  uploadedFile: File | null;
  extractedData: ExtractedData | null;
  formData: Record<string, any>;
  uploading: boolean;
  saving: boolean;
  error: string;
}

interface UseAddLicenseWizardProps {
  onSave?: (licenseData: any) => Promise<void>;
  onClose?: () => void;
}

/**
 * Custom hook for managing Add License wizard flow
 * Handles all business logic for the 4-step wizard:
 * 1. Account Selection
 * 2. File Upload
 * 3. Review & Edit Extracted Fields
 * 4. Confirmation
 */
export const useAddLicenseWizard = ({
  onSave,
  onClose,
}: UseAddLicenseWizardProps = {}) => {
  const [state, setState] = useState<WizardState>({
    activeStep: 0,
    selectedAccount: null,
    uploadedFile: null,
    extractedData: null,
    formData: {},
    uploading: false,
    saving: false,
    error: '',
  });

  // Navigation
  const handleNext = useCallback(() => {
    // Validate before proceeding
    if (state.activeStep === 0 && !state.selectedAccount) {
      setState(prev => ({ ...prev, error: 'Please select an account to continue' }));
      return;
    }
    if (state.activeStep === 1 && !state.uploadedFile) {
      setState(prev => ({ ...prev, error: 'Please upload a file to continue' }));
      return;
    }

    setState(prev => ({
      ...prev,
      activeStep: prev.activeStep + 1,
      error: '',
    }));
  }, [state.activeStep, state.selectedAccount, state.uploadedFile]);

  const handleBack = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeStep: Math.max(0, prev.activeStep - 1),
      error: '',
    }));
  }, []);

  // Account selection
  const handleAccountSelect = useCallback((account: Account) => {
    setState(prev => ({
      ...prev,
      selectedAccount: account,
      error: '',
    }));
  }, []);

  // File upload and extraction
  const handleFileUpload = useCallback(async (file: File) => {
    setState(prev => ({
      ...prev,
      uploadedFile: file,
      uploading: true,
      error: '',
    }));

    try {
      const response = await fileUploadService.uploadFile(file);
      console.log('[useAddLicenseWizard] Upload response:', response);
      console.log('[useAddLicenseWizard] Webhook response:', response.webhookResponse);

      // Extract data from webhook response using the extraction service
      if (response.webhookResponse) {
        const webhookData = response.webhookResponse;
        console.log('[useAddLicenseWizard] Raw webhook data:', JSON.stringify(webhookData, null, 2));

        // Use the extraction service to parse the response
        const parsedData = licenseExtractionService.parseExtractionResponse(webhookData);
        console.log('[useAddLicenseWizard] Parsed extraction data:', parsedData);

        // Check if extraction was successful and has fields
        if (parsedData.success && parsedData.fields && parsedData.fields.length > 0) {
          const extracted: ExtractedData = {
            fields: parsedData.fields,
            success: parsedData.success,
            licenseType: parsedData.documentType,
            documentType: parsedData.documentType,
            confidence: parsedData.confidence || 0,
            metadata: parsedData.metadata,
          };

          // Initialize form data from extracted fields
          const initialFormData = licenseExtractionService.fieldsToFormData(parsedData.fields);

          setState(prev => ({
            ...prev,
            extractedData: extracted,
            formData: initialFormData,
            uploading: false,
          }));

          console.log('[useAddLicenseWizard] Successfully extracted data with', parsedData.fields.length, 'fields');
        } else {
          console.warn('[useAddLicenseWizard] No fields found in parsed response:', parsedData);
          console.warn('[useAddLicenseWizard] Validation:', licenseExtractionService.validateExtractedData(parsedData));
          setState(prev => ({
            ...prev,
            uploading: false,
            error: 'No data could be extracted from the document',
          }));
        }
      } else {
        console.warn('[useAddLicenseWizard] No webhook response received');
        setState(prev => ({
          ...prev,
          uploading: false,
          error: 'No response received from document analysis',
        }));
      }
    } catch (err) {
      console.error('[useAddLicenseWizard] Upload error:', err);
      setState(prev => ({
        ...prev,
        uploading: false,
        error: 'Failed to upload file. Please try again.',
      }));
    }
  }, []);

  // Form field changes
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [fieldName]: value,
      },
    }));
  }, []);

  // Save license
  const handleSave = useCallback(async () => {
    setState(prev => ({ ...prev, saving: true, error: '' }));

    try {
      const licenseData = {
        accountId: state.selectedAccount?.id,
        accountName: state.selectedAccount?.name,
        fileName: state.uploadedFile?.name,
        ...state.formData,
      };

      if (onSave) {
        await onSave(licenseData);
      }

      // Success - trigger close via callback
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('[useAddLicenseWizard] Save error:', err);
      setState(prev => ({
        ...prev,
        saving: false,
        error: 'Failed to save license. Please try again.',
      }));
    }
  }, [state.selectedAccount, state.uploadedFile, state.formData, onSave, onClose]);

  // Reset wizard
  const reset = useCallback(() => {
    setState({
      activeStep: 0,
      selectedAccount: null,
      uploadedFile: null,
      extractedData: null,
      formData: {},
      uploading: false,
      saving: false,
      error: '',
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: '' }));
  }, []);

  return {
    // State
    activeStep: state.activeStep,
    selectedAccount: state.selectedAccount,
    uploadedFile: state.uploadedFile,
    extractedData: state.extractedData,
    formData: state.formData,
    uploading: state.uploading,
    saving: state.saving,
    error: state.error,

    // Navigation
    handleNext,
    handleBack,
    canGoNext: state.activeStep < 3,
    canGoBack: state.activeStep > 0,
    isFirstStep: state.activeStep === 0,
    isLastStep: state.activeStep === 3,

    // Actions
    handleAccountSelect,
    handleFileUpload,
    handleFieldChange,
    handleSave,
    reset,
    clearError,
  };
};
