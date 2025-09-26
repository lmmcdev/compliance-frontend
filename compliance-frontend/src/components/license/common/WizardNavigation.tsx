import React from 'react';
import { Box, Button } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

interface WizardNavigationProps {
  onNext?: () => void;
  onPrevious?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  nextDisabled?: boolean;
  previousDisabled?: boolean;
  isLoading?: boolean;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  onNext,
  onPrevious,
  nextLabel = 'Next',
  previousLabel = 'Previous',
  canGoNext = true,
  canGoPrevious = true,
  nextDisabled = false,
  previousDisabled = false,
  isLoading = false,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        mt: 3,
        pt: 2,
        borderTop: '1px solid #e0e0e0',
      }}
    >
      <Button
        onClick={onPrevious}
        disabled={!canGoPrevious || previousDisabled || isLoading}
        startIcon={<ArrowBack />}
        variant="outlined"
        sx={{ minWidth: 120 }}
      >
        {previousLabel}
      </Button>

      <Button
        onClick={onNext}
        disabled={!canGoNext || nextDisabled || isLoading}
        endIcon={<ArrowForward />}
        variant="contained"
        sx={{ minWidth: 120 }}
      >
        {nextLabel}
      </Button>
    </Box>
  );
};