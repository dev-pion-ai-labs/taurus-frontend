'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Loader2, Sparkles, Globe } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useMe } from '@/hooks/use-user';
import {
  useOnboardingStatus,
  useSaveOnboardingProgress,
  useSubmitOnboarding,
  useScrapingStatus,
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
import type { OnboardingData } from '@/types';

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
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  // Tracks whether each step has been validated (for enabling the nav buttons)
  const [stepValid, setStepValid] = useState(false);

  const saveProgress = useSaveOnboardingProgress();
  const submitOnboarding = useSubmitOnboarding();
  // Poll scraping as soon as a URL exists (starts at step 1), so we know the
  // result by the time the user finishes the questionnaire.
  // Use submittedUrl as fallback after reset() clears the store.
  const scrapingStatus = useScrapingStatus(!!formData.companyUrl || !!submittedUrl);

  const totalSteps = QUESTIONNAIRE_STEPS.length;

  // ---------------------------------------------------------------------------
  // Initialize from backend state (resume capability)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (initialized || !user) return;

    if (!formData.companyName && user.organization) {
      updateFormData({
        companyName: user.organization.name || '',
        industryId: user.organization.industryId || '',
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
    if (showSuccess) return; // Don't redirect while showing success screen
    if (!user.firstName || !user.lastName) {
      router.replace('/onboarding');
      return;
    }
    if (user.onboardingCompleted) {
      router.replace('/dashboard');
      return;
    }
  }, [hydrated, isLoadingUser, user, router, showSuccess]);

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

  const handleFinalSubmit = useCallback((lastStepData?: Partial<OnboardingData>) => {
    const finalData = lastStepData ? { ...formData, ...lastStepData } : formData;
    // Capture URL before reset clears the store
    setSubmittedUrl(finalData.companyUrl || null);
    submitOnboarding.mutate(finalData, {
      onSuccess: () => {
        setShowSuccess(true);
        reset();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to submit. Please try again.');
      },
    });
  }, [submitOnboarding, formData, reset, router]);

  // No auto-redirect — user controls when to proceed via "Go to Dashboard" button

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
  if (!user?.firstName || !user?.lastName) return null;
  if (user?.onboardingCompleted && !showSuccess) return null;

  // ---------------------------------------------------------------------------
  // Success overlay
  // ---------------------------------------------------------------------------

  if (showSuccess) {
    const scrapeStatus = scrapingStatus.data?.status;
    const scrapedData = scrapingStatus.data?.scrapedContent;
    const hasUrl = !!submittedUrl;
    const isScrapingActive =
      hasUrl &&
      scrapeStatus !== 'COMPLETED' &&
      scrapeStatus !== 'FAILED';
    const scrapingDone = hasUrl && scrapeStatus === 'COMPLETED';
    const scrapingFailed = hasUrl && scrapeStatus === 'FAILED';
    const pagesScraped = scrapedData?.metadata?.pagesScraped;

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F4] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-8 max-w-lg w-full"
        >
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="relative"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#1C1917] shadow-xl shadow-[#1C1917]/20">
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Check className="h-12 w-12 text-white" strokeWidth={2.5} />
              </motion.div>
            </div>
            {/* Subtle glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#1C1917]/10"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
            />
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center space-y-3"
          >
            <h1 className="text-3xl font-bold text-[#1C1917] tracking-tight">
              Setup complete
            </h1>
            <p className="text-base text-[#78716C] leading-relaxed max-w-sm mx-auto">
              {hasUrl && isScrapingActive
                ? 'We\'re analyzing your data and preparing your personalized insights.'
                : hasUrl && scrapingDone
                  ? 'Your data has been analyzed. Your personalized insights are ready.'
                  : 'Your workspace is ready. Let\'s explore what AI can do for your business.'}
            </p>
          </motion.div>

          {/* Background processing card */}
          {hasUrl && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="w-full rounded-2xl border border-[#E7E5E4] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                {isScrapingActive ? (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F4]">
                    <Loader2 className="h-4.5 w-4.5 text-[#1C1917] animate-spin" />
                  </div>
                ) : scrapingDone ? (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
                    <Check className="h-4.5 w-4.5 text-emerald-600" />
                  </div>
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F4]">
                    <Globe className="h-4.5 w-4.5 text-[#78716C]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#1C1917]">
                    {isScrapingActive
                      ? 'Analyzing your business...'
                      : scrapingDone
                        ? 'Analysis complete'
                        : 'Analysis unavailable'}
                  </p>
                  <p className="text-xs text-[#A8A29E] truncate">
                    {submittedUrl}
                  </p>
                </div>
              </div>

              {isScrapingActive && (
                <div>
                  <div className="h-1.5 w-full rounded-full bg-[#F5F5F4] overflow-hidden">
                    <motion.div
                      className="h-full bg-[#1C1917] rounded-full"
                      initial={{ width: '10%' }}
                      animate={{
                        width: scrapeStatus === 'IN_PROGRESS' ? '70%' : '30%',
                      }}
                      transition={{ duration: 4, ease: 'easeInOut' }}
                    />
                  </div>
                  <p className="mt-2.5 text-xs text-[#A8A29E]">
                    {scrapeStatus === 'IN_PROGRESS'
                      ? 'Preparing your recommendations...'
                      : 'Starting analysis...'}
                  </p>
                </div>
              )}

              {scrapingDone && (
                <div className="space-y-3">
                  {pagesScraped && (
                    <p className="text-xs text-[#78716C]">
                      Analyzed {pagesScraped} page{pagesScraped > 1 ? 's' : ''} for insights
                    </p>
                  )}
                  {scrapedData?.businessData && (
                    <div className="flex flex-wrap gap-1.5">
                      {scrapedData.businessData.aiDetected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700">
                          <Sparkles className="h-3 w-3" />
                          AI usage detected
                        </span>
                      )}
                      {scrapedData.businessData.automationDetected && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                          Automation detected
                        </span>
                      )}
                      {scrapedData.businessData.technologies?.length ? (
                        <span className="inline-flex items-center rounded-full bg-[#F5F5F4] px-2.5 py-1 text-[11px] font-medium text-[#57534E]">
                          {scrapedData.businessData.technologies.length} technologies found
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              )}

              {scrapingFailed && (
                <p className="text-sm text-[#78716C]">
                  Website analysis couldn&apos;t complete — no worries, we&apos;ll use the info you provided.
                </p>
              )}
            </motion.div>
          )}

          {/* Hint text */}
          {hasUrl && isScrapingActive && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-xs text-[#A8A29E] text-center"
            >
              This may take a few seconds — you can continue to the dashboard anytime.
            </motion.p>
          )}

          {/* CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <button
              onClick={() => router.replace('/dashboard')}
              className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-[#1C1917] px-8 text-sm font-semibold text-white shadow-lg shadow-[#1C1917]/15 transition-all hover:opacity-90 hover:shadow-xl hover:shadow-[#1C1917]/20 active:scale-[0.98]"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
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
