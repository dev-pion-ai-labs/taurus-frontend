'use client';

import { Progress } from '@/components/ui/progress';
import { SectionIndicator } from '@/components/consultation/section-indicator';

interface ProgressHeaderProps {
  answered: number;
  total: number;
  section: 'BASE' | 'INDUSTRY' | 'CHALLENGE_BONUS' | 'PERSONALIZED' | 'ADAPTIVE';
  scopeLabel?: string | null;
}

export function ProgressHeader({ answered, total, section, scopeLabel }: ProgressHeaderProps) {
  const current = Math.min(answered + 1, total);
  const percentage = total > 0 ? (answered / total) * 100 : 0;

  return (
    <div className="mb-8 space-y-3">
      {scopeLabel ? (
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#78716C]">
          <span className="rounded-full bg-[#FFF1F2] px-2.5 py-0.5 text-[#E11D48]">
            Consulting on
          </span>
          <span className="text-[#1C1917]">{scopeLabel}</span>
        </div>
      ) : null}
      <div className="flex items-center justify-between">
        <SectionIndicator section={section} />
        <span className="text-sm font-medium text-[#78716C]">
          Question {current} of {total}
        </span>
      </div>
      <Progress
        value={percentage}
        className="[&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-indicator]]:bg-[#1C1917] [&_[data-slot=progress-indicator]]:transition-all [&_[data-slot=progress-indicator]]:duration-500 [&_[data-slot=progress-indicator]]:ease-out"
      />
    </div>
  );
}
