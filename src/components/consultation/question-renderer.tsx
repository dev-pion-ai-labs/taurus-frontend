'use client';

import { Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
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
  const questionType = question.question?.questionType ?? question.adaptiveType ?? null;
  const options = question.question?.options ?? question.adaptiveOptions ?? null;
  if (!questionType) return null;

  if (questionType === 'TEXT') {
    const textValue = typeof value === 'string' ? value : '';
    return (
      <div className="space-y-2">
        <Textarea
          placeholder="Type your answer…"
          value={textValue}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[140px] resize-none rounded-xl border-border bg-card text-[15px] leading-relaxed shadow-xs focus-visible:border-foreground focus-visible:ring-foreground/10"
        />
        <p className="text-right text-xs text-muted-foreground/70">
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
        {options.map((option) => {
          const isSelected = selectedValue === option;
          return (
            <label
              key={option}
              className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 shadow-xs transition-all duration-150 ${
                isSelected
                  ? 'border-foreground bg-foreground/[0.03] ring-1 ring-foreground/10'
                  : 'border-border bg-card hover:border-stone-400 hover:bg-muted/60'
              }`}
            >
              <RadioGroupItem value={option} />
              <span className="flex-1 text-[15px] text-foreground">{option}</span>
              {isSelected ? (
                <Check className="h-4 w-4 shrink-0 text-foreground" strokeWidth={2.5} />
              ) : null}
            </label>
          );
        })}
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
              className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 shadow-xs transition-all duration-150 ${
                isChecked
                  ? 'border-foreground bg-foreground/[0.03] ring-1 ring-foreground/10'
                  : 'border-border bg-card hover:border-stone-400 hover:bg-muted/60'
              }`}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => handleToggle(option)}
              />
              <span className="flex-1 text-[15px] text-foreground">{option}</span>
              {isChecked ? (
                <Check className="h-4 w-4 shrink-0 text-foreground" strokeWidth={2.5} />
              ) : null}
            </label>
          );
        })}
      </div>
    );
  }

  if (questionType === 'SCALE') {
    const numValue = typeof value === 'number' ? value : null;
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((n) => {
            const isSelected = numValue === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                aria-label={`${n} — ${scaleLabels[n]}`}
                className={`flex aspect-square min-h-[56px] flex-col items-center justify-center rounded-xl border text-base font-semibold shadow-xs transition-all duration-150 ${
                  isSelected
                    ? 'border-foreground bg-foreground text-background ring-1 ring-foreground/20'
                    : 'border-border bg-card text-muted-foreground hover:border-stone-400 hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <span>{scaleLabels[1]}</span>
          <span className="hidden sm:inline">{scaleLabels[3]}</span>
          <span>{scaleLabels[5]}</span>
        </div>
        {numValue ? (
          <p className="text-center text-xs font-medium text-foreground">
            {scaleLabels[numValue]}
          </p>
        ) : null}
      </div>
    );
  }

  return null;
}
