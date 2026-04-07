'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useMe, useUpdateMe } from '@/hooks/use-user';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// ---------------------------------------------------------------------------
// Onboarding Page — Profile Only
// ---------------------------------------------------------------------------

export default function OnboardingPage() {
  const router = useRouter();
  const { accessToken, hydrated } = useAuthStore();
  const { data: user, isLoading: isLoadingUser } = useMe();

  const updateMe = useUpdateMe();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });

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
    // If user already has name set, skip to questionnaire or dashboard
    if (user.firstName && user.lastName) {
      if (user.onboardingCompleted) {
        router.replace('/dashboard');
      } else {
        router.replace('/questionnaire');
      }
    }
  }, [hydrated, isLoadingUser, user, router]);

  // ---------------------------------------------------------------------------
  // Handler
  // ---------------------------------------------------------------------------

  const onSubmit = (data: ProfileFormData) => {
    updateMe.mutate(data, {
      onSuccess: () => {
        router.replace('/questionnaire');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update profile');
      },
    });
  };

  // ---------------------------------------------------------------------------
  // Guards
  // ---------------------------------------------------------------------------

  if (!hydrated) return null;
  if (!accessToken) return null;
  if (isLoadingUser) return null;
  if (user?.firstName && user?.lastName) return null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F4] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-[440px]"
      >
        {/* Wordmark */}
        <div className="mb-8 text-center">
          <h1 className="text-[20px] font-bold tracking-tight text-[#1C1917]">
            Taurus
          </h1>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-[#E7E5E4] bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-[#1C1917]">
              Complete your profile
            </h2>
            <p className="mt-1.5 text-sm text-[#78716C]">
              Tell us a bit about yourself to get started
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="firstName"
                className="mb-1.5 block text-sm font-medium text-[#1C1917]"
              >
                First name
              </label>
              <input
                {...register('firstName')}
                id="firstName"
                type="text"
                placeholder="John"
                autoFocus
                disabled={updateMe.isPending}
                className="h-11 w-full rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] px-4 text-sm text-[#1C1917] outline-none transition-all placeholder:text-[#A8A29E] focus:border-[#1C1917] focus:bg-white focus:ring-2 focus:ring-[#1C1917]/10 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.firstName && (
                <p className="mt-1.5 text-xs text-[#EF4444]">
                  {errors.firstName.message}
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
                {...register('lastName')}
                id="lastName"
                type="text"
                placeholder="Doe"
                disabled={updateMe.isPending}
                className="h-11 w-full rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] px-4 text-sm text-[#1C1917] outline-none transition-all placeholder:text-[#A8A29E] focus:border-[#1C1917] focus:bg-white focus:ring-2 focus:ring-[#1C1917]/10 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.lastName && (
                <p className="mt-1.5 text-xs text-[#EF4444]">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={updateMe.isPending}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1C1917] text-sm font-semibold text-white transition-all hover:bg-[#292524] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateMe.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
