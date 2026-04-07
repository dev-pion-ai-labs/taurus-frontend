'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useMe } from '@/hooks/use-user';
import {
  useOnboardingStatus,
  useSaveOnboardingProgress,
  useSubmitOnboarding,
} from '@/hooks/use-onboarding';
import { StepProgress, MobileProgress } from '@/components/questionnaire/step-progress';
import { StepBasicInfo } from '@/components/questionnaire/step-basic-info';
import { StepBusinessContext } from '@/components/questionnaire/step-business-context';
import { StepChallenges } from '@/components/questionnaire/step-challenges';
import { StepDataAvailability } from '@/components/questionnaire/step-data-availability';
import { StepDocuments } from '@/components/questionnaire/step-documents';
import { StepTools } from '@/components/questionnaire/step-tools';
import { StepGoals } from '@/components/questionnaire/step-goals';
import { QUESTIONNAIRE_STEPS } from '@/lib/constants';

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------

const contentVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 24 : -24,
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    y: direction > 0 ? -24 : 24,
    opacity: 0,
  }),
};

// ---------------------------------------------------------------------------
// Questionnaire Page
// ---------------------------------------------------------------------------

export default function QuestionnairePage() {
  const router = useRouter();
  const { accessToken, hydrated } = useAuthStore();
  const { data: user, isLoading: isLoadingUser } = useMe();
  const { data: onboardingStatus } = useOnboardingStatus();

  const {
    currentStep,
    formData,
    setStep,
    updateFormData,
    initialize,
    reset,
  } = useOnboardingStore();

  const [direction, setDirection] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [initialized, setInitialized] = useState(false);
  // Tracks whether each step has been validated (for enabling the nav buttons)
  const [stepValid, setStepValid] = useState(false);

  const saveProgress = useSaveOnboardingProgress();
  const submitOnboarding = useSubmitOnboarding();

  const totalSteps = QUESTIONNAIRE_STEPS.length;

  // ---------------------------------------------------------------------------
  // Initialize from backend state (resume capability)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (initialized || !user) return;

    if (!formData.companyName && user.organization) {
      updateFormData({
        companyName: user.organization.name,
        industryId: user.organization.industryId,
        companySize: user.organization.size || '',
      });
    }

    if (onboardingStatus?.data && onboardingStatus.currentStep > 1) {
      initialize(
        onboardingStatus.data,
        onboardingStatus.currentStep,
        onboardingStatus.documents || []
      );
    }

    setInitialized(true);
  }, [initialized, user, onboardingStatus, formData.companyName, updateFormData, initialize]);

  // ---------------------------------------------------------------------------
  // Auth guards
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!hydrated) return;
    if (!accessToken) {
      router.replace('/login');
      return;
    }
  }, [hydrated, accessToken, router]);

  useEffect(() => {
    if (!hydrated || isLoadingUser || !user) return;
    if (!user.organizationId) {
      router.replace('/onboarding');
      return;
    }
    if (user.onboardingCompleted) {
      router.replace('/dashboard');
      return;
    }
  }, [hydrated, isLoadingUser, user, router]);

  // ---------------------------------------------------------------------------
  // Save progress to backend (fire-and-forget)
  // ---------------------------------------------------------------------------

  const persistProgress = useCallback(
    (step: number) => {
      saveProgress.mutate(
        { step, data: formData },
        { onError: () => {} }
      );
    },
    [saveProgress, formData]
  );

  // ---------------------------------------------------------------------------
  // Navigation handlers
  // ---------------------------------------------------------------------------

  const goToStep = useCallback(
    (step: number) => {
      setDirection(step > currentStep ? 1 : -1);
      setStep(step);
      setStepValid(false);
      persistProgress(step);
    },
    [currentStep, setStep, persistProgress]
  );

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, totalSteps, goToStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  // ---------------------------------------------------------------------------
  // Final submission
  // ---------------------------------------------------------------------------

  const handleFinalSubmit = useCallback(() => {
    submitOnboarding.mutate(formData, {
      onSuccess: () => {
        setShowSuccess(true);
        reset();
        setTimeout(() => {
          router.replace('/dashboard');
        }, 2000);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to submit. Please try again.');
      },
    });
  }, [submitOnboarding, formData, reset, router]);

  // ---------------------------------------------------------------------------
  // Guard renders
  // ---------------------------------------------------------------------------

  if (!hydrated) return null;
  if (!accessToken) return null;
  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F4]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[#1C1917] border-t-transparent animate-spin" />
          <p className="text-sm text-[#78716C]">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user?.organizationId) return null;
  if (user?.onboardingCompleted) return null;

  // ---------------------------------------------------------------------------
  // Success overlay
  // ---------------------------------------------------------------------------

  if (showSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F4] px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col items-center gap-5"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1C1917]"
          >
            <Check className="h-10 w-10 text-white" strokeWidth={3} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-center"
          >
            <p className="text-2xl font-bold text-[#1C1917]">
              You&apos;re all set!
            </p>
            <p className="mt-2 text-sm text-[#78716C]">
              Preparing your personalized dashboard...
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const isSaving = saveProgress.isPending;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex min-h-screen bg-[#F5F5F4]">
      {/* ─── Left Sidebar (desktop) ─── */}
      <aside className="hidden lg:flex lg:w-[380px] xl:w-[420px] shrink-0 flex-col border-r border-[#E7E5E4] bg-white px-8 py-10 xl:px-10">
        {/* Wordmark */}
        <h1
          className="text-[22px] font-bold tracking-tight text-[#1C1917]"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Taurus
        </h1>

        {/* Heading */}
        <div className="mt-8 mb-10">
          <h2 className="text-[28px] font-bold leading-tight text-[#1C1917]">
            Set up your
            <br />
            AI workspace
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#78716C]">
            Complete these {totalSteps} steps so we can tailor the
            best experience for your organization.
          </p>
        </div>

        {/* Vertical step nav */}
        <StepProgress currentStep={currentStep} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <p className="text-xs text-[#A8A29E]">
          Progress saved automatically.
          <br />
          You can close and return anytime.
        </p>
      </aside>

      {/* ─── Right Content ─── */}
      <main className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-20 border-b border-[#E7E5E4] bg-white px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between mb-3">
            <h1
              className="text-[18px] font-bold tracking-tight text-[#1C1917]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Taurus
            </h1>
            <span className="text-xs font-medium text-[#A8A29E]">
              Set up your AI workspace
            </span>
          </div>
          <MobileProgress currentStep={currentStep} />
        </div>

        {/* Content area */}
        <div className="flex flex-1 flex-col items-center px-4 py-8 sm:px-8 lg:justify-center lg:py-12">
          <div className="w-full max-w-[680px]">
            {/* Step number badge */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1C1917] text-sm font-bold text-white">
                  {String(currentStep).padStart(2, '0')}
                </span>
                <span className="hidden text-sm font-medium text-[#78716C] sm:block">
                  {QUESTIONNAIRE_STEPS[currentStep - 1]?.description}
                </span>
              </div>
            </div>

            {/* Step content card */}
            <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6 shadow-sm sm:p-8 lg:p-10">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`step-${currentStep}`}
                  custom={direction}
                  variants={contentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {currentStep === 1 && (
                    <StepBasicInfo onNext={handleNext} isSaving={isSaving} />
                  )}
                  {currentStep === 2 && (
                    <StepBusinessContext onNext={handleNext} onBack={handleBack} isSaving={isSaving} />
                  )}
                  {currentStep === 3 && (
                    <StepChallenges onNext={handleNext} onBack={handleBack} isSaving={isSaving} />
                  )}
                  {currentStep === 4 && (
                    <StepDataAvailability onNext={handleNext} onBack={handleBack} isSaving={isSaving} />
                  )}
                  {currentStep === 5 && (
                    <StepDocuments onNext={handleNext} onBack={handleBack} isSaving={isSaving} />
                  )}
                  {currentStep === 6 && (
                    <StepTools onNext={handleNext} onBack={handleBack} isSaving={isSaving} />
                  )}
                  {currentStep === 7 && (
                    <StepGoals
                      onSubmit={handleFinalSubmit}
                      onBack={handleBack}
                      isSubmitting={submitOnboarding.isPending}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
