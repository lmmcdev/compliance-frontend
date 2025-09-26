import React from 'react';
import { Box, Typography } from '@mui/material';
import AccountSelection from '../../common/AccountSelection';
import { WizardNavigation } from '../common/WizardNavigation';
import type { StepComponentProps } from '../../../types/wizard';
import type { Account } from '../../../services/accountsService';

interface AccountSelectStepProps extends StepComponentProps {
  selectedAccount: Account | null;
  onAccountSelect: (account: Account) => void;
  disabled?: boolean;
}

export const AccountSelectStep: React.FC<AccountSelectStepProps> = ({
  selectedAccount,
  onAccountSelect,
  onNext,
  disabled = false,
}) => {
  const canProceed = !!selectedAccount;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
        Select Account for License
      </Typography>

      <AccountSelection
        selectedAccount={selectedAccount}
        onAccountSelect={onAccountSelect}
        disabled={disabled}
      />

      <WizardNavigation
        onNext={onNext}
        canGoPrevious={false}
        canGoNext={canProceed}
        nextDisabled={!canProceed}
        nextLabel="Continue"
      />
    </Box>
  );
};