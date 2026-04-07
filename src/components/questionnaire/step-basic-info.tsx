'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowRight, Building2, Users } from 'lucide-react';
import { IndustryCombobox } from '@/components/onboarding/industry-combobox';
import { COMPANY_SIZES } from '@/lib/constants';
import { useOnboardingStore } from '@/stores/onboarding-store';

const schema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  industryId: z.string().min(1, 'Please select an industry'),
  customIndustry: z.string().optional(),
  companySize: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const SIZE_LABELS: Record<string, string> = {
  '1-10': 'Startup',
  '11-50': 'Small',
  '51-200': 'Medium',
  '201-500': 'Growing',
  '501-1000': 'Large',
  '1000+': 'Enterprise',
};

interface StepBasicInfoProps {
  onNext: () => void;
  isSaving: boolean;
}

export function StepBasicInfo({ onNext, isSaving }: StepBasicInfoProps) {
  const { formData, updateFormData } = useOnboardingStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: formData.companyName,
      industryId: formData.industryId,
      customIndustry: formData.customIndustry,
      companySize: formData.companySize,
    },
  });

  const industryId = watch('industryId');
  const selectedSize = watch('companySize');

  const onSubmit = (data: FormData) => {
    updateFormData({
      companyName: data.companyName,
      industryId: data.industryId,
      customIndustry: data.customIndustry || '',
      companySize: data.companySize || '',
    });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1C1917]">
          Tell us about your company
        </h2>
        <p className="mt-2 text-sm text-[#78716C]">
          We&apos;ll use this to personalize your AI experience
        </p>
      </div>

      {/* Company name - premium input */}
      <div className="space-y-2">
        <label
          htmlFor="companyName"
          className="block text-sm font-semibold text-[#1C1917]"
        >
          Company Name
        </label>
        <div className="relative">
          <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A8A29E]" />
          <input
            {...register('companyName')}
            id="companyName"
            type="text"
            placeholder="Acme Inc."
            disabled={isSaving}
            className="h-12 w-full rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] pl-10 pr-4 text-sm text-[#1C1917] outline-none transition-all placeholder:text-[#A8A29E] focus:border-[#1C1917] focus:bg-white focus:ring-2 focus:ring-[#1C1917]/10 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        {errors.companyName && (
          <p className="text-xs text-[#EF4444]">{errors.companyName.message}</p>
        )}
      </div>

      {/* Industry */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#1C1917]">
          Industry
        </label>
        <IndustryCombobox
          value={industryId || null}
          onSelect={(id) => {
            setValue('industryId', id, { shouldValidate: true });
          }}
        />
        {errors.industryId && (
          <p className="text-xs text-[#EF4444]">{errors.industryId.message}</p>
        )}

        {/* Custom industry */}
        <input
          {...register('customIndustry')}
          type="text"
          placeholder="Or type a custom industry..."
          disabled={isSaving}
          className="h-12 w-full rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] px-4 text-sm text-[#1C1917] outline-none transition-all placeholder:text-[#A8A29E] focus:border-[#1C1917] focus:bg-white focus:ring-2 focus:ring-[#1C1917]/10 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Company size - card grid */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-[#1C1917]">
          How large is your team?
        </label>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {COMPANY_SIZES.map((size) => {
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setValue('companySize', size)}
                disabled={isSaving}
                className={`group relative flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3.5 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isSelected
                    ? 'border-[#1C1917] bg-[#1C1917] shadow-md'
                    : 'border-[#E7E5E4] bg-white hover:border-[#D6D3D1] hover:shadow-sm'
                }`}
              >
                <Users
                  className={`h-4 w-4 transition-colors ${
                    isSelected ? 'text-white' : 'text-[#A8A29E] group-hover:text-[#78716C]'
                  }`}
                />
                <span
                  className={`text-xs font-bold transition-colors ${
                    isSelected ? 'text-white' : 'text-[#1C1917]'
                  }`}
                >
                  {size}
                </span>
                <span
                  className={`text-[10px] transition-colors ${
                    isSelected ? 'text-white/70' : 'text-[#A8A29E]'
                  }`}
                >
                  {SIZE_LABELS[size]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-end pt-2">
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
