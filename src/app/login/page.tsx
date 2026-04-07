'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, ArrowRight, BarChart3, Zap, Shield } from 'lucide-react';
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
      if (!user.organizationId) {
        router.replace('/onboarding');
      } else if (!user.onboardingCompleted) {
        router.replace('/questionnaire');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [hydrated, accessToken, user, router]);

  // ---------------------------------------------------------------------------
  // Redirect after verify succeeds and user loads
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (verifyOtp.isSuccess && user) {
      if (!user.organizationId) {
        router.replace('/onboarding');
      } else if (!user.onboardingCompleted) {
        router.replace('/questionnaire');
      } else {
        router.replace('/dashboard');
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
    <div className="flex min-h-screen">
      {/* Left Panel — Brand / Visual */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background:
            'linear-gradient(135deg, #1C1917 0%, #292524 40%, #1C1917 100%)',
        }}
      >
        {/* Decorative gradient orbs */}
        <div
          className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-30 blur-[120px]"
          style={{ background: 'linear-gradient(135deg, #E11D48, #F59E0B)' }}
        />
        <div
          className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-20 blur-[100px]"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #E11D48)' }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Top — Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-[20px] font-bold tracking-tight text-white">
              Taurus
            </span>
          </div>
        </div>

        {/* Center — Hero Content */}
        <div className="relative z-10 max-w-md">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[40px] font-bold leading-[1.1] tracking-tight text-white mb-4"
          >
            Your AI
            <br />
            Transformation
            <br />
            Starts Here.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-[16px] leading-relaxed text-white/60 mb-10 max-w-sm"
          >
            Discover, strategize, and implement AI across your
            organization with precision and measurable ROI.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col gap-3"
          >
            {[
              { icon: BarChart3, text: 'AI maturity assessment with $ values' },
              { icon: Zap, text: 'Industry-specific transformation roadmap' },
              { icon: Shield, text: 'Board-ready reports in minutes' },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-3 rounded-xl bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] px-4 py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <item.icon className="h-4 w-4 text-white/70" />
                </div>
                <span className="text-[13px] font-medium text-white/70">
                  {item.text}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom — Footer */}
        <div className="relative z-10">
          <p className="text-[12px] text-white/30">
            &copy; {new Date().getFullYear()} MARQAIT AI. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex w-full lg:w-1/2 xl:w-[45%] items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo — only on small screens */}
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1C1917]">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-[20px] font-bold tracking-tight text-[#1C1917]">
                Taurus
              </span>
            </div>
          </div>

          {/* Form Card */}
          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <div className="mb-8">
                  <h2 className="text-[28px] font-bold tracking-tight text-[#1C1917]">
                    Welcome back
                  </h2>
                  <p className="mt-2 text-[15px] text-[#78716C]">
                    Enter your email to sign in to your account
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSendOtp)} className="space-y-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-[13px] font-medium text-[#1C1917]"
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
                      className="h-12 w-full rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] px-4 text-[14px] text-[#1C1917] outline-none transition-all placeholder:text-[#A8A29E] focus:border-[#1C1917] focus:bg-white focus:ring-2 focus:ring-[#1C1917]/10 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {errors.email && (
                      <p className="mt-2 text-xs text-[#EF4444]">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={sendOtp.isPending}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1C1917] text-[14px] font-semibold text-white transition-all hover:bg-[#292524] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sendOtp.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-[12px] text-[#A8A29E]">
                  By continuing, you agree to our Terms of Service
                  <br />
                  and Privacy Policy.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <div className="mb-8">
                  <h2 className="text-[28px] font-bold tracking-tight text-[#1C1917]">
                    Check your email
                  </h2>
                  <p className="mt-2 text-[15px] text-[#78716C]">
                    We sent a 6-digit code to{' '}
                    <span className="font-medium text-[#1C1917]">
                      {submittedEmail}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={onChangeEmail}
                    className="mt-1.5 text-[13px] font-medium text-[#E11D48] transition-colors hover:text-[#BE123C]"
                  >
                    Change email
                  </button>
                </div>

                <div className="space-y-6">
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
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1C1917] text-[14px] font-semibold text-white transition-all hover:bg-[#292524] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {verifyOtp.isPending || isPostVerifyLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Verify & Sign In
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-[13px] text-[#A8A29E]">
                        Resend code in{' '}
                        <span className="font-semibold tabular-nums text-[#78716C]">
                          {resendTimer}s
                        </span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={onResendCode}
                        disabled={sendOtp.isPending}
                        className="text-[13px] font-medium text-[#78716C] underline underline-offset-2 transition-colors hover:text-[#1C1917] disabled:opacity-50"
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
      </div>
    </div>
  );
}
