'use client';

import { Progress } from '@/components/ui/progress';
import { SectionIndicator } from '@/components/consultation/section-indicator';

interface ProgressHeaderProps {
  answered: number;
  total: number;
  section: 'BASE' | 'INDUSTRY' | 'CHALLENGE_BONUS' | 'PERSONALIZED' | 'ADAPTIVE';
}

export function ProgressHeader({ answered, total, section }: ProgressHeaderProps) {
  const current = Math.min(answered + 1, total);
  const percentage = total > 0 ? (answered / total) * 100 : 0;

  return (
    <div className="mb-8 space-y-3">
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
