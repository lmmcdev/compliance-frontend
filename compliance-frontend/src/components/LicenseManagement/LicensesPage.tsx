import React from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  Fab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CloudUpload as UploadIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Description as FileIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { LicenseProvider, useLicenses, useLicenseOperations, type License } from '../../contexts';
import { AccountProvider } from '../../contexts/AccountContext';
import { LicensesTable } from '../common/DataTable/LicensesTable';
import { AddLicenseDialog } from '../common/Dialogs';
import { useSelection } from '../../hooks/patterns';

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: '100%',
  backgroundColor: theme.palette.grey[50],
}));

const PageHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
  color: theme.palette.success.contrastText,
  position: 'relative',
  overflow: 'hidden',
}));

const HeaderContent = styled(Box)(() => ({
  position: 'relative',
  zIndex: 1,
}));

const HeaderActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const FloatingActions = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  zIndex: theme.zIndex.speedDial,
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  marginTop: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
}));

const StatItem = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const StatValue = styled(Typography)(() => ({
  fontSize: '2rem',
  fontWeight: 'bold',
  lineHeight: 1,
}));

const StatLabel = styled(Typography)(() => ({
  fontSize: '0.875rem',
  opacity: 0.9,
}));

interface LicensesPageContentProps {}

const LicensesPageContent: React.FC<LicensesPageContentProps> = () => {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = React.useState<string>('');
  const [formData, setFormData] = React.useState({
    licenseName: '',
    licenseCode: '',
    description: '',
    location: '',
    assignedTo: '',
  });

  const {
    data: licenses,
    loading,
    error,
    refresh,
  } = useLicenses();

  const { create: createOperation } = useLicenseOperations();

  // Clean up preview URL on component unmount
  React.useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  // Selection management - ensure we always pass an array
  const licensesArray = Array.isArray(licenses) ? licenses : [];
  const {
    selectedIds,
    selectItem,
    deselectItem,
  } = useSelection(licensesArray, {
    getItemId: (license) => license.id,
  });

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = licensesArray.length;
    const recent = licensesArray.filter(l => {
      const createdDate = new Date(l.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate > thirtyDaysAgo;
    }).length;
    const thisYear = licensesArray.filter(l => {
      const createdDate = new Date(l.createdAt);
      return createdDate.getFullYear() === new Date().getFullYear();
    }).length;
    const lastUpdated = licensesArray.filter(l => {
      const updatedDate = new Date(l.updatedAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return updatedDate > sevenDaysAgo;
    }).length;

    return { total, recent, thisYear, lastUpdated };
  }, [licensesArray]);

  // Handlers
  const handleEditLicense = (license: License) => {
    // TODO: Implement edit license dialog
    console.log('Edit license:', license.id);
  };

  const handleViewLicense = (license: License) => {
    // TODO: Implement view license dialog
    console.log('View license:', license.id);
  };

  const handleDeleteLicense = (license: License) => {
    // The delete operation is handled by LicensesTable
    console.log('License deleted:', license.id);
  };


  const handleAddLicense = () => {
    setAddDialogOpen(true);
  };

  const handleSaveLicense = async (licenseData: { code: string; displayName: string; description: string }) => {
    try {
      await createOperation.mutate(licenseData);
      console.log('License type created successfully');
    } catch (error) {
      console.error('Failed to create license type:', error);
      throw error; // Re-throw so the dialog can handle it
    }
  };

  const handleUploadLicense = () => {
    setUploadDialogOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);

      // Generate file preview URL
      const fileUrl = URL.createObjectURL(file);
      setFilePreviewUrl(fileUrl);

      // Auto-populate fields based on filename
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      setFormData(prev => ({
        ...prev,
        licenseName: nameWithoutExtension,
        licenseCode: nameWithoutExtension.toUpperCase().replace(/\s+/g, '-'),
      }));
    }
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !formData.licenseName) {
      alert('Please select a file and enter a license name');
      return;
    }

    try {
      // Here you would implement the actual upload logic
      console.log('Uploading license:', {
        file: selectedFile,
        ...formData
      });

      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Reset form and close dialog
      resetUploadForm();
      setUploadDialogOpen(false);
      refresh(); // Refresh the licenses list

      alert('License uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const resetUploadForm = () => {
    // Clean up preview URL to prevent memory leaks
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }

    setSelectedFile(null);
    setFilePreviewUrl('');
    setFormData({
      licenseName: '',
      licenseCode: '',
      description: '',
      location: '',
      assignedTo: '',
    });
  };

  const handleUploadDialogClose = () => {
    resetUploadForm();
    setUploadDialogOpen(false);
  };

  if (error) {
    return (
      <PageContainer>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refresh}>
              Retry
            </Button>
          }
        >
          Failed to load licenses: {error}
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Page Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '16px',
        p: 4,
        mb: 3,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                color: '#1e293b',
                mb: 1,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              License Management
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#64748b',
                fontWeight: 400,
                fontSize: '16px'
              }}
            >
              Manage and track all business licenses and certificates with our modern interface
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUploadLicense();
              }}
              type="button"
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Upload License
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddLicense}
              sx={{
                borderColor: '#E2E8F0',
                color: '#64748b',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                '&:hover': {
                  borderColor: '#00A1FF',
                  backgroundColor: '#F8FAFC',
                  color: '#00A1FF',
                },
              }}
            >
              Add Type
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refresh}
              disabled={loading}
              sx={{
                borderColor: '#E2E8F0',
                color: '#64748b',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                '&:hover': {
                  borderColor: '#00A1FF',
                  backgroundColor: '#F8FAFC',
                  color: '#00A1FF',
                },
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Modern Statistics Cards */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mt: 3
        }}>
          <Box sx={{
            p: 3,
            borderRadius: '12px',
            backgroundColor: '#F0F9FF',
            border: '1px solid #BAE6FD',
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#0369A1', mb: 1 }}>
              {stats.total}
            </Typography>
            <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>
              Total Licenses
            </Typography>
          </Box>
          <Box sx={{
            p: 3,
            borderRadius: '12px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#15803D', mb: 1 }}>
              {stats.recent}
            </Typography>
            <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>
              Added (30 days)
            </Typography>
          </Box>
          <Box sx={{
            p: 3,
            borderRadius: '12px',
            backgroundColor: '#FFFBEB',
            border: '1px solid #FED7AA',
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#D97706', mb: 1 }}>
              {stats.thisYear}
            </Typography>
            <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>
              This Year
            </Typography>
          </Box>
          <Box sx={{
            p: 3,
            borderRadius: '12px',
            backgroundColor: '#FDF2F8',
            border: '1px solid #FBCFE8',
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#BE185D', mb: 1 }}>
              {stats.lastUpdated}
            </Typography>
            <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>
              Updated (7 days)
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Paper elevation={1} sx={{ p: 0, overflow: 'hidden' }}>
        <LicensesTable
          onEditLicense={handleEditLicense}
          onViewLicense={handleViewLicense}
          onDeleteLicense={handleDeleteLicense}
          selectable={true}
          selectedLicenses={selectedIds}
          onSelectionChange={(newSelection) => {
            // Sync with useSelection hook
            const currentSelection = new Set(selectedIds);
            const newSelectionSet = new Set(newSelection);

            // Find items to select/deselect
            newSelectionSet.forEach(id => {
              if (!currentSelection.has(id)) {
                const license = licensesArray.find(l => l.id === id);
                if (license) selectItem(license);
              }
            });

            currentSelection.forEach(id => {
              if (!newSelectionSet.has(id)) {
                const license = licensesArray.find(l => l.id === id);
                if (license) deselectItem(license);
              }
            });
          }}
        />
      </Paper>

      {/* Floating Action Buttons */}
      <FloatingActions>
        <Tooltip title="Refresh licenses" placement="left">
          <Fab
            color="primary"
            size="medium"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshIcon />
          </Fab>
        </Tooltip>
        <Tooltip title="Add new license type" placement="left">
          <Fab
            color="secondary"
            onClick={handleAddLicense}
          >
            <UploadIcon />
          </Fab>
        </Tooltip>
      </FloatingActions>

      {/* Add License Dialog */}
      <AddLicenseDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleSaveLicense}
      />

      {/* Upload License Dialog - Clean Version */}
      <Dialog
        open={uploadDialogOpen}
        onClose={handleUploadDialogClose}
        maxWidth="lg"
        fullWidth
      >
        <Box sx={{
          p: 3,
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <UploadIcon sx={{ color: '#10B981', fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e293b' }}>
              Upload License Document
            </Typography>
          </Box>
          <IconButton onClick={handleUploadDialogClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ p: 4 }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: selectedFile ? '1fr 1fr' : '1fr',
            gap: 4,
            minHeight: '500px',
          }}>
            {/* Left Panel - Upload & Form */}
            <Box>
              {/* Simple Upload Area */}
              <Box
                onClick={() => document.getElementById('file-input-clean')?.click()}
                sx={{
                  border: selectedFile ? '2px solid #10B981' : '2px dashed #E2E8F0',
                  borderRadius: '12px',
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: selectedFile ? '#F0FDF4' : '#F8FAFC',
                  cursor: 'pointer',
                  mb: 3,
                  '&:hover': {
                    borderColor: '#10B981',
                    backgroundColor: '#F0FDF4',
                  },
                }}
              >
                <input
                  id="file-input-clean"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                {selectedFile ? (
                  <Box>
                    <FileIcon sx={{ color: '#10B981', fontSize: 48, mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#1e293b', mb: 1 }}>
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setFilePreviewUrl('');
                        setFormData(prev => ({
                          ...prev,
                          licenseName: '',
                          licenseCode: '',
                        }));
                      }}
                      sx={{ color: '#EF4444', borderColor: '#EF4444' }}
                    >
                      Remove File
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <UploadIcon sx={{ color: '#64748b', fontSize: 48, mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#1e293b', mb: 1 }}>
                      Click to upload license document
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Form Fields */}
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1e293b' }}>
                License Information
              </Typography>

              <Box sx={{ display: 'grid', gap: 2 }}>
                <TextField
                  label="License Name"
                  fullWidth
                  value={formData.licenseName}
                  onChange={handleInputChange('licenseName')}
                  placeholder="e.g., Business Operations License"
                  required
                />
                <TextField
                  label="License Code"
                  fullWidth
                  value={formData.licenseCode}
                  onChange={handleInputChange('licenseCode')}
                  placeholder="e.g., BUS-2024-001"
                />
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  placeholder="Brief description of the license"
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    label="Location"
                    value={formData.location}
                    onChange={handleInputChange('location')}
                    placeholder="e.g., New York, NY"
                  />
                  <TextField
                    label="Assigned To"
                    value={formData.assignedTo}
                    onChange={handleInputChange('assignedTo')}
                    placeholder="e.g., John Doe"
                  />
                </Box>
              </Box>
            </Box>

            {/* Right Panel - Document Preview */}
            {selectedFile && (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                p: 3,
                border: '1px solid #E2E8F0',
              }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1e293b' }}>
                  Document Preview
                </Typography>

                <Box sx={{
                  flex: 1,
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                  minHeight: '400px',
                }}>
                  {filePreviewUrl ? (
                    <>
                      {selectedFile.type.startsWith('image/') ? (
                        <img
                          src={filePreviewUrl}
                          alt="Preview"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      ) : selectedFile.type === 'application/pdf' ? (
                        <iframe
                          src={filePreviewUrl}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            minHeight: '400px',
                          }}
                          title="PDF Preview"
                        />
                      ) : (
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          flexDirection: 'column',
                          gap: 1,
                          minHeight: '400px',
                        }}>
                          <FileIcon sx={{ fontSize: 48, color: '#64748b' }} />
                          <Typography variant="body1" sx={{ color: '#64748b' }}>
                            Preview not available
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                            {selectedFile.name}
                          </Typography>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      flexDirection: 'column',
                      gap: 1,
                      minHeight: '400px',
                    }}>
                      <UploadIcon sx={{ fontSize: 48, color: '#94A3B8' }} />
                      <Typography variant="body1" sx={{ color: '#64748b' }}>
                        Generating preview...
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleUploadDialogClose}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              borderColor: '#E2E8F0',
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#CBD5E1',
                backgroundColor: '#F8FAFC',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUploadSubmit}
            variant="contained"
            disabled={!selectedFile || !formData.licenseName}
            sx={{
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              },
              '&:disabled': {
                background: '#E2E8F0',
                color: '#94A3B8',
              },
            }}
          >
            Upload License
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

// Main page component with context provider
export const LicensesPage: React.FC = () => {
  return (
    <LicenseProvider>
      <AccountProvider>
        <LicensesPageContent />
      </AccountProvider>
    </LicenseProvider>
  );
};

export default LicensesPage;