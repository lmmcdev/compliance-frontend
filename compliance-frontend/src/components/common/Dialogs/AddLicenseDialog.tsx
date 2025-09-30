import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    maxWidth: 600,
    width: '100%',
    margin: theme.spacing(2),
  },
}));

interface AddLicenseDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (licenseData: { code: string; displayName: string; description: string }) => Promise<void>;
}

export const AddLicenseDialog: React.FC<AddLicenseDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    code: '',
    displayName: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'License code is required';
    } else if (formData.code.length < 2) {
      newErrors.code = 'License code must be at least 2 characters';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (formData.displayName.length < 3) {
      newErrors.displayName = 'Display name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (onSave) {
        await onSave(formData);
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save license type:', error);
      // Handle error - could show a snackbar or error message
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setFormData({ code: '', displayName: '', description: '' });
      setErrors({});
      onClose();
    }
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth={false}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AddIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
              Add License Type
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create a new license type for compliance tracking
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'text.secondary' }} disabled={saving}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="License Code"
            value={formData.code}
            onChange={handleChange('code')}
            error={!!errors.code}
            helperText={errors.code || 'Unique code to identify this license type (e.g., "Medicaid", "Medicare")'}
            fullWidth
            required
            disabled={saving}
            placeholder="Enter license code"
          />

          <TextField
            label="Display Name"
            value={formData.displayName}
            onChange={handleChange('displayName')}
            error={!!errors.displayName}
            helperText={errors.displayName || 'Human-readable name for this license type'}
            fullWidth
            required
            disabled={saving}
            placeholder="Enter display name"
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={handleChange('description')}
            error={!!errors.description}
            helperText={errors.description || 'Detailed description of what this license type covers'}
            fullWidth
            required
            multiline
            rows={4}
            disabled={saving}
            placeholder="Enter description"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={saving}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !formData.code || !formData.displayName || !formData.description}
          startIcon={saving ? <CircularProgress size={16} /> : <AddIcon />}
          sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
        >
          {saving ? 'Adding...' : 'Add License Type'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default AddLicenseDialog;