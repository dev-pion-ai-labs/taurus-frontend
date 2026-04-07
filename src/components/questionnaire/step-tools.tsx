'use client';

import { useState } from 'react';
import { Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { TOOL_OPTIONS } from '@/lib/constants';
import { useOnboardingStore } from '@/stores/onboarding-store';

interface StepToolsProps {
  onNext: () => void;
  onBack: () => void;
  isSaving: boolean;
}

export function StepTools({ onNext, onBack, isSaving }: StepToolsProps) {
  const { formData, updateFormData } = useOnboardingStore();
  const [selected, setSelected] = useState<string[]>(formData.selectedTools);
  const [custom, setCustom] = useState(formData.customTools);
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
      setError('Select at least one tool or describe your own');
      return;
    }
    updateFormData({
      selectedTools: selected,
      customTools: custom.trim(),
    });
    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1C1917]">
          What tools do you use?
        </h2>
        <p className="mt-2 text-sm text-[#78716C]">
          Select the platforms and software in your current stack.
        </p>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {TOOL_OPTIONS.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              disabled={isSaving}
              className={`group relative flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-center transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                isSelected
                  ? 'border-[#1C1917] bg-[#1C1917] shadow-md'
                  : 'border-[#E7E5E4] bg-white hover:border-[#D6D3D1] hover:shadow-sm'
              }`}
            >
              <span
                className={`text-sm font-medium transition-colors ${
                  isSelected ? 'text-white' : 'text-[#44403C]'
                }`}
              >
                {option}
              </span>
              {isSelected && (
                <Check className="h-3.5 w-3.5 shrink-0 text-white" strokeWidth={3} />
              )}
            </button>
          );
        })}
      </div>

      {/* Custom input */}
      <div className="space-y-2">
        <label
          htmlFor="customTools"
          className="block text-sm font-semibold text-[#1C1917]"
        >
          Other tools
        </label>
        <div className="rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] transition-all focus-within:border-[#1C1917] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1C1917]/10">
          <input
            id="customTools"
            type="text"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setError('');
            }}
            placeholder="e.g. Custom CRM, internal tools, APIs..."
            disabled={isSaving}
            className="h-12 w-full rounded-xl border-0 bg-transparent px-4 text-sm text-[#1C1917] outline-none placeholder:text-[#A8A29E] disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {error && <p className="text-xs text-[#EF4444]">{error}</p>}

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
          type="button"
          onClick={onSubmit}
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
    </div>
  );
}
