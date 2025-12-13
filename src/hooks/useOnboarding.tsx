import { useState, useEffect, useCallback } from "react";

const ONBOARDING_KEY = "wellwell_onboarding_seen";

interface OnboardingState {
  voiceInput: boolean;
  insights: boolean;
  virtueBalance: boolean;
  navigation: boolean;
}

const defaultState: OnboardingState = {
  voiceInput: false,
  insights: false,
  virtueBalance: false,
  navigation: false,
};

export function useOnboarding() {
  const [seen, setSeen] = useState<OnboardingState>(() => {
    try {
      const stored = localStorage.getItem(ONBOARDING_KEY);
      return stored ? JSON.parse(stored) : defaultState;
    } catch {
      return defaultState;
    }
  });

  const [currentStep, setCurrentStep] = useState<keyof OnboardingState | null>(null);

  // Determine which tooltip to show (first unseen)
  useEffect(() => {
    const steps: (keyof OnboardingState)[] = ["voiceInput", "insights", "virtueBalance", "navigation"];
    const nextStep = steps.find((step) => !seen[step]);
    setCurrentStep(nextStep || null);
  }, [seen]);

  const markSeen = useCallback((step: keyof OnboardingState) => {
    setSeen((prev) => {
      const updated = { ...prev, [step]: true };
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const skipAll = useCallback(() => {
    const allSeen: OnboardingState = {
      voiceInput: true,
      insights: true,
      virtueBalance: true,
      navigation: true,
    };
    setSeen(allSeen);
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(allSeen));
  }, []);

  const resetOnboarding = useCallback(() => {
    setSeen(defaultState);
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(defaultState));
  }, []);

  const isComplete = Object.values(seen).every(Boolean);

  return {
    seen,
    currentStep,
    markSeen,
    skipAll,
    resetOnboarding,
    isComplete,
  };
}
