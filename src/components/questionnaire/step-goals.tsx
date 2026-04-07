'use client';

import { useState } from 'react';
import {
  Loader2,
  ArrowLeft,
  Sparkles,
  Check,
  Zap,
  DollarSign,
  TrendingUp,
  Heart,
  Brain,
  GitMerge,
  PenTool,
  Target,
  Timer,
  UsersRound,
} from 'lucide-react';
import { GOAL_OPTIONS } from '@/lib/constants';
import { useOnboardingStore } from '@/stores/onboarding-store';

const GOAL_ICONS = [
  Zap,
  DollarSign,
  TrendingUp,
  Heart,
  Brain,
  GitMerge,
  PenTool,
  Target,
  Timer,
  UsersRound,
];

interface StepGoalsProps {
  onSubmit: (lastStepData?: Partial<{ selectedGoals: string[]; customGoals: string }>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function StepGoals({ onSubmit: handleFinalSubmit, onBack, isSubmitting }: StepGoalsProps) {
  const { formData, updateFormData } = useOnboardingStore();
  const [selected, setSelected] = useState<string[]>(formData.selectedGoals);
  const [custom, setCustom] = useState(formData.customGoals);
  const [error, setError] = useState('');

  const toggleOption = (option: string) => {
    setSelected((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
    setError('');
  };

  const onSubmit = () => {
    if (selected.length === 0 && !custom.trim()) {
      setError('Select at least one goal or describe your own');
      return;
    }
    // Update store first, then submit with the latest data merged in
    const updatedFields = {
      selectedGoals: selected,
      customGoals: custom.trim(),
    };
    updateFormData(updatedFields);
    handleFinalSubmit(updatedFields);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1C1917]">
          What do you want to achieve?
        </h2>
        <p className="mt-2 text-sm text-[#78716C]">
          Last step! Select the outcomes that matter most to your organization.
        </p>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {GOAL_OPTIONS.map((option, index) => {
          const isSelected = selected.includes(option);
          const Icon = GOAL_ICONS[index] || Sparkles;

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              disabled={isSubmitting}
              className={`group relative flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                isSelected
                  ? 'border-[#1C1917] bg-[#FAFAF9] shadow-sm'
                  : 'border-[#E7E5E4] bg-white hover:border-[#D6D3D1] hover:shadow-sm'
              }`}
            >
              {/* Icon */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-[#1C1917]'
                    : 'bg-[#F5F5F4] group-hover:bg-[#E7E5E4]'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isSelected ? 'text-white' : 'text-[#78716C]'
                  }`}
                />
              </div>

              {/* Label */}
              <span
                className={`flex-1 text-sm font-medium leading-snug ${
                  isSelected ? 'text-[#1C1917]' : 'text-[#44403C]'
                }`}
              >
                {option}
              </span>

              {/* Checkmark */}
              {isSelected && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1C1917]">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom input */}
      <div className="space-y-2">
        <label
          htmlFor="customGoals"
          className="block text-sm font-semibold text-[#1C1917]"
        >
          Anything else you&apos;d like AI to help with?
        </label>
        <div className="rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] transition-all focus-within:border-[#1C1917] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1C1917]/10">
          <textarea
            id="customGoals"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setError('');
            }}
            rows={3}
            placeholder="Describe specific outcomes or use cases..."
            disabled={isSubmitting}
            className="w-full resize-none rounded-xl border-0 bg-transparent px-4 py-3 text-sm text-[#1C1917] outline-none placeholder:text-[#A8A29E] disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {error && <p className="text-xs text-[#EF4444]">{error}</p>}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex h-11 items-center gap-2 text-sm font-semibold text-[#78716C] transition-colors hover:text-[#1C1917] disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1C1917] px-6 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Complete Setup
            </>
          )}
        </button>
      </div>
    </div>
  );
}
