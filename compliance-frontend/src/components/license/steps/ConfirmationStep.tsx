import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { WizardNavigation } from '../common/WizardNavigation';
import { StepComponentProps } from '../../../types/wizard';

interface ConfirmationStepProps extends StepComponentProps {
  onSave: () => void;
  isSaving?: boolean;
  saved?: boolean;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  onSave,
  onPrevious,
  isSaving = false,
  saved = false,
}) => {
  if (saved) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          License Saved Successfully!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your license information has been processed and saved to the system.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
        Save License Information
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
        Please review the information above and click "Save License" to complete the process.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Button
          variant="contained"
          size="large"
          onClick={onSave}
          disabled={isSaving}
          sx={{ minWidth: 200, py: 1.5 }}
        >
          {isSaving ? 'Saving...' : 'Save License'}
        </Button>
      </Box>

      <WizardNavigation
        onPrevious={onPrevious}
        canGoPrevious={!isSaving}
        canGoNext={false}
        previousLabel="Back to Review"
      />
    </Box>
  );
};