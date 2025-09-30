import React from 'react';
import { Box, Typography, Paper, CircularProgress, Chip, IconButton, Fade } from '@mui/material';
import {
  Visibility as PreviewIcon,
  Description as DocumentIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FullscreenOutlined as FullscreenIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
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

interface DocumentPreviewPanelProps {
  file: File | null;
  previewUrl: string;
  zoom: number;
  fileType: {
    isPDF: boolean;
    isImage: boolean;
    canPreview: boolean;
  };
  uploading?: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
}

/**
 * Document Preview Panel
 * Displays PDF or image preview with zoom controls
 */
export const DocumentPreviewPanel: React.FC<DocumentPreviewPanelProps> = ({
  file,
  previewUrl,
  zoom,
  fileType,
  uploading = false,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  canZoomIn,
  canZoomOut,
}) => {
  if (!file || !previewUrl) {
    return (
      <StyledPaper elevation={0}>
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
      </StyledPaper>
    );
  }

  return (
    <Fade in={!!file}>
      <StyledPaper elevation={0}>
        <PreviewHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PreviewIcon sx={{ color: '#10b981' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                {file.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Unknown type'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {fileType.isImage && (
              <>
                <Chip
                  label={`${zoom}%`}
                  size="small"
                  sx={{ fontWeight: 600, minWidth: 60 }}
                />
                <IconButton size="small" onClick={onZoomOut} disabled={!canZoomOut}>
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={onResetZoom}>
                  <FullscreenIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={onZoomIn} disabled={!canZoomIn}>
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
          ) : fileType.isPDF ? (
            <iframe
              src={previewUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#ffffff',
              }}
              title="PDF Preview"
            />
          ) : fileType.isImage ? (
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
                src={previewUrl}
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
      </StyledPaper>
    </Fade>
  );
};
