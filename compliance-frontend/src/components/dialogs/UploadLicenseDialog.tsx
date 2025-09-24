// Modern UploadLicense dialog component, moved to dialogs folder
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
  Grid,
  IconButton,
  Alert
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { fileUploadService } from '../../services/fileUploadService';
import FileUpload from '../common/FileUpload';

interface LicenseData {
  field1: string;
  field2: string;
  field3: string;
  field4: string;
  field5: string;
}


interface UploadLicenseDialogProps {
  open: boolean;
  onClose: () => void;
}

const UploadLicenseDialog: React.FC<UploadLicenseDialogProps> = ({ open, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [additionalData, setAdditionalData] = useState<LicenseData>({
    field1: '',
    field2: '',
    field3: '',
    field4: '',
    field5: '',
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadSuccess(false);
    try {
      const result = await fileUploadService.uploadLicenseDocument(file, {
        author: 'user',
        purpose: 'license_upload'
      });
      setUploadedUrl(result.url);
      setUploadSuccess(true);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
        <FileUpload
          file={file}
          onFileChange={setFile}
          accept="application/pdf,image/*"
          label="Arrastra y Suelta el archivo aquí o haz clic para seleccionar"
          description="Formatos soportados: PDF, JPG, PNG"
          uploading={uploading}
        />
        <Button
          variant="contained"
          color="primary"
          disabled={!file || uploading}
          onClick={handleUpload}
          fullWidth
          sx={{ py: 1.5, fontWeight: 600, borderRadius: 2, mb: 2 }}
        >
          {uploading ? <CircularProgress size={24} /> : 'Subir Licencia'}
        </Button>

        {uploadSuccess && (
          <Alert
            severity="success"
            icon={<CheckCircleIcon />}
            sx={{
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              ¡Archivo subido exitosamente!
            </Typography>
            <Typography variant="caption" sx={{ color: 'success.dark' }}>
              El documento se ha cargado correctamente y está listo para procesar.
            </Typography>
          </Alert>
        )}
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
