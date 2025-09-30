import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { CloudUpload as UploadIcon, Check as CheckIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

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

interface FileUploadStepProps {
  uploadedFile: File | null;
  uploading: boolean;
  isDragging: boolean;
  onFileSelect: (file: File) => void;
  onClearFile: () => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent) => void;
  disabled?: boolean;
}

/**
 * Step 2: File Upload
 * Allows user to upload a license document via drag-and-drop or file picker
 */
export const FileUploadStep: React.FC<FileUploadStepProps> = ({
  uploadedFile,
  uploading,
  isDragging,
  onFileSelect,
  onClearFile,
  onDragOver,
  onDragLeave,
  onDrop,
  disabled = false,
}) => {
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Upload License Document
      </Typography>

      <input
        type="file"
        id="file-upload-input"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
        accept=".pdf,.jpg,.jpeg,.png"
        disabled={disabled || uploading}
      />

      <label htmlFor="file-upload-input">
        <FileUploadBox
          className={isDragging ? 'dragging' : ''}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                File uploaded successfully
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  onClearFile();
                }}
                disabled={disabled}
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
    </Box>
  );
};
