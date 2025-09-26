import React from 'react';
import { Box, Stepper, Step, StepLabel } from '@mui/material';
import { styled } from '@mui/material/styles';

const StepperContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  padding: theme.spacing(2),
  borderRadius: 12,
  marginBottom: theme.spacing(3),
}));

interface ProgressIndicatorProps {
  currentStep: number;
  steps: string[];
  completedSteps?: Set<number>;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  steps,
  completedSteps = new Set(),
}) => {
  return (
    <StepperContainer>
      <Stepper activeStep={currentStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step
            key={label}
            completed={completedSteps.has(index)}
          >
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </StepperContainer>
  );
};