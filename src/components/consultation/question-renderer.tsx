'use client';

import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { SessionQuestion } from '@/types';

interface QuestionRendererProps {
  question: SessionQuestion;
  value: string | string[] | number | null;
  onChange: (value: string | string[] | number) => void;
}

const scaleLabels: Record<number, string> = {
  1: 'Not at all',
  2: 'Slightly',
  3: 'Moderately',
  4: 'Very',
  5: 'Fully mature',
};

export function QuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  const { questionType, options } = question.question;

  if (questionType === 'TEXT') {
    const textValue = typeof value === 'string' ? value : '';
    return (
      <div className="space-y-2">
        <Textarea
          placeholder="Type your answer..."
          value={textValue}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[120px] resize-none border-[#E7E5E4] bg-white text-[15px] leading-relaxed focus-visible:border-[#1C1917] focus-visible:ring-[#1C1917]/10"
        />
        <p className="text-right text-xs text-[#A8A29E]">
          {textValue.length} characters
        </p>
      </div>
    );
  }

  if (questionType === 'SINGLE_CHOICE' && options) {
    const selectedValue = typeof value === 'string' ? value : '';
    return (
      <RadioGroup
        value={selectedValue}
        onValueChange={(val) => onChange(val as string)}
        className="space-y-2"
      >
        {options.map((option) => (
          <label
            key={option}
            className={`
              flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3.5
              transition-all duration-150
              ${
                selectedValue === option
                  ? 'border-[#1C1917] bg-[#1C1917]/[0.03]'
                  : 'border-[#E7E5E4] bg-white hover:border-[#A8A29E] hover:bg-[#FAFAF9]'
              }
            `}
          >
            <RadioGroupItem value={option} />
            <span className="text-[15px] text-[#1C1917]">{option}</span>
          </label>
        ))}
      </RadioGroup>
    );
  }

  if (questionType === 'MULTI_CHOICE' && options) {
    const selectedValues = Array.isArray(value) ? value : [];

    const handleToggle = (option: string) => {
      if (selectedValues.includes(option)) {
        onChange(selectedValues.filter((v) => v !== option));
      } else {
        onChange([...selectedValues, option]);
      }
    };

    return (
      <div className="space-y-2">
        {options.map((option) => {
          const isChecked = selectedValues.includes(option);
          return (
            <label
              key={option}
              className={`
                flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3.5
                transition-all duration-150
                ${
                  isChecked
                    ? 'border-[#1C1917] bg-[#1C1917]/[0.03]'
                    : 'border-[#E7E5E4] bg-white hover:border-[#A8A29E] hover:bg-[#FAFAF9]'
                }
              `}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => handleToggle(option)}
              />
              <span className="text-[15px] text-[#1C1917]">{option}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (questionType === 'SCALE') {
    const numValue = typeof value === 'number' ? value : null;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`
                flex h-12 w-12 shrink-0 items-center justify-center rounded-full
                text-sm font-semibold transition-all duration-150
                ${
                  numValue === n
                    ? 'bg-[#1C1917] text-white scale-110'
                    : 'border border-[#E7E5E4] bg-white text-[#78716C] hover:border-[#A8A29E] hover:bg-[#FAFAF9]'
                }
              `}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={`
                w-12 text-center text-[10px] leading-tight
                ${numValue === n ? 'font-medium text-[#1C1917]' : 'text-[#A8A29E]'}
              `}
            >
              {scaleLabels[n]}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
