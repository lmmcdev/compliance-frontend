import React from 'react';
import { Box, Typography } from '@mui/material';
import type { LicenseData } from '../../../types/license';
import { useLicenseFields } from '../../../hooks/useLicenseFields';
import { LicenseMetadata } from '../fields/LicenseMetadata';
import { LicenseFieldList } from '../fields/LicenseFieldList';
import { WizardNavigation } from '../common/WizardNavigation';
import type { StepComponentProps } from '../../../types/wizard';

interface DataReviewStepProps extends StepComponentProps {
  licenseData: LicenseData;
  disabled?: boolean;
}

export const DataReviewStep: React.FC<DataReviewStepProps> = ({
  licenseData,
  onNext,
  onPrevious,
  disabled = false,
}) => {
  const {
    fields,
    editableFields,
    isEditing,
    updateField,
    startEditing,
    stopEditing,
    cancelEdit,
  } = useLicenseFields(licenseData);

  const handleFieldChange = (fieldName: string, value: string) => {
    updateField(fieldName, value);
  };

  const handleFieldEdit = (fieldName: string) => {
    startEditing(fieldName);
  };

  const handleFieldSave = (fieldName: string) => {
    stopEditing(fieldName);
  };

  const handleFieldCancel = (fieldName: string) => {
    cancelEdit(fieldName);
  };

  const canProceed = fields.length > 0;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
        Review & Edit License Information
      </Typography>

      <LicenseMetadata data={licenseData} />

      <LicenseFieldList
        fields={fields}
        editableFields={editableFields}
        isEditing={isEditing}
        onFieldEdit={handleFieldEdit}
        onFieldSave={handleFieldSave}
        onFieldCancel={handleFieldCancel}
        onFieldChange={handleFieldChange}
        disabled={disabled}
      />

      <WizardNavigation
        onNext={onNext}
        onPrevious={onPrevious}
        canGoNext={canProceed}
        canGoPrevious={true}
        nextDisabled={!canProceed}
        nextLabel="Save License"
      />
    </Box>
  );
};