// Modern UploadLicense dialog component, moved to dialogs folder
import React, { useState, useRef } from 'react';
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
  Grid,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';
// @ts-ignore
import { BlobServiceClient } from '@azure/storage-blob';

const connectionString = `DefaultEndpointsProtocol=https;AccountName=lmmcaxis;AccountKey=ciCNr9pW3FZqQm89180xVZcwJ24qRKiW5mrm9tLk0TLVGB1y6H63Ko6qUiLtVLR5nEzg7Hwl4Z9h+AStSW1v4w==;EndpointSuffix=core.windows.net`;

interface LicenseData {
  field1: string;
  field2: string;
  field3: string;
  field4: string;
  field5: string;
}

const DropArea = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'dragover',
})<{
  dragover?: boolean;
}>(({ theme, dragover }) => ({
  border: '2px dashed #90caf9',
  borderRadius: theme?.shape?.borderRadius || 8,
  background: dragover ? '#e3f2fd' : '#fafafa',
  padding: theme?.spacing(4) || 32,
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'background 0.2s',
  color: '#1976d2',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

interface UploadLicenseDialogProps {
  open: boolean;
  onClose: () => void;
}

const UploadLicenseDialog: React.FC<UploadLicenseDialogProps> = ({ open, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [additionalData, setAdditionalData] = useState<LicenseData>({
    field1: '',
    field2: '',
    field3: '',
    field4: '',
    field5: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      const containerClient = blobServiceClient.getContainerClient('licenses');
      await containerClient.createIfNotExists();
      const blockBlobClient = containerClient.getBlockBlobClient(file.name);
      await blockBlobClient.uploadBrowserData(file);
      setUploadedUrl(blockBlobClient.url);
    } catch (error) {
      alert('Upload failed: ' + error);
    }
    setUploading(false);
  };

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdditionalData({
      ...additionalData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUploadIcon color="primary" />
          <Typography variant="h6" component="span">Subir Nueva Licencia</Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DropArea
          dragover={isDragOver}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          sx={{ mb: 3 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <CloudUploadIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Arrastra y Suelta el archivo aquí
          </Typography>
          <Typography variant="body2" color="text.secondary">
            o haz clic para seleccionar
          </Typography>
          {file && <Typography sx={{ mt: 2 }}>{file.name}</Typography>}
        </DropArea>
        <Button
          variant="contained"
          color="primary"
          disabled={!file || uploading}
          onClick={handleUpload}
          fullWidth
          sx={{ py: 1.5, fontWeight: 600, borderRadius: 2 }}
        >
          {uploading ? <CircularProgress size={24} /> : 'Subir Licencia'}
        </Button>
        {uploadedUrl && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Datos Adicionales de la Licencia
            </Typography>
            <Grid container spacing={2}>
              <Grid container spacing={2}>
                <Grid>
                  <TextField label="Campo 1" name="field1" fullWidth value={additionalData.field1} onChange={handleDataChange} />
                </Grid>
                <Grid>
                  <TextField label="Campo 2" name="field2" fullWidth value={additionalData.field2} onChange={handleDataChange} />
                </Grid>
                <Grid>
                  <TextField label="Campo 3" name="field3" fullWidth value={additionalData.field3} onChange={handleDataChange} />
                </Grid>
                <Grid>
                  <TextField label="Campo 4" name="field4" fullWidth value={additionalData.field4} onChange={handleDataChange} />
                </Grid>
                <Grid>
                  <TextField label="Campo 5" name="field5" fullWidth value={additionalData.field5} onChange={handleDataChange} />
                </Grid>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1">Vista Previa:</Typography>
              {file?.type.startsWith('image/') ? (
                <img src={uploadedUrl!} alt="License Preview" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }} />
              ) : (
                <Typography>No hay vista previa disponible.</Typography>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined" sx={{ borderRadius: 2 }}>
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadLicenseDialog;
