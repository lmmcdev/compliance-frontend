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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import FileUpload from '../common/FileUpload';
import AccountSelection from '../common/AccountSelection';
import type { Account } from '../../services/accountsService';

interface BoundingRegion {
  pageNumber: number;
  polygon: number[];
}

interface LicenseField {
  name: string;
  value: string;
  confidence: number;
  type: string;
  boundingRegions: BoundingRegion[];
  editable?: boolean;
}

interface LicenseTable {
  id: string;
  rowCount: number;
  columnCount: number;
  rows: string[][];
  confidence: number;
  boundingRegions: BoundingRegion[];
}

interface LicenseData {
  success: boolean;
  data: {
    result?: {
      fields?: LicenseField[];
      tables?: LicenseTable[];
      content?: string;
      pages?: number;
    };
    analyzeResult?: {
      modelId?: string;
      apiVersion?: string;
      documentsCount?: number;
    };
    timestamp?: string;
  };
  meta?: {
    traceId?: string;
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
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null);
  const [editableFields, setEditableFields] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const steps = ['Select Account', 'Upload Document', 'Review Data', 'Save License'];

  const handleUploadComplete = (response: any) => {
    console.log('[License Upload] Upload complete response:', response);
    console.log('[License Upload] Response type:', typeof response);
    console.log('[License Upload] Response keys:', Object.keys(response || {}));

    if (response.webhookResponse) {
      const licenseJsonData = response.webhookResponse;
      console.log('[License Upload] License JSON data:', licenseJsonData);
      console.log('[License Upload] JSON data type:', typeof licenseJsonData);
      console.log('[License Upload] JSON data keys:', Object.keys(licenseJsonData || {}));

      // Check if the JSON response contains an error
      if (licenseJsonData.error) {
        console.error('[License Upload] JSON response error:', licenseJsonData.error);
        alert('Upload failed: ' + (licenseJsonData.error.message || licenseJsonData.error));
        return;
      }

      // Process the JSON response directly - look for fields in multiple possible paths
      let fields = null;

      // Try different possible paths for fields
      if (licenseJsonData?.data?.result?.fields) {
        fields = licenseJsonData.data.result.fields;
        console.log('[License Upload] Found fields at data.result.fields');
      } else if (licenseJsonData?.fields) {
        fields = licenseJsonData.fields;
        console.log('[License Upload] Found fields at root level');
      } else if (licenseJsonData?.result?.fields) {
        fields = licenseJsonData.result.fields;
        console.log('[License Upload] Found fields at result.fields');
      }

      console.log('[License Upload] Extracted fields:', fields);
      console.log('[License Upload] Fields type:', typeof fields);
      console.log('[License Upload] Fields is array:', Array.isArray(fields));

      // Set the license data to the JSON response
      setLicenseData(licenseJsonData);

      const initialFields: Record<string, string> = {};

      if (fields && Array.isArray(fields)) {
        console.log('[License Upload] Processing', fields.length, 'fields');
        fields.forEach((field: any, index: number) => {
          console.log(`[License Upload] Field ${index}:`, field);
          console.log(`[License Upload] Field name: "${field.name}", value: "${field.value}"`);

          if (field.name) {
            initialFields[field.name] = field.value || '';
          }
        });
        console.log('[License Upload] Initial fields object:', initialFields);
      } else {
        console.log('[License Upload] No fields array found or not an array');
        console.log('[License Upload] Available JSON structure:', JSON.stringify(licenseJsonData, null, 2));
      }

      setEditableFields(initialFields);
      setActiveStep(2); // Move to Review Data step
    } else {
      console.error('[License Upload] No webhook response received');
      console.log('[License Upload] Available response properties:', Object.keys(response || {}));
      alert('Upload failed: No webhook response received');
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
      const originalField = licenseData.data.result.fields.find(f => f?.name === fieldName);
      if (originalField) {
        setEditableFields(prev => ({ ...prev, [fieldName]: originalField.value || '' }));
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
        account: selectedAccount,
        licenseData,
        editedFields: editableFields,
        documentUrl: file ? URL.createObjectURL(file) : null,
      };

      if (onSave) {
        onSave(finalData);
      }

      setActiveStep(3); // Move to success step
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
    setSelectedAccount(null);
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

          {/* Step 1: Account Selection */}
          {activeStep === 0 && (
            <AccountSelection
              selectedAccount={selectedAccount}
              onAccountSelect={setSelectedAccount}
              disabled={saving}
            />
          )}

          {/* Step 2: Upload Document */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Upload License Document
              </Typography>
              {selectedAccount && (
                <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Selected Account:</strong> {selectedAccount.name}
                  </Typography>
                </Box>
              )}
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

          {/* Step 3: Review and Edit Data */}
          {activeStep === 2 && licenseData && (() => {
            console.log('[License Render] Current licenseData:', licenseData);
            console.log('[License Render] licenseData.data:', licenseData.data);
            console.log('[License Render] licenseData.data?.result:', licenseData.data?.result);
            console.log('[License Render] Fields:', licenseData.data?.result?.fields);
            console.log('[License Render] Fields length:', licenseData.data?.result?.fields?.length);
            console.log('[License Render] Fields array check:', Array.isArray(licenseData.data?.result?.fields));
            return (
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
                      <strong>Model:</strong> {licenseData.data?.analyzeResult?.modelId || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Pages:</strong> {licenseData.data?.result?.pages || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Fields:</strong> {(() => {
                        let fields = null;
                        if (licenseData?.data?.result?.fields) {
                          fields = licenseData.data.result.fields;
                        } else if (licenseData?.fields) {
                          fields = licenseData.fields;
                        } else if (licenseData?.result?.fields) {
                          fields = licenseData.result.fields;
                        }
                        return (fields && Array.isArray(fields)) ? fields.filter(f => f?.name).length : 0;
                      })()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Processed:</strong> {licenseData.data?.timestamp ? new Date(licenseData.data.timestamp).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Editable Fields */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Extracted Fields
                </Typography>
                {(() => {
                  // Extract fields using the same logic as handleUploadComplete
                  let fields = null;
                  if (licenseData?.data?.result?.fields) {
                    fields = licenseData.data.result.fields;
                  } else if (licenseData?.fields) {
                    fields = licenseData.fields;
                  } else if (licenseData?.result?.fields) {
                    fields = licenseData.result.fields;
                  }

                  const validFields = (fields && Array.isArray(fields)) ? fields.filter(field => field?.name) : [];
                  console.log('[License Render] Found fields:', validFields.length);
                  console.log('[License Render] Fields data:', validFields);
                  return validFields.length === 0;
                })() ? (
                  <Card sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                    <Typography variant="body1" color="text.secondary">
                      No fields were extracted from the document. Please check the document quality or try uploading again.
                    </Typography>
                  </Card>
                ) : (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                    {(() => {
                      // Extract fields using the same logic as above
                      let fields = null;
                      if (licenseData?.data?.result?.fields) {
                        fields = licenseData.data.result.fields;
                      } else if (licenseData?.fields) {
                        fields = licenseData.fields;
                      } else if (licenseData?.result?.fields) {
                        fields = licenseData.result.fields;
                      }

                      const validFields = (fields && Array.isArray(fields)) ? fields.filter(field => field?.name) : [];
                      return validFields.map((field) => (
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
                                {editableFields[field.name] !== undefined ? editableFields[field.name] : (field.value || 'N/A')}
                              </Typography>
                            )}
                          </CardContent>
                        </FieldCard>
                        </Box>
                      ));
                    })()}
                  </Box>
                )}
              </Box>

              {/* Table Data */}
              {licenseData.data?.result?.tables && licenseData.data.result.tables.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Extracted Tables
                  </Typography>
                  {licenseData.data.result.tables.map((table, index) => (
                    <Accordion key={table.id || index} sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ borderRadius: 2, backgroundColor: '#f8f9fa' }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Table {index + 1}
                          </Typography>
                          <Chip
                            label={`${table.rowCount}×${table.columnCount}`}
                            size="small"
                            variant="outlined"
                          />
                          {table.confidence > 0 && (
                            <ConfidenceChip
                              confidence={table.confidence}
                              label={formatConfidence(table.confidence)}
                              size="small"
                              color={getConfidenceColor(table.confidence) as any}
                            />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                          <Table size="small">
                            <TableBody>
                              {table.rows.map((row, rowIndex) => (
                                <TableRow
                                  key={rowIndex}
                                  sx={{
                                    '&:nth-of-type(odd)': { backgroundColor: '#f8f9fa' },
                                    '& td': { border: '1px solid #e0e0e0' }
                                  }}
                                >
                                  {row.map((cell, cellIndex) => (
                                    <TableCell
                                      key={cellIndex}
                                      sx={{
                                        fontWeight: cellIndex === 0 ? 600 : 400,
                                        backgroundColor: cellIndex === 0 ? '#f0f0f0' : 'inherit',
                                        minWidth: 150,
                                        maxWidth: 300,
                                        wordBreak: 'break-word'
                                      }}
                                    >
                                      {cell}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </Box>
            );
          })()}

          {/* Step 4: Confirmation */}
          {activeStep === 3 && (
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
            {activeStep === 3 ? 'Close' : 'Cancel'}
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Account Selection Step */}
            {activeStep === 0 && (
              <Button
                variant="contained"
                onClick={() => setActiveStep(1)}
                disabled={!selectedAccount || saving}
                sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
              >
                Next: Upload Document
              </Button>
            )}

            {/* Upload Document Step */}
            {activeStep === 1 && (
              <Button
                variant="outlined"
                onClick={() => setActiveStep(0)}
                sx={{ borderRadius: 2, px: 3 }}
                disabled={saving}
              >
                Back to Accounts
              </Button>
            )}

            {/* Review Data Step */}
            {activeStep === 2 && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(1)}
                  sx={{ borderRadius: 2, px: 3 }}
                  disabled={saving}
                >
                  Back to Upload
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
