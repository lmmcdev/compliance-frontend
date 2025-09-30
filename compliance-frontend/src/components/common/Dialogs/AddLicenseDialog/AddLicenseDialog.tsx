import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAddLicenseWizard } from '../../../../hooks/useAddLicenseWizard';
import { useDocumentPreview } from '../../../../hooks/useDocumentPreview';
import {
  AccountSelectionStep,
  FileUploadStep,
  ExtractedFieldsStep,
  ConfirmationStep,
} from './WizardSteps';
import { DocumentPreviewPanel } from './DocumentPreview';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    maxWidth: 1400,
    width: '95vw',
    maxHeight: '90vh',
    margin: theme.spacing(2),
  },
}));

const SplitContainer = styled(Box)(() => ({
  display: 'grid',
  gridTemplateColumns: '1fr 500px',
  gap: 24,
  height: '100%',
  minHeight: '500px',
}));

interface AddLicenseDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (licenseData: any) => Promise<void>;
}

const steps = ['Account Selection', 'File Upload', 'Review & Edit', 'Confirmation'];

/**
 * Add License Dialog - Main Container
 * Orchestrates a 4-step wizard for adding licenses with document upload
 *
 * Architecture:
 * - Business logic extracted to useAddLicenseWizard hook
 * - UI split into modular step components
 * - Document preview managed by useDocumentPreview hook
 */
export const AddLicenseDialog: React.FC<AddLicenseDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  // Drag state (local UI state only)
  const [isDragging, setIsDragging] = useState(false);

  // Business logic hook
  const wizard = useAddLicenseWizard({ onSave, onClose });

  // Document preview hook
  const preview = useDocumentPreview(wizard.uploadedFile);

  // Drag and drop handlers
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      wizard.handleFileUpload(file);
    }
  };

  const handleClearFile = () => {
    wizard.reset();
  };

  // Handle close with cleanup
  const handleClose = () => {
    if (!wizard.saving && !wizard.uploading) {
      wizard.reset();
      onClose();
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (wizard.activeStep) {
      case 0:
        return (
          <AccountSelectionStep
            selectedAccount={wizard.selectedAccount}
            onAccountSelect={wizard.handleAccountSelect}
            disabled={wizard.saving}
          />
        );

      case 1:
        return (
          <FileUploadStep
            uploadedFile={wizard.uploadedFile}
            uploading={wizard.uploading}
            isDragging={isDragging}
            onFileSelect={wizard.handleFileUpload}
            onClearFile={handleClearFile}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            disabled={wizard.saving}
          />
        );

      case 2:
        return (
          <ExtractedFieldsStep
            extractedData={wizard.extractedData}
            formData={wizard.formData}
            onFieldChange={wizard.handleFieldChange}
            onSubmit={wizard.handleNext}
            disabled={wizard.saving}
          />
        );

      case 3:
        return (
          <ConfirmationStep
            selectedAccount={wizard.selectedAccount}
            uploadedFile={wizard.uploadedFile}
            formData={wizard.formData}
          />
        );

      default:
        return null;
    }
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth={false}>
      {/* Header */}
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AddIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
              Add License
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Step {wizard.activeStep + 1} of {steps.length}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'text.secondary' }} disabled={wizard.saving || wizard.uploading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Stepper */}
      <Box sx={{ px: 4, pt: 2 }}>
        <Stepper activeStep={wizard.activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Error Display */}
      {wizard.error && (
        <Box sx={{ px: 4, pt: 2 }}>
          <Alert severity="error" onClose={wizard.clearError}>
            {wizard.error}
          </Alert>
        </Box>
      )}

      {/* Content */}
      <DialogContent sx={{ px: 4, py: 3 }}>
        <SplitContainer>
          {/* Left Panel - Step Content */}
          <Box sx={{ overflow: 'auto', pr: 2 }}>
            {renderStepContent()}
          </Box>

          {/* Right Panel - Document Preview */}
          <Box>
            <DocumentPreviewPanel
              file={wizard.uploadedFile}
              previewUrl={preview.previewUrl}
              zoom={preview.zoom}
              fileType={preview.fileType}
              uploading={wizard.uploading}
              onZoomIn={preview.zoomIn}
              onZoomOut={preview.zoomOut}
              onResetZoom={preview.resetZoom}
              canZoomIn={preview.canZoomIn}
              canZoomOut={preview.canZoomOut}
            />
          </Box>
        </SplitContainer>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 4, pb: 3, pt: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={wizard.saving || wizard.uploading}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Cancel
        </Button>
        <Box sx={{ flex: 1 }} />
        {wizard.canGoBack && (
          <Button
            onClick={wizard.handleBack}
            variant="outlined"
            disabled={wizard.saving || wizard.uploading}
            startIcon={<BackIcon />}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Back
          </Button>
        )}
        {wizard.canGoNext ? (
          <Button
            onClick={wizard.handleNext}
            variant="contained"
            disabled={wizard.uploading}
            endIcon={<NextIcon />}
            sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
          >
            {wizard.uploading ? 'Processing...' : 'Next'}
          </Button>
        ) : (
          <Button
            onClick={wizard.handleSave}
            variant="contained"
            disabled={wizard.saving}
            startIcon={wizard.saving ? <CircularProgress size={16} /> : <CheckIcon />}
            sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
          >
            {wizard.saving ? 'Saving...' : 'Confirm & Add'}
          </Button>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default AddLicenseDialog;
