'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useMe, useUpdateMe } from '@/hooks/use-user';
import { useCreateOrg } from '@/hooks/use-organizations';
import { IndustryCombobox } from '@/components/onboarding/industry-combobox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const orgSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  industryId: z.string().min(1, 'Please select an industry'),
  size: z.string().optional(),
});

type OrgFormData = z.infer<typeof orgSchema>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
] as const;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

// ---------------------------------------------------------------------------
// Onboarding Page
// ---------------------------------------------------------------------------

export default function OnboardingPage() {
  const router = useRouter();
  const { accessToken, hydrated } = useAuthStore();
  const { data: user, isLoading: isLoadingUser } = useMe();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Mutations
  const updateMe = useUpdateMe();
  const createOrg = useCreateOrg();

  // Step 1 form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });

  // Step 2 form
  const {
    register: registerOrg,
    handleSubmit: handleOrgSubmit,
    setValue: setOrgValue,
    watch: watchOrg,
    formState: { errors: orgErrors },
  } = useForm<OrgFormData>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: '',
      industryId: '',
      size: '',
    },
  });

  const industryId = watchOrg('industryId');

  // ---------------------------------------------------------------------------
  // Auth guard & redirect
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
    if (user.organizationId) {
      if (user.onboardingCompleted) {
        router.replace('/dashboard');
      } else {
        router.replace('/questionnaire');
      }
    }
  }, [hydrated, isLoadingUser, user, router]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const onProfileSubmit = (data: ProfileFormData) => {
    updateMe.mutate(data, {
      onSuccess: () => {
        setDirection(1);
        setStep(2);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update profile');
      },
    });
  };

  const onOrgSubmit = (data: OrgFormData) => {
    createOrg.mutate(
      {
        name: data.name,
        industryId: data.industryId,
        size: data.size || undefined,
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
          setTimeout(() => {
            router.replace('/questionnaire');
          }, 1500);
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to create organization');
        },
      }
    );
  };

  const goBack = () => {
    setDirection(-1);
    setStep(1);
  };

  // ---------------------------------------------------------------------------
  // Guard renders
  // ---------------------------------------------------------------------------

  if (!hydrated) return null;
  if (!accessToken) return null;
  if (isLoadingUser) return null;
  if (user?.organizationId) return null;

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
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1C1917]"
          >
            <Check className="h-8 w-8 text-white" strokeWidth={3} />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-lg font-semibold text-[#1C1917]"
          >
            You&apos;re all set!
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F4] px-4">
      <div className="w-full max-w-[480px]">
        {/* Wordmark */}
        <div className="mb-8 text-center">
          <h1
            className="text-[20px] font-bold tracking-tight text-[#1C1917]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Taurus
          </h1>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-[#E7E5E4] bg-white p-8 shadow-sm">
          {/* Step indicator */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <span
              className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                step === 1 ? 'bg-[#1C1917]' : 'bg-[#E7E5E4]'
              }`}
            />
            <span
              className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                step === 2 ? 'bg-[#1C1917]' : 'bg-[#E7E5E4]'
              }`}
            />
          </div>

          {/* Steps */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 ? (
                <motion.div
                  key="step-1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="mb-6 text-center">
                    <h2 className="text-lg font-semibold text-[#1C1917]">
                      Complete your profile
                    </h2>
                    <p className="mt-1 text-sm text-[#78716C]">
                      Tell us a bit about yourself
                    </p>
                  </div>

                  <form
                    onSubmit={handleProfileSubmit(onProfileSubmit)}
                    className="space-y-4"
                  >
                    <div>
                      <label
                        htmlFor="firstName"
                        className="mb-1.5 block text-sm font-medium text-[#1C1917]"
                      >
                        First name
                      </label>
                      <input
                        {...registerProfile('firstName')}
                        id="firstName"
                        type="text"
                        placeholder="John"
                        autoFocus
                        disabled={updateMe.isPending}
                        className="h-10 w-full rounded-[8px] border border-[#E7E5E4] bg-white px-3 text-sm text-[#1C1917] outline-none transition-colors placeholder:text-[#A8A29E] focus:border-[#1C1917] focus:ring-2 focus:ring-[#1C1917]/10 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      {profileErrors.firstName && (
                        <p className="mt-1.5 text-xs text-[#EF4444]">
                          {profileErrors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="mb-1.5 block text-sm font-medium text-[#1C1917]"
                      >
                        Last name
                      </label>
                      <input
                        {...registerProfile('lastName')}
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        disabled={updateMe.isPending}
                        className="h-10 w-full rounded-[8px] border border-[#E7E5E4] bg-white px-3 text-sm text-[#1C1917] outline-none transition-colors placeholder:text-[#A8A29E] focus:border-[#1C1917] focus:ring-2 focus:ring-[#1C1917]/10 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      {profileErrors.lastName && (
                        <p className="mt-1.5 text-xs text-[#EF4444]">
                          {profileErrors.lastName.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={updateMe.isPending}
                      className="flex h-10 w-full items-center justify-center rounded-full bg-[#1C1917] text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updateMe.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Continue \u2192'
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="step-2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="mb-6 text-center">
                    <h2 className="text-lg font-semibold text-[#1C1917]">
                      Set up your organization
                    </h2>
                    <p className="mt-1 text-sm text-[#78716C]">
                      We&apos;ll customize your experience based on your industry
                    </p>
                  </div>

                  <form
                    onSubmit={handleOrgSubmit(onOrgSubmit)}
                    className="space-y-4"
                  >
                    <div>
                      <label
                        htmlFor="orgName"
                        className="mb-1.5 block text-sm font-medium text-[#1C1917]"
                      >
                        Organization name
                      </label>
                      <input
                        {...registerOrg('name')}
                        id="orgName"
                        type="text"
                        placeholder="Acme Inc."
                        autoFocus
                        disabled={createOrg.isPending}
                        className="h-10 w-full rounded-[8px] border border-[#E7E5E4] bg-white px-3 text-sm text-[#1C1917] outline-none transition-colors placeholder:text-[#A8A29E] focus:border-[#1C1917] focus:ring-2 focus:ring-[#1C1917]/10 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      {orgErrors.name && (
                        <p className="mt-1.5 text-xs text-[#EF4444]">
                          {orgErrors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#1C1917]">
                        Industry
                      </label>
                      <IndustryCombobox
                        value={industryId || null}
                        onSelect={(id, _name) => {
                          setOrgValue('industryId', id, { shouldValidate: true });
                        }}
                      />
                      {orgErrors.industryId && (
                        <p className="mt-1.5 text-xs text-[#EF4444]">
                          {orgErrors.industryId.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#1C1917]">
                        Company size
                      </label>
                      <Select
                        value={watchOrg('size') || ''}
                        onValueChange={(val) => {
                          if (val) setOrgValue('size', val);
                        }}
                      >
                        <SelectTrigger
                          className="flex h-10 w-full items-center justify-between rounded-[8px] border border-[#E7E5E4] bg-white px-3 text-sm text-[#1C1917] outline-none transition-colors hover:border-[#D6D3D1] focus:border-[#1C1917] focus:ring-2 focus:ring-[#1C1917]/10"
                        >
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPANY_SIZES.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size} employees
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <button
                      type="submit"
                      disabled={createOrg.isPending}
                      className="flex h-10 w-full items-center justify-center rounded-full bg-[#1C1917] text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {createOrg.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Complete Setup \u2192'
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={goBack}
                      disabled={createOrg.isPending}
                      className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-[#78716C] transition-colors hover:text-[#1C1917] disabled:opacity-50"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
