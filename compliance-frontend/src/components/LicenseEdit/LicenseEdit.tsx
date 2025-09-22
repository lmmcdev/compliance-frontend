import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';

interface License {
  id: string;
  code: string;
  displayName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface LicenseEditProps {
  license?: License;
  onSave?: (license: License) => void;
  onCancel?: () => void;
}

const LicenseEdit = ({ license, onSave, onCancel }: LicenseEditProps) => {
  const [formData, setFormData] = useState<License>({
    id: license?.id || '',
    code: license?.code || '',
    displayName: license?.displayName || '',
    description: license?.description || '',
    createdAt: license?.createdAt || new Date().toISOString(),
    updatedAt: license?.updatedAt || new Date().toISOString(),
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: keyof License) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    setError(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setError(null);
    }
  };

  const handleSave = async () => {
    if (!formData.code || !formData.displayName) {
      setError('Code and Display Name are required fields.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updatedLicense = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };

      onSave?.(updatedLicense);
    } catch (err) {
      console.error('Failed to save license:', err);
      setError('Failed to save license. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      id: license?.id || '',
      code: license?.code || '',
      displayName: license?.displayName || '',
      description: license?.description || '',
      createdAt: license?.createdAt || new Date().toISOString(),
      updatedAt: license?.updatedAt || new Date().toISOString(),
    });
    setUploadedFile(null);
    setError(null);
    onCancel?.();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }) + ' ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '—';
    }
  };

  return (
    <Box sx={{ width: '100%', px: 3, py: 2 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          mb: 3,
          fontWeight: 600,
          color: '#424242',
        }}
      >
        {license ? 'Edit License' : 'Create New License'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={1}
        sx={{
          borderRadius: 1,
          border: '1px solid #e0e0e0',
          width: '100%',
          p: 3,
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="License Code"
              value={formData.code}
              onChange={handleInputChange('code')}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Display Name"
              value={formData.displayName}
              onChange={handleInputChange('displayName')}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Card
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                backgroundColor: '#fafafa',
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: '#424242',
                    fontSize: '1rem',
                  }}
                >
                  Upload Document
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box
                  sx={{
                    border: '2px dashed #e0e0e0',
                    borderRadius: 1,
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: '#fff',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#2196f3',
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  <input
                    type="file"
                    id="document-upload"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="document-upload" style={{ cursor: 'pointer' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <UploadIcon sx={{ fontSize: 48, color: '#2196f3' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#424242' }}>
                        Click to upload document
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#757575' }}>
                        Supported formats: PDF, DOC, DOCX, JPG, PNG
                      </Typography>
                    </Box>
                  </label>
                </Box>

                {uploadedFile && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      backgroundColor: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <DocumentIcon sx={{ color: '#2196f3' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {uploadedFile.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#757575' }}>
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => setUploadedFile(null)}
                      sx={{ color: '#f44336' }}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {license && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
                <Typography variant="body2" sx={{ color: '#757575' }}>
                  <strong>Created:</strong> {formatDate(formData.createdAt)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#757575' }}>
                  <strong>Updated:</strong> {formatDate(formData.updatedAt)}
                </Typography>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<CancelIcon />}
                sx={{
                  borderColor: '#e0e0e0',
                  color: '#424242',
                  '&:hover': {
                    borderColor: '#424242',
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={<SaveIcon />}
                sx={{
                  backgroundColor: '#2196f3',
                  '&:hover': {
                    backgroundColor: '#1976d2',
                  },
                  '&:disabled': {
                    backgroundColor: '#e0e0e0',
                  },
                }}
              >
                {saving ? 'Saving...' : 'Save License'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default LicenseEdit;