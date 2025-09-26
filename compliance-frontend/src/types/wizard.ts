export interface WizardStep {
  id: string;
  label: string;
  isCompleted: boolean;
  isActive: boolean;
  isDisabled: boolean;
}

export interface WizardState {
  currentStep: number;
  steps: WizardStep[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export interface WizardActions {
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (stepIndex: number) => void;
  reset: () => void;
  updateStepCompletion: (stepIndex: number, isCompleted: boolean) => void;
}

export interface StepComponentProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onStepChange?: (stepIndex: number) => void;
  isActive: boolean;
  isCompleted: boolean;
}

export const WIZARD_STEPS = [
  { id: 'account', label: 'Select Account' },
  { id: 'upload', label: 'Upload Document' },
  { id: 'review', label: 'Review Data' },
  { id: 'save', label: 'Save License' }
] as const;

export type WizardStepId = typeof WIZARD_STEPS[number]['id'];