import React from 'react';
import { Box } from '@mui/material';
import { AccountSelection } from '../../../Inputs/AccountSelection';
import type { Account } from '../../../../../services/accountsService';

interface AccountSelectionStepProps {
  selectedAccount: Account | null;
  onAccountSelect: (account: Account) => void;
  disabled?: boolean;
}

/**
 * Step 1: Account Selection
 * Allows user to select an account from the available accounts list
 */
export const AccountSelectionStep: React.FC<AccountSelectionStepProps> = ({
  selectedAccount,
  onAccountSelect,
  disabled = false,
}) => {
  return (
    <Box>
      <AccountSelection
        selectedAccount={selectedAccount}
        onAccountSelect={onAccountSelect}
        disabled={disabled}
      />
    </Box>
  );
};
