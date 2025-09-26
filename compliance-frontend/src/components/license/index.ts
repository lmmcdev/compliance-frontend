// Main components
export { LicenseWizard } from './LicenseWizard';

// Step components
export { AccountSelectStep } from './steps/AccountSelectStep';
export { DocumentUploadStep } from './steps/DocumentUploadStep';
export { DataReviewStep } from './steps/DataReviewStep';
export { ConfirmationStep } from './steps/ConfirmationStep';

// Field components
export { LicenseFieldCard } from './fields/LicenseFieldCard';
export { LicenseFieldList } from './fields/LicenseFieldList';
export { LicenseMetadata } from './fields/LicenseMetadata';

// Common components
export { WizardNavigation } from './common/WizardNavigation';
export { ProgressIndicator } from './common/ProgressIndicator';

// Hooks
export { useWizardFlow } from '../../hooks/useWizardFlow';
export { useLicenseUpload } from '../../hooks/useLicenseUpload';
export { useLicenseFields } from '../../hooks/useLicenseFields';

// Types
export type { LicenseData, LicenseField, LicenseUploadState } from '../../types/license';
export type { WizardState, WizardActions, StepComponentProps } from '../../types/wizard';

// Utils
export { extractFields, getValidFields, getFieldCount } from '../../utils/fieldExtractor';
export { parseLicenseResponse, validateLicenseData } from '../../utils/licenseDataParser';