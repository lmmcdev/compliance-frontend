import React, { useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import FileUpload from '../../common/FileUpload';
import { WizardNavigation } from '../common/WizardNavigation';
import { StepComponentProps } from '../../../types/wizard';

interface DocumentUploadStepProps extends StepComponentProps {
  onUploadComplete: (response: any) => void;
  isUploading?: boolean;
  error?: string | null;
}

export const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
  onUploadComplete,
  onNext,
  onPrevious,
  isUploading = false,
  error,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadCompleted, setUploadCompleted] = useState(false);

  const handleUploadComplete = (response: any) => {
    setUploadCompleted(true);
    onUploadComplete(response);
  };

  const canProceed = uploadCompleted && !isUploading;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
        Upload License Document
      </Typography>

      <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
        Upload your license document to extract and analyze the license information.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <FileUpload
        file={file}
        onFileChange={setFile}
        accept="application/pdf,image/*"
        label="Drop files here or click to select"
        description="Supported formats: PDF, JPG, PNG, JPEG"
        uploading={isUploading}
        showUploadButton={true}
        onUploadComplete={handleUploadComplete}
      />

      <WizardNavigation
        onNext={onNext}
        onPrevious={onPrevious}
        canGoNext={canProceed}
        canGoPrevious={true}
        nextDisabled={!canProceed}
        isLoading={isUploading}
        nextLabel="Review Data"
      />
    </Box>
  );
};