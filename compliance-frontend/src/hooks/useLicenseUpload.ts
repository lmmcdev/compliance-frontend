import { useState, useCallback } from 'react';
import type { LicenseUploadState, LicenseData } from '../types/license';
import { fileUploadService } from '../services/fileUploadService';
import { parseLicenseResponse, validateLicenseData } from '../utils/licenseDataParser';

/**
 * Custom hook for managing license file upload state and operations
 */
export const useLicenseUpload = () => {
  const [state, setState] = useState<LicenseUploadState>({
    isUploading: false,
    uploadProgress: 0,
    error: null,
    data: null,
    file: null,
  });

  const uploadFile = useCallback(async (file: File): Promise<LicenseData> => {
    console.log('[License Upload Hook] Starting upload for:', file.name);

    setState(prev => ({
      ...prev,
      isUploading: true,
      uploadProgress: 0,
      error: null,
      file,
    }));

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          uploadProgress: Math.min(prev.uploadProgress + 10, 90),
        }));
      }, 200);

      const response = await fileUploadService.uploadLicenseDocument(file);
      clearInterval(progressInterval);

      console.log('[License Upload Hook] Upload response:', response);

      const licenseData = parseLicenseResponse(response);
      const validation = validateLicenseData(licenseData);

      if (!validation.isValid) {
        throw new Error(`Invalid license data: ${validation.errors.join(', ')}`);
      }

      setState(prev => ({
        ...prev,
        isUploading: false,
        uploadProgress: 100,
        data: licenseData,
        error: null,
      }));

      console.log('[License Upload Hook] Upload completed successfully');
      return licenseData;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      console.error('[License Upload Hook] Upload failed:', errorMessage);

      setState(prev => ({
        ...prev,
        isUploading: false,
        uploadProgress: 0,
        error: errorMessage,
      }));

      throw error;
    }
  }, []);

  const resetUpload = useCallback(() => {
    setState({
      isUploading: false,
      uploadProgress: 0,
      error: null,
      data: null,
      file: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    uploadFile,
    resetUpload,
    clearError,
  };
};