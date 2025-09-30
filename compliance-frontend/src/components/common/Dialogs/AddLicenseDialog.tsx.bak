import React, { useState, useEffect } from 'react';
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
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Fade,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  Check as CheckIcon,
  CloudUpload as UploadIcon,
  Visibility as PreviewIcon,
  Description as DocumentIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FullscreenOutlined as FullscreenIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { AccountSelection } from '../Inputs/AccountSelection';
import { ExtractedFieldsForm } from '../Forms/ExtractedFieldsForm';
import { fileUploadService } from '../../../services/fileUploadService';
import type { Account } from '../../../services/accountsService';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    maxWidth: 1400,
    width: '95vw',
    maxHeight: '90vh',
    margin: theme.spacing(2),
  },
}));

const StepContent = styled(Box)(() => ({
  minHeight: 400,
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
}));

const ReviewPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.grey[50],
}));

const FileUploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
  '&.dragging': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.selected,
  },
}));

const DocumentPreviewPanel = styled(Paper)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
}));

const PreviewHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const PreviewContainer = styled(Box)(() => ({
  flex: 1,
  overflow: 'auto',
  position: 'relative',
  backgroundColor: '#1e293b',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::-webkit-scrollbar': {
    width: 8,
    height: 8,
  },
  '&::-webkit-scrollbar-track': {
    background: '#0f172a',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#475569',
    borderRadius: 4,
    '&:hover': {
      background: '#64748b',
    },
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

export const AddLicenseDialog: React.FC<AddLicenseDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>('');
  const [zoom, setZoom] = useState(100);

  // Cleanup file preview URL on unmount
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const handleNext = () => {
    if (activeStep === 0 && !selectedAccount) {
      setError('Please select an account to continue');
      return;
    }
    if (activeStep === 1 && !uploadedFile) {
      setError('Please upload a file to continue');
      return;
    }
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
    setError('');
  };

  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    setError('');

    // Generate preview URL
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);

    setUploading(true);

    try {
      const response = await fileUploadService.uploadFile(file);

      console.log('[AddLicenseDialog] Upload response:', response);

      // Extract data from webhook response with proper nested structure
      // Expected format: { success: true, data: { result: [{}], analyzeResult: { modelId, apiVersion, documentsCount } } }
      if (response.webhookResponse) {
        const webhookData = response.webhookResponse;

        // Check for nested data structure
        let extractedFields = null;
        let analyzeResult = null;
        let documentType = 'Unknown';

        // Extract analyzeResult metadata
        if (webhookData.data?.analyzeResult) {
          analyzeResult = webhookData.data.analyzeResult;
          // Use modelId as the document type
          documentType = analyzeResult.modelId || documentType;
          console.log('[AddLicenseDialog] Analyze Result:', analyzeResult);
        }

        // Extract fields from result array
        if (webhookData.data?.result && Array.isArray(webhookData.data.result)) {
          // Format: { success: true, data: { result: [{ fields: [...] }], analyzeResult: {...} } }
          const resultData = webhookData.data.result[0] || {};
          extractedFields = resultData.fields || resultData;

          setExtractedData({
            fields: extractedFields,
            success: webhookData.success,
            licenseType: documentType,
            documentType: documentType,
            confidence: resultData.confidence || 0,
            metadata: {
              ...resultData.metadata,
              analyzeResult: analyzeResult,
              modelId: analyzeResult?.modelId,
              apiVersion: analyzeResult?.apiVersion,
              documentsCount: analyzeResult?.documentsCount,
            },
          });
        } else if (webhookData.data?.result?.fields) {
          // Alternative format: { success: true, data: { result: { fields: [...] }, analyzeResult: {...} } }
          extractedFields = webhookData.data.result.fields;
          setExtractedData({
            fields: extractedFields,
            success: webhookData.success,
            licenseType: documentType,
            documentType: documentType,
            confidence: webhookData.data.result.confidence || 0,
            metadata: {
              ...webhookData.data.result.metadata,
              analyzeResult: analyzeResult,
              modelId: analyzeResult?.modelId,
              apiVersion: analyzeResult?.apiVersion,
              documentsCount: analyzeResult?.documentsCount,
            },
          });
        } else if (webhookData.result?.fields) {
          // Alternative format: { result: { fields: [...] } }
          extractedFields = webhookData.result.fields;
          setExtractedData({
            fields: extractedFields,
            success: true,
            licenseType: webhookData.result.licenseType || webhookData.result.documentType || documentType,
            documentType: documentType,
            confidence: webhookData.result.confidence || 0,
            metadata: webhookData.result.metadata || {},
          });
        } else if (webhookData.fields) {
          // Direct format: { fields: [...] }
          extractedFields = webhookData.fields;
          setExtractedData({
            fields: extractedFields,
            success: true,
            licenseType: webhookData.licenseType || webhookData.documentType || documentType,
            documentType: documentType,
            confidence: webhookData.confidence || 0,
            metadata: webhookData.metadata || {},
          });
        } else {
          console.warn('[AddLicenseDialog] No fields found in response structure');
          setExtractedData(webhookData);
        }

        // Initialize form data with extracted field values
        const initialFormData: Record<string, any> = {};
        if (extractedFields && Array.isArray(extractedFields)) {
          extractedFields.forEach((field: any) => {
            initialFormData[field.name] = field.value || '';
          });
        }
        setFormData(initialFormData);

        console.log('[AddLicenseDialog] Extracted fields:', extractedFields);
        console.log('[AddLicenseDialog] Initial form data:', initialFormData);
      }
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      console.error('File upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

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
      handleFileSelect(file);
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const licenseData = {
        accountId: selectedAccount?.id,
        accountName: selectedAccount?.name,
        fileName: uploadedFile?.name,
        ...formData,
      };

      if (onSave) {
        await onSave(licenseData);
      }
      handleClose();
    } catch (err) {
      setError('Failed to save license. Please try again.');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving && !uploading) {
      // Cleanup preview URL
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
      setActiveStep(0);
      setSelectedAccount(null);
      setUploadedFile(null);
      setExtractedData(null);
      setFormData({});
      setError('');
      setIsDragging(false);
      setFilePreviewUrl('');
      setZoom(100);
      onClose();
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleZoomReset = () => {
    setZoom(100);
  };

  const renderDocumentPreview = () => {
    if (!uploadedFile || !filePreviewUrl) {
      return (
        <DocumentPreviewPanel elevation={0}>
          <PreviewHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PreviewIcon sx={{ color: '#64748b' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                Document Preview
              </Typography>
            </Box>
          </PreviewHeader>
          <PreviewContainer>
            <Box sx={{ textAlign: 'center', color: '#94a3b8' }}>
              <DocumentIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="body1">No document uploaded</Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                Upload a document to see the preview
              </Typography>
            </Box>
          </PreviewContainer>
        </DocumentPreviewPanel>
      );
    }

    const isPDF = uploadedFile.type === 'application/pdf';
    const isImage = uploadedFile.type.startsWith('image/');

    return (
      <Fade in={!!uploadedFile}>
        <DocumentPreviewPanel elevation={0}>
          <PreviewHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PreviewIcon sx={{ color: '#10b981' }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  {uploadedFile.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.type || 'Unknown type'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {isImage && (
                <>
                  <Chip
                    label={`${zoom}%`}
                    size="small"
                    sx={{ fontWeight: 600, minWidth: 60 }}
                  />
                  <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 50}>
                    <ZoomOutIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={handleZoomReset}>
                    <FullscreenIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 200}>
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
          </PreviewHeader>
          <PreviewContainer>
            {uploading ? (
              <Box sx={{ textAlign: 'center', color: '#94a3b8' }}>
                <CircularProgress size={48} sx={{ mb: 2 }} />
                <Typography variant="body1">Processing document...</Typography>
              </Box>
            ) : isPDF ? (
              <iframe
                src={filePreviewUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  backgroundColor: '#ffffff',
                }}
                title="PDF Preview"
              />
            ) : isImage ? (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                }}
              >
                <img
                  src={filePreviewUrl}
                  alt="Document preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    transform: `scale(${zoom / 100})`,
                    transition: 'transform 0.3s ease',
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', color: '#94a3b8' }}>
                <DocumentIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                <Typography variant="body1">Preview not available</Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                  This file type cannot be previewed
                </Typography>
              </Box>
            )}
          </PreviewContainer>
        </DocumentPreviewPanel>
      </Fade>
    );
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <StepContent>
            <AccountSelection
              selectedAccount={selectedAccount}
              onAccountSelect={handleAccountSelect}
              disabled={false}
            />
          </StepContent>
        );

      case 1:
        return (
          <StepContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Upload License Documento
            </Typography>

            <input
              type="file"
              id="file-upload-input"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
              accept=".pdf,.jpg,.jpeg,.png"
              disabled={uploading}
            />

            <label htmlFor="file-upload-input">
              <FileUploadBox
                className={isDragging ? 'dragging' : ''}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {uploading ? (
                  <Box>
                    <CircularProgress size={48} sx={{ mb: 2 }} />
                    <Typography variant="body1">Uploading and processing...</Typography>
                  </Box>
                ) : uploadedFile ? (
                  <Box>
                    <CheckIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      {uploadedFile.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      File uploaded successfully
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 2 }}
                      onClick={(e) => {
                        e.preventDefault();
                        setUploadedFile(null);
                        setExtractedData(null);
                      }}
                    >
                      Change File
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <UploadIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Drag & drop your file here
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      or click to browse
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Supported formats: PDF, JPG, PNG
                    </Typography>
                  </Box>
                )}
              </FileUploadBox>
            </label>
          </StepContent>
        );

      case 2:
        return (
          <StepContent>
            {extractedData && extractedData.fields ? (
              <ExtractedFieldsForm
                fields={extractedData.fields}
                metadata={{
                  licenseType: extractedData.licenseType || 'Unknown',
                  confidence: extractedData.confidence || 0,
                }}
                initialValues={formData}
                onFieldChange={handleFieldChange}
                onSubmit={handleNext}
                loading={false}
                disabled={false}
              />
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Review Extracted Information
                </Typography>
                <Alert severity="info">
                  No fields were extracted from the document. You can still proceed to create the license manually.
                </Alert>
              </Box>
            )}
          </StepContent>
        );

      case 3:
        return (
          <StepContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Review & Confirm
            </Typography>
            <ReviewPaper elevation={0}>
              <List disablePadding>
                <ListItem disableGutters>
                  <ListItemText
                    primary="Account"
                    secondary={selectedAccount?.name || 'N/A'}
                    primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'h6', color: 'text.primary' }}
                  />
                </ListItem>
                <Divider sx={{ my: 2 }} />
                <ListItem disableGutters>
                  <ListItemText
                    primary="Uploaded File"
                    secondary={uploadedFile?.name || 'N/A'}
                    primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'h6', color: 'text.primary' }}
                  />
                </ListItem>
                <Divider sx={{ my: 2 }} />
                {Object.keys(formData).length > 0 && (
                  <>
                    <ListItem disableGutters>
                      <ListItemText
                        primary="Extracted Fields"
                        secondary={`${Object.keys(formData).length} fields extracted`}
                        primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                      />
                    </ListItem>
                    <Box sx={{ mt: 2, pl: 2 }}>
                      {Object.entries(formData).map(([key, value]) => (
                        <Typography key={key} variant="body2" sx={{ mb: 1 }}>
                          <strong>{key}:</strong> {String(value)}
                        </Typography>
                      ))}
                    </Box>
                  </>
                )}
              </List>
            </ReviewPaper>
          </StepContent>
        );

      default:
        return null;
    }
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth={false}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AddIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
              Add License Type
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Step {activeStep + 1} of {steps.length}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'text.secondary' }} disabled={saving || uploading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 4, pt: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {error && (
        <Box sx={{ px: 4, pt: 2 }}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Box>
      )}

      <DialogContent sx={{ px: 4, py: 3 }}>
        <SplitContainer>
          {/* Left Panel - Wizard Steps */}
          <Box sx={{ overflow: 'auto', pr: 2 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Right Panel - Document Preview */}
          <Box>
            {renderDocumentPreview()}
          </Box>
        </SplitContainer>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3, pt: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={saving || uploading}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Cancel
        </Button>
        <Box sx={{ flex: 1 }} />
        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            variant="outlined"
            disabled={saving || uploading}
            startIcon={<BackIcon />}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={uploading}
            endIcon={<NextIcon />}
            sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
          >
            {uploading ? 'Processing...' : 'Next'}
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : <CheckIcon />}
            sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
          >
            {saving ? 'Saving...' : 'Confirm & Add'}
          </Button>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default AddLicenseDialog;
