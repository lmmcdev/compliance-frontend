import React, { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Grid,
  TextField,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Check as CheckIcon,
  AccountBox as AccountIcon,
  Description as FileIcon,
  Edit as FormIcon,
  Save as SaveIcon,
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import AccountSelection from '../AccountSelection';
import FileUpload from '../FileUpload';
import { fileUploadService } from '../../../services/fileUploadService';
import { licenseService } from '../../../services/licenseService';
import type { Account } from '../../../services/accountsService';

const WideDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    maxWidth: 1000,
    width: '95vw',
    height: '90vh',
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
  },
}));

const StepContent = styled(Box)(() => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  overflow: 'hidden',
}));

const StepContainer = styled(Box)(() => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  padding: '0 8px',
}));

const StepperContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: 12,
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
}));

interface UploadLicenseWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (licenseData: any) => void;
}

interface WizardState {
  selectedAccount: Account | null;
  uploadedFile: File | null;
  tempUploadResponse: any;
  formData: Record<string, any>;
  finalLicenseData: any;
}

interface ExtractedField {
  name: string;
  value: string | number;
  confidence: number;
  type: 'string' | 'number' | 'date' | 'email' | 'phone' | 'address';
}

interface TempUploadResponse {
  success: boolean;
  data: {
    result: {
      fields: ExtractedField[];
    };
    licenseType?: string;
    metadata?: {
      documentType?: string;
      processingTime?: number;
      confidence?: number;
    };
  };
}

const steps = [
  { label: 'Select Account (Optional)', icon: AccountIcon },
  { label: 'Upload File', icon: FileIcon },
  { label: 'Review & Edit', icon: FormIcon },
  { label: 'Save License', icon: SaveIcon },
];

export const UploadLicenseWizard: React.FC<UploadLicenseWizardProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wizardState, setWizardState] = useState<WizardState>({
    selectedAccount: null,
    uploadedFile: null,
    tempUploadResponse: null,
    formData: {},
    finalLicenseData: null,
  });

  // Extract fields from the nested response format
  const extractedFields: ExtractedField[] = useMemo(() => {
    return wizardState.tempUploadResponse?.data?.result?.fields || [];
  }, [wizardState.tempUploadResponse]);

  // Get confidence level info
  const getConfidenceInfo = (confidence: number) => {
    if (confidence >= 0.9) {
      return { label: 'High Confidence', color: 'success' as const, icon: VerifiedIcon };
    } else if (confidence >= 0.7) {
      return { label: 'Medium Confidence', color: 'warning' as const, icon: WarningIcon };
    } else {
      return { label: 'Low Confidence', color: 'error' as const, icon: WarningIcon };
    }
  };

  // Format field label for display
  const formatFieldLabel = (name: string): string => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const resetWizard = useCallback(() => {
    setActiveStep(0);
    setLoading(false);
    setError(null);
    setWizardState({
      selectedAccount: null,
      uploadedFile: null,
      tempUploadResponse: null,
      formData: {},
      finalLicenseData: null,
    });
  }, []);

  const handleClose = useCallback(() => {
    if (loading) return;
    resetWizard();
    onClose();
  }, [loading, resetWizard, onClose]);

  // Step 1: Account Selection
  const handleAccountSelect = useCallback((account: Account) => {
    setWizardState(prev => ({ ...prev, selectedAccount: account }));
    setError(null);
  }, []);

  const handleStep1Next = useCallback(() => {
    // Account selection is optional, so we can proceed without an account
    setError(null);
    setActiveStep(1);
  }, []);

  const handleSkipAccountSelection = useCallback(() => {
    setError(null);
    setActiveStep(1);
  }, []);

  // Step 2: File Upload
  const handleFileUpload = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      console.log('[Upload Wizard] Starting file upload for:', file.name);

      // Upload to temp endpoint
      const uploadResponse = await fileUploadService.uploadFile(file);
      console.log('[Upload Wizard] Upload response:', uploadResponse);

      // Extract the temp upload response in the expected format
      const tempResponse: TempUploadResponse = uploadResponse.webhookResponse || {
        success: true,
        data: {
          result: {
            fields: [
              { name: 'licenseNumber', value: '', confidence: 0, type: 'string' },
              { name: 'issuer', value: '', confidence: 0, type: 'string' },
              { name: 'issueDate', value: '', confidence: 0, type: 'date' },
              { name: 'expirationDate', value: '', confidence: 0, type: 'date' },
            ],
          },
          licenseType: 'general',
          metadata: {
            documentType: 'license',
            processingTime: 0,
            confidence: 0,
          },
        },
      };

      // Build initial form data from extracted fields
      const initialFormData: Record<string, any> = {};
      if (tempResponse.data?.result?.fields) {
        tempResponse.data.result.fields.forEach((field) => {
          initialFormData[field.name] = field.value || '';
        });
      }

      setWizardState(prev => ({
        ...prev,
        uploadedFile: file,
        tempUploadResponse: tempResponse,
        formData: initialFormData,
      }));

      setActiveStep(2);
    } catch (error) {
      console.error('[Upload Wizard] File upload failed:', error);
      setError(error instanceof Error ? error.message : 'File upload failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Step 3: Handle field value changes
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setWizardState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [fieldName]: value,
      },
    }));
  }, []);

  // Step 3: Continue to final step
  const handleContinueToSave = useCallback(() => {
    setActiveStep(3);
  }, []);

  // Step 4: Final Save
  const handleFinalSave = useCallback(async () => {
    if (!wizardState.uploadedFile) {
      setError('Missing uploaded file for license creation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare license data for creation with optional account
      const licenseData: any = {
        fileName: wizardState.uploadedFile.name,
        fileType: wizardState.uploadedFile.type,
        licenseType: wizardState.tempUploadResponse?.data?.licenseType || 'general',
        extractedData: wizardState.formData,
        uploadedAt: new Date().toISOString(),
        status: 'processed',
      };

      // Include account data if an account was selected
      if (wizardState.selectedAccount) {
        licenseData.accountId = wizardState.selectedAccount.id;
        licenseData.accountData = {
          id: wizardState.selectedAccount.id,
          accountNumber: wizardState.selectedAccount.accountNumber,
          name: wizardState.selectedAccount.name,
          type: wizardState.selectedAccount.type,
          phone: wizardState.selectedAccount.phone,
          inHouse: wizardState.selectedAccount.inHouse,
        };
      }

      console.log('[Upload Wizard] Creating license with data:', licenseData);

      // Save the license using the license service
      const savedLicense = await licenseService.createLicense(licenseData as any);

      setWizardState(prev => ({ ...prev, finalLicenseData: savedLicense }));

      // Call success callback
      if (onSuccess) {
        onSuccess(savedLicense);
      }

      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('[Upload Wizard] Failed to save license:', error);
      setError(error instanceof Error ? error.message : 'Failed to save license');
    } finally {
      setLoading(false);
    }
  }, [wizardState, onSuccess, handleClose]);

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <StepContainer>
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Account Selection (Optional):</strong> You can select an account to associate with this license, or skip this step to upload without account association.
            </Alert>
            <AccountSelection
              selectedAccount={wizardState.selectedAccount}
              onAccountSelect={handleAccountSelect}
              disabled={loading}
            />
          </StepContainer>
        );

      case 1:
        return (
          <StepContainer>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Upload License Document
            </Typography>
            {wizardState.selectedAccount ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                <strong>Selected Account:</strong> {wizardState.selectedAccount.name} (#{wizardState.selectedAccount.accountNumber})
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <strong>No Account Selected:</strong> License will be uploaded without account association
              </Alert>
            )}
            <FileUpload
              file={wizardState.uploadedFile}
              onFileChange={(file) => {
                if (file) {
                  handleFileUpload(file);
                }
              }}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              label="Upload license document for processing"
              description="Supported formats: PDF, DOC, DOCX, JPG, PNG, JPEG"
              uploading={loading}
              disabled={loading}
              showUploadButton={false}
            />
          </StepContainer>
        );

      case 2:
        return (
          <StepContainer>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Review & Edit Extracted Information
            </Typography>

            {/* Metadata Section */}
            {wizardState.tempUploadResponse?.data && (
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  mb: 3,
                  bgcolor: 'primary.50',
                  border: '1px solid',
                  borderColor: 'primary.200',
                  borderRadius: 2,
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FileIcon color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Document Type
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {wizardState.tempUploadResponse.data.licenseType ||
                           wizardState.tempUploadResponse.data.metadata?.documentType ||
                           'General License'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InfoIcon color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Fields Extracted
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {extractedFields.length} fields
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  {wizardState.tempUploadResponse.data.metadata?.confidence !== undefined && (
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VerifiedIcon color="success" />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Overall Confidence
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={wizardState.tempUploadResponse.data.metadata.confidence * 100}
                              sx={{ flex: 1, height: 6, borderRadius: 3 }}
                              color={
                                wizardState.tempUploadResponse.data.metadata.confidence >= 0.9
                                  ? 'success'
                                  : wizardState.tempUploadResponse.data.metadata.confidence >= 0.7
                                  ? 'warning'
                                  : 'error'
                              }
                            />
                            <Typography variant="body2" fontWeight={600}>
                              {Math.round(wizardState.tempUploadResponse.data.metadata.confidence * 100)}%
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}

            {/* Instructions Alert */}
            <Alert severity="info" sx={{ mb: 3 }}>
              Review the automatically extracted information below. You can edit any field if needed.
              Fields with high confidence (green) are likely accurate, while those with lower confidence (yellow/red) should be verified.
            </Alert>

            {/* Dynamic Form Fields */}
            {extractedFields.length > 0 ? (
              <Box component="form" noValidate>
                <Grid container spacing={3}>
                  {extractedFields.map((field, index) => {
                    const confidenceInfo = getConfidenceInfo(field.confidence);
                    const ConfidenceIcon = confidenceInfo.icon;
                    const fieldLabel = formatFieldLabel(field.name);

                    return (
                      <Grid item xs={12} md={6} key={field.name}>
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
                          {/* Field Header with Confidence */}
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

                          {/* Confidence Bar */}
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

                          {/* Input Field */}
                          <TextField
                            fullWidth
                            name={field.name}
                            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                            value={wizardState.formData[field.name] ?? field.value ?? ''}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={`Enter ${fieldLabel.toLowerCase()}`}
                            variant="outlined"
                            size="small"
                            InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                bgcolor: 'background.paper',
                              },
                            }}
                          />

                          {/* Extracted Value Info */}
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
                      </Grid>
                    );
                  })}
                </Grid>

                {/* Continue Button */}
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleContinueToSave}
                    disabled={loading}
                    startIcon={<CheckIcon />}
                    sx={{ minWidth: 200 }}
                  >
                    Continue to Save
                  </Button>
                </Box>
              </Box>
            ) : (
              <Alert severity="warning">
                No fields were extracted from the uploaded document. Please try uploading a different file or contact support.
              </Alert>
            )}
          </StepContainer>
        );

      case 3:
        return (
          <StepContainer>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              {loading ? (
                <>
                  <CircularProgress size={64} sx={{ mb: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Saving License...
                  </Typography>
                  <Typography color="text.secondary">
                    Please wait while we process and save your license information.
                  </Typography>
                </>
              ) : wizardState.finalLicenseData ? (
                <>
                  <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    License Saved Successfully!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    The license has been processed and saved to the system.
                  </Typography>
                  <Paper sx={{ p: 3, bgcolor: 'grey.50', maxWidth: 500, mx: 'auto' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      License Summary
                    </Typography>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Account:</strong> {wizardState.selectedAccount?.name}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>File:</strong> {wizardState.uploadedFile?.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>License ID:</strong> {wizardState.finalLicenseData.id}
                      </Typography>
                    </Box>
                  </Paper>
                </>
              ) : (
                <>
                  <Typography variant="h6" gutterBottom>
                    Ready to Save License
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Click "Save License" to complete the process.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleFinalSave}
                    disabled={loading}
                    startIcon={<SaveIcon />}
                    sx={{ minWidth: 200 }}
                  >
                    Save License
                  </Button>
                </>
              )}
            </Box>
          </StepContainer>
        );

      default:
        return null;
    }
  };

  const canGoNext = () => {
    switch (activeStep) {
      case 0:
        return true; // Account selection is optional, always allow proceeding
      case 1:
        return !!wizardState.tempUploadResponse;
      case 2:
        return Object.keys(wizardState.formData).length > 0;
      default:
        return false;
    }
  };

  const canGoBack = () => {
    return activeStep > 0 && !loading && !wizardState.finalLicenseData;
  };

  return (
    <WideDialog open={open} onClose={handleClose} maxWidth={false}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <UploadIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
              Upload License Document
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Step-by-step license upload and processing wizard
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, p: 3 }}>
        {/* Progress Stepper */}
        <StepperContainer elevation={1}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <Step key={step.label}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: index <= activeStep ? 'primary.main' : 'grey.300',
                          color: index <= activeStep ? 'white' : 'grey.600',
                        }}
                      >
                        <StepIcon fontSize="small" />
                      </Box>
                    )}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </StepperContainer>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <StepContent>{renderStepContent()}</StepContent>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
        >
          {wizardState.finalLicenseData ? 'Close' : 'Cancel'}
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {canGoBack() && (
            <Button
              onClick={() => setActiveStep(prev => prev - 1)}
              disabled={loading}
            >
              Back
            </Button>
          )}

          {activeStep === 0 && (
            <>
              {!wizardState.selectedAccount && (
                <Button
                  variant="outlined"
                  onClick={handleSkipAccountSelection}
                  disabled={loading}
                  sx={{ mr: 1 }}
                >
                  Skip & Upload File
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleStep1Next}
                disabled={!canGoNext() || loading}
              >
                {wizardState.selectedAccount ? 'Next: Upload File' : 'Select Account & Continue'}
              </Button>
            </>
          )}
        </Box>
      </DialogActions>
    </WideDialog>
  );
};

export default UploadLicenseWizard;