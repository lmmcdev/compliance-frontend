import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Close as CloseIcon } from '@mui/icons-material';
import type { Account } from '../../services/accountsService';
import { LicenseData } from '../../types/license';
import { WIZARD_STEPS } from '../../types/wizard';
import { useWizardFlow } from '../../hooks/useWizardFlow';
import { useLicenseUpload } from '../../hooks/useLicenseUpload';
import { ProgressIndicator } from './common/ProgressIndicator';
import { AccountSelectStep } from './steps/AccountSelectStep';
import { DocumentUploadStep } from './steps/DocumentUploadStep';
import { DataReviewStep } from './steps/DataReviewStep';
import { ConfirmationStep } from './steps/ConfirmationStep';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    maxHeight: '90vh',
    width: '100%',
    maxWidth: 1000,
    margin: theme.spacing(2),
  },
}));

const DialogTitleStyled = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #e0e0e0',
  padding: theme.spacing(2, 3),
}));

interface LicenseWizardProps {
  open: boolean;
  onClose: () => void;
  onSave?: (licenseData: any) => void;
}

export const LicenseWizard: React.FC<LicenseWizardProps> = ({
  open,
  onClose,
  onSave,
}) => {
  // Wizard flow state
  const { currentStep, nextStep, previousStep, reset } = useWizardFlow();

  // License upload state
  const { data: licenseData, isUploading, error, uploadFile } = useLicenseUpload();

  // Local component state
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const stepLabels = WIZARD_STEPS.map(step => step.label);

  const handleClose = () => {
    if (!isUploading && !saving) {
      reset();
      setSelectedAccount(null);
      setSaving(false);
      setSaved(false);
      onClose();
    }
  };

  const handleUploadComplete = async (response: any) => {
    try {
      await uploadFile(response.file || new File([], 'temp.pdf')); // Temporary workaround
      nextStep();
    } catch (error) {
      console.error('[License Wizard] Upload failed:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const finalData = {
        account: selectedAccount,
        licenseData,
        documentUrl: null, // Will be provided by upload
      };

      if (onSave) {
        await onSave(finalData);
      }

      setSaved(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('[License Wizard] Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <AccountSelectStep
            selectedAccount={selectedAccount}
            onAccountSelect={setSelectedAccount}
            onNext={nextStep}
            isActive={true}
            isCompleted={!!selectedAccount}
          />
        );

      case 1:
        return (
          <DocumentUploadStep
            onUploadComplete={handleUploadComplete}
            onNext={nextStep}
            onPrevious={previousStep}
            isUploading={isUploading}
            error={error}
            isActive={true}
            isCompleted={!!licenseData}
          />
        );

      case 2:
        return licenseData ? (
          <DataReviewStep
            licenseData={licenseData}
            onNext={nextStep}
            onPrevious={previousStep}
            isActive={true}
            isCompleted={false}
          />
        ) : null;

      case 3:
        return (
          <ConfirmationStep
            onSave={handleSave}
            onPrevious={previousStep}
            isSaving={saving}
            saved={saved}
            isActive={true}
            isCompleted={saved}
          />
        );

      default:
        return null;
    }
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      disableEscapeKeyDown={isUploading || saving}
    >
      <DialogTitleStyled>
        License Upload Wizard
        <IconButton
          onClick={handleClose}
          disabled={isUploading || saving}
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitleStyled>

      <DialogContent sx={{ p: 3 }}>
        <ProgressIndicator
          currentStep={currentStep}
          steps={stepLabels}
        />

        {renderStep()}
      </DialogContent>
    </StyledDialog>
  );
};