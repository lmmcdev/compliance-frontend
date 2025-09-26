import React, { useRef } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Button,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CloudUpload as CloudUploadIcon,
  Description as DocumentIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { fileUploadService } from '../../services/fileUploadService';
import LicenseDataDisplay from './LicenseDataDisplay';

export interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  description?: string;
  uploading?: boolean;
  allowDrop?: boolean;
  disabled?: boolean;
  showUploadButton?: boolean;
  onUploadComplete?: (response: any) => void;
}

const DropArea = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'dragover' && prop !== 'disabled',
})<{
  dragover?: boolean;
  disabled?: boolean;
}>(({ theme, dragover, disabled }) => ({
  border: '2px dashed #90caf9',
  borderRadius: theme?.shape?.borderRadius || 8,
  background: disabled
    ? '#f5f5f5'
    : dragover
    ? '#e3f2fd'
    : '#fafafa',
  padding: theme?.spacing(4) || 32,
  textAlign: 'center',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'background 0.2s',
  color: disabled ? '#bdbdbd' : '#1976d2',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 120,
  opacity: disabled ? 0.6 : 1,
}));

const FileDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme?.spacing(1) || 8,
  padding: theme?.spacing(2) || 16,
  border: '1px solid #e0e0e0',
  borderRadius: theme?.shape?.borderRadius || 8,
  backgroundColor: '#f9f9f9',
  marginTop: theme?.spacing(1) || 8,
}));

const FileUpload: React.FC<FileUploadProps> = ({
  file,
  onFileChange,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  maxSizeMB = 10,
  label = 'Click to upload document',
  description = 'Supported formats: PDF, DOC, DOCX, JPG, PNG',
  uploading = false,
  allowDrop = true,
  disabled = false,
  showUploadButton = true,
  onUploadComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [licenseData, setLicenseData] = React.useState<any>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      onFileChange(selectedFile);
      setLicenseData(null);
      setUploadError(null);
    }
  };

  const validateFile = (selectedFile: File): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      alert(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }
    return true;
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!allowDrop || disabled) return;

    event.preventDefault();
    setIsDragOver(false);

    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile && validateFile(droppedFile)) {
      onFileChange(droppedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!allowDrop || disabled) return;
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (!allowDrop || disabled) return;
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    setLicenseData(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setLicenseData(null);

    try {
      const result = await fileUploadService.uploadLicenseDocument(file);

      if (result.webhookResponse) {
        setLicenseData(result.webhookResponse);
      }

      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={disabled}
      />

      {!file ? (
        <DropArea
          dragover={isDragOver}
          disabled={disabled}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          {uploading ? (
            <CircularProgress size={48} />
          ) : (
            <>
              <CloudUploadIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                {allowDrop ? 'Drag and drop file here or' : ''} {label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Max size: {maxSizeMB}MB
              </Typography>
            </>
          )}
        </DropArea>
      ) : (
        <>
          <FileDisplay>
            <DocumentIcon sx={{ color: '#1976d2' }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {file.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#757575' }}>
                {formatFileSize(file.size)}
              </Typography>
            </Box>
            {!disabled && !uploading && !isUploading && (
              <IconButton
                onClick={handleRemoveFile}
                size="small"
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </FileDisplay>

          {showUploadButton && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={disabled || uploading || isUploading}
                startIcon={isUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                fullWidth
              >
                {isUploading ? 'Processing...' : 'Upload and Analyze Document'}
              </Button>
            </Box>
          )}

          {uploadError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {uploadError}
            </Alert>
          )}
        </>
      )}

      {/* Display License Data */}
      {licenseData && (
        <LicenseDataDisplay
          licenseData={licenseData}
          loading={isUploading}
          error={uploadError || undefined}
        />
      )}
    </Box>
  );
};

export default FileUpload;