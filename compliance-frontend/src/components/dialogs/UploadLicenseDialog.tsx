import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Container,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import FileUpload from '../common/FileUpload';

interface LicenseField {
  name: string;
  value: string;
  confidence: number;
  type: string;
  editable?: boolean;
}

interface LicenseData {
  success: boolean;
  data: {
    result: {
      fields: LicenseField[];
      content: string;
      pages: number;
    };
    analyzeResult: {
      modelId: string;
      apiVersion: string;
      documentsCount: number;
    };
    timestamp: string;
  };
  meta: {
    traceId: string;
  };
}


interface UploadLicenseDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (licenseData: any) => void;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    maxHeight: '90vh',
    width: '100%',
    maxWidth: 1200,
    margin: theme.spacing(2),
  },
}));

const FieldCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: '1px solid #e0e0e0',
  borderRadius: 12,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
}));

const ConfidenceChip = styled(Chip)<{ confidence: number }>(({ confidence }) => ({
  fontSize: '0.75rem',
  height: 24,
  backgroundColor: confidence >= 0.9 ? '#4caf50' : confidence >= 0.7 ? '#ff9800' : '#f44336',
  color: 'white',
  fontWeight: 600,
}));

const StepperContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  padding: theme.spacing(2),
  borderRadius: 12,
  marginBottom: theme.spacing(3),
}));

const UploadLicenseDialog: React.FC<UploadLicenseDialogProps> = ({ open, onClose, onSave }) => {
  const [file, setFile] = useState<File | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null);
  const [editableFields, setEditableFields] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const steps = ['Upload Document', 'Review Data', 'Save License'];

  const handleUploadComplete = (response: any) => {
    if (response.webhookResponse) {
      setLicenseData(response.webhookResponse);
      const initialFields: Record<string, string> = {};
      response.webhookResponse.data?.result?.fields?.forEach((field: LicenseField) => {
        initialFields[field.name] = field.value || '';
      });
      setEditableFields(initialFields);
      setActiveStep(1);
    }
  };

  const handleFieldEdit = (fieldName: string) => {
    setIsEditing(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleFieldSave = (fieldName: string) => {
    setIsEditing(prev => ({ ...prev, [fieldName]: false }));
  };

  const handleFieldCancel = (fieldName: string) => {
    if (licenseData?.data?.result?.fields) {
      const originalField = licenseData.data.result.fields.find(f => f.name === fieldName);
      if (originalField) {
        setEditableFields(prev => ({ ...prev, [fieldName]: originalField.value }));
      }
    }
    setIsEditing(prev => ({ ...prev, [fieldName]: false }));
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setEditableFields(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const finalData = {
        ...licenseData,
        editedFields: editableFields,
        documentUrl: file ? URL.createObjectURL(file) : null,
      };

      if (onSave) {
        onSave(finalData);
      }

      setActiveStep(2);
      setTimeout(() => {
        onClose();
        resetDialog();
      }, 2000);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setActiveStep(0);
    setLicenseData(null);
    setEditableFields({});
    setIsEditing({});
    setUploading(false);
    setSaving(false);
  };

  const handleClose = () => {
    onClose();
    resetDialog();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.7) return 'warning';
    return 'error';
  };

  const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth={false}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CloudUploadIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
              Upload License Document
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload and extract license information automatically
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 3 }}>
        <Container maxWidth="lg" sx={{ px: 0 }}>
          {/* Progress Stepper */}
          <StepperContainer>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </StepperContainer>

          {/* Step 1: Upload */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Select Document to Upload
              </Typography>
              <FileUpload
                file={file}
                onFileChange={setFile}
                accept="application/pdf,image/*"
                label="Drop files here or click to select"
                description="Supported formats: PDF, JPG, PNG, JPEG"
                uploading={uploading}
                showUploadButton={true}
                onUploadComplete={handleUploadComplete}
              />
            </Box>
          )}

          {/* Step 2: Review and Edit Data */}
          {activeStep === 1 && licenseData && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Review & Edit License Information
              </Typography>

              {/* Document Metadata */}
              <Card sx={{ mb: 3, backgroundColor: '#f8f9fa', borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Document Analysis Summary
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Model:</strong> {licenseData.data.analyzeResult.modelId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Pages:</strong> {licenseData.data.result.pages}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Fields:</strong> {licenseData.data.result.fields.filter(f => f.value?.trim()).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Processed:</strong> {new Date(licenseData.data.timestamp).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Editable Fields */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                {licenseData.data.result.fields
                  .filter(field => field.value && field.value.trim() !== '')
                  .map((field) => (
                    <Box key={field.name}>
                      <FieldCard>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {field.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <ConfidenceChip
                                confidence={field.confidence}
                                label={formatConfidence(field.confidence)}
                                size="small"
                                color={getConfidenceColor(field.confidence) as any}
                              />
                              {!isEditing[field.name] && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleFieldEdit(field.name)}
                                  sx={{ color: 'primary.main' }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </Box>

                          {isEditing[field.name] ? (
                            <Box>
                              <TextField
                                fullWidth
                                value={editableFields[field.name] || ''}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                variant="outlined"
                                size="small"
                                sx={{ mb: 2 }}
                              />
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<SaveIcon />}
                                  onClick={() => handleFieldSave(field.name)}
                                  sx={{ borderRadius: 2 }}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<CancelIcon />}
                                  onClick={() => handleFieldCancel(field.name)}
                                  sx={{ borderRadius: 2 }}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            </Box>
                          ) : (
                            <Typography variant="body1" sx={{ wordBreak: 'break-word', minHeight: 48, display: 'flex', alignItems: 'center' }}>
                              {editableFields[field.name] || field.value || 'N/A'}
                            </Typography>
                          )}
                        </CardContent>
                      </FieldCard>
                    </Box>
                  ))}
              </Box>
            </Box>
          )}

          {/* Step 3: Confirmation */}
          {activeStep === 2 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                License Saved Successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                The license information has been processed and saved to the system.
              </Typography>
            </Box>
          )}
        </Container>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
            disabled={saving}
          >
            {activeStep === 2 ? 'Close' : 'Cancel'}
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {activeStep === 1 && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(0)}
                  sx={{ borderRadius: 2, px: 3 }}
                  disabled={saving}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                  sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
                >
                  {saving ? 'Saving...' : 'Save License'}
                </Button>
              </>
            )}
          </Box>
        </Box>
      </DialogActions>
    </StyledDialog>
  );
};

export default UploadLicenseDialog;
