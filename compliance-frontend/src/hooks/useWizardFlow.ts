import { useState, useCallback } from 'react';
import type { WizardState, WizardActions } from '../types/wizard';
import { WIZARD_STEPS } from '../types/wizard';

/**
 * Custom hook for managing wizard flow state and navigation
 */
export const useWizardFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const wizardState: WizardState = {
    currentStep,
    steps: WIZARD_STEPS.map((step, index) => ({
      id: step.id,
      label: step.label,
      isCompleted: completedSteps.has(index),
      isActive: index === currentStep,
      isDisabled: index > currentStep && !completedSteps.has(index - 1),
    })),
    canGoNext: currentStep < WIZARD_STEPS.length - 1,
    canGoPrevious: currentStep > 0,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === WIZARD_STEPS.length - 1,
  };

  const nextStep = useCallback(() => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < WIZARD_STEPS.length) {
      setCurrentStep(stepIndex);
    }
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
  }, []);

  const updateStepCompletion = useCallback((stepIndex: number, isCompleted: boolean) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (isCompleted) {
        newSet.add(stepIndex);
      } else {
        newSet.delete(stepIndex);
      }
      return newSet;
    });
  }, []);

  const actions: WizardActions = {
    nextStep,
    previousStep,
    goToStep,
    reset,
    updateStepCompletion,
  };

  return {
    ...wizardState,
    ...actions,
  };
};