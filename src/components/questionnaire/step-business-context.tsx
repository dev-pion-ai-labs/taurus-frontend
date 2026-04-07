'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowLeft, ArrowRight, Briefcase, TrendingUp } from 'lucide-react';
import { useOnboardingStore } from '@/stores/onboarding-store';

const schema = z.object({
  businessDescription: z
    .string()
    .min(10, 'Please provide at least 10 characters'),
  revenueStreams: z
    .string()
    .min(10, 'Please provide at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

interface StepBusinessContextProps {
  onNext: () => void;
  onBack: () => void;
  isSaving: boolean;
}

export function StepBusinessContext({
  onNext,
  onBack,
  isSaving,
}: StepBusinessContextProps) {
  const { formData, updateFormData } = useOnboardingStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessDescription: formData.businessDescription,
      revenueStreams: formData.revenueStreams,
    },
  });

  const onSubmit = (data: FormData) => {
    updateFormData(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1C1917]">
          Business Context
        </h2>
        <p className="mt-2 text-sm text-[#78716C]">
          Help our AI understand what your company does and how it generates value
        </p>
      </div>

      {/* Business description card */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F5F5F4]">
            <Briefcase className="h-3.5 w-3.5 text-[#78716C]" />
          </div>
          <label
            htmlFor="businessDescription"
            className="text-sm font-semibold text-[#1C1917]"
          >
            What does your company do?
          </label>
        </div>
        <div className="rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] transition-all focus-within:border-[#1C1917] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1C1917]/10">
          <textarea
            {...register('businessDescription')}
            id="businessDescription"
            rows={5}
            placeholder="Describe your products, services, and core value proposition..."
            disabled={isSaving}
            className="w-full resize-none rounded-xl border-0 bg-transparent px-4 py-3.5 text-sm text-[#1C1917] outline-none placeholder:text-[#A8A29E] disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        {errors.businessDescription && (
          <p className="text-xs text-[#EF4444]">
            {errors.businessDescription.message}
          </p>
        )}
      </div>

      {/* Revenue streams card */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F5F5F4]">
            <TrendingUp className="h-3.5 w-3.5 text-[#78716C]" />
          </div>
          <label
            htmlFor="revenueStreams"
            className="text-sm font-semibold text-[#1C1917]"
          >
            Key revenue streams
          </label>
        </div>
        <div className="rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] transition-all focus-within:border-[#1C1917] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1C1917]/10">
          <textarea
            {...register('revenueStreams')}
            id="revenueStreams"
            rows={4}
            placeholder="e.g. SaaS subscriptions, consulting services, marketplace commissions..."
            disabled={isSaving}
            className="w-full resize-none rounded-xl border-0 bg-transparent px-4 py-3.5 text-sm text-[#1C1917] outline-none placeholder:text-[#A8A29E] disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        {errors.revenueStreams && (
          <p className="text-xs text-[#EF4444]">
            {errors.revenueStreams.message}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="inline-flex h-11 items-center gap-2 text-sm font-semibold text-[#78716C] transition-colors hover:text-[#1C1917] disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1C1917] px-6 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
