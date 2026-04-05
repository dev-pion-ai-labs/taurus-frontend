'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useSendOtp, useVerifyOtp } from '@/hooks/use-auth';
import { useMe } from '@/hooks/use-user';
import { useAuthStore } from '@/stores/auth-store';
import { OtpInput } from '@/components/auth/otp-input';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const emailSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

type EmailFormData = z.infer<typeof emailSchema>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RESEND_COOLDOWN = 60;

// ---------------------------------------------------------------------------
// Login Page
// ---------------------------------------------------------------------------

export default function LoginPage() {
  const router = useRouter();

  // Auth state
  const { accessToken, hydrated } = useAuthStore();

  // Steps: 'email' | 'otp'
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');

  // Resend cooldown
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Mutations
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  // User query (enabled only when tokens are set)
  const { data: user, isLoading: isLoadingUser } = useMe();

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  // ---------------------------------------------------------------------------
  // Redirect if already authenticated
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!hydrated) return;
    if (accessToken && user) {
      if (user.organizationId) {
        router.replace('/dashboard');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [hydrated, accessToken, user, router]);

  // ---------------------------------------------------------------------------
  // Redirect after verify succeeds and user loads
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (verifyOtp.isSuccess && user) {
      if (user.organizationId) {
        router.replace('/dashboard');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [verifyOtp.isSuccess, user, router]);

  // ---------------------------------------------------------------------------
  // Resend cooldown timer
  // ---------------------------------------------------------------------------

  const startResendTimer = useCallback(() => {
    setResendTimer(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const onSendOtp = useCallback(
    (data: EmailFormData) => {
      sendOtp.mutate(data.email, {
        onSuccess: () => {
          setSubmittedEmail(data.email);
          setStep('otp');
          setOtpValue('');
          startResendTimer();
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to send verification code');
        },
      });
    },
    [sendOtp, startResendTimer]
  );

  const onVerifyOtp = useCallback(() => {
    if (otpValue.length !== 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }

    verifyOtp.mutate(
      { email: submittedEmail, code: otpValue },
      {
        onError: (error) => {
          toast.error(error.message || 'Invalid verification code');
          setOtpValue('');
        },
      }
    );
  }, [otpValue, submittedEmail, verifyOtp]);

  const onResendCode = useCallback(() => {
    if (resendTimer > 0) return;
    sendOtp.mutate(submittedEmail, {
      onSuccess: () => {
        toast.success('Verification code resent');
        startResendTimer();
        setOtpValue('');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to resend code');
      },
    });
  }, [resendTimer, submittedEmail, sendOtp, startResendTimer]);

  const onChangeEmail = useCallback(() => {
    setStep('email');
    setOtpValue('');
    setResendTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // ---------------------------------------------------------------------------
  // Show nothing until hydration completes
  // ---------------------------------------------------------------------------

  if (!hydrated) return null;

  // If already logged in with user, show nothing while redirecting
  if (accessToken && user) return null;

  // Show a brief loading state after verify succeeds while user is loading
  const isPostVerifyLoading = verifyOtp.isSuccess && isLoadingUser;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F4] px-4">
      <div className="w-full max-w-[400px]">
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
          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <div className="mb-6 text-center">
                  <h2 className="text-lg font-semibold text-[#1C1917]">
                    Welcome back
                  </h2>
                  <p className="mt-1 text-sm text-[#78716C]">
                    Enter your email to sign in to your account
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSendOtp)} className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-[#1C1917]"
                    >
                      Email address
                    </label>
                    <input
                      {...register('email')}
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      autoComplete="email"
                      autoFocus
                      disabled={sendOtp.isPending}
                      className="h-10 w-full rounded-[8px] border border-[#E7E5E4] bg-white px-3 text-sm text-[#1C1917] outline-none transition-colors placeholder:text-[#A8A29E] focus:border-[#1C1917] focus:ring-2 focus:ring-[#1C1917]/10 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-[#EF4444]">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={sendOtp.isPending}
                    className="flex h-10 w-full items-center justify-center rounded-[8px] bg-[#1C1917] text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sendOtp.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Send Code'
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <div className="mb-6 text-center">
                  <h2 className="text-lg font-semibold text-[#1C1917]">
                    Check your email
                  </h2>
                  <p className="mt-1 text-sm text-[#78716C]">
                    We sent a code to{' '}
                    <span className="font-medium text-[#1C1917]">
                      {submittedEmail}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={onChangeEmail}
                    className="mt-1 text-xs font-medium text-[#78716C] underline underline-offset-2 transition-colors hover:text-[#1C1917]"
                  >
                    Change email
                  </button>
                </div>

                <div className="space-y-5">
                  <OtpInput
                    value={otpValue}
                    onChange={setOtpValue}
                    disabled={verifyOtp.isPending || isPostVerifyLoading}
                  />

                  <button
                    type="button"
                    onClick={onVerifyOtp}
                    disabled={
                      otpValue.length !== 6 ||
                      verifyOtp.isPending ||
                      isPostVerifyLoading
                    }
                    className="flex h-10 w-full items-center justify-center rounded-[8px] bg-[#1C1917] text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {verifyOtp.isPending || isPostVerifyLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Verify'
                    )}
                  </button>

                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-xs text-[#A8A29E]">
                        Resend code in{' '}
                        <span className="font-medium tabular-nums text-[#78716C]">
                          {resendTimer}s
                        </span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={onResendCode}
                        disabled={sendOtp.isPending}
                        className="text-xs font-medium text-[#78716C] underline underline-offset-2 transition-colors hover:text-[#1C1917] disabled:opacity-50"
                      >
                        {sendOtp.isPending ? 'Sending...' : 'Resend code'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[#A8A29E]">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
