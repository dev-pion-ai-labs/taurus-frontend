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
    <div className="mb-10 space-y-4">
      {scopeLabel ? (
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          <span className="rounded-full border border-accent-foreground/15 bg-accent px-2 py-0.5 text-accent-foreground">
            Consulting on
          </span>
          <span className="truncate text-foreground">{scopeLabel}</span>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <SectionIndicator section={section} />
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          <span className="text-foreground">{current}</span> / {total}
        </span>
      </div>

      <Progress
        value={percentage}
        className="h-1 [&_[data-slot=progress-track]]:bg-border/60 [&_[data-slot=progress-indicator]]:bg-foreground [&_[data-slot=progress-indicator]]:transition-all [&_[data-slot=progress-indicator]]:duration-500 [&_[data-slot=progress-indicator]]:ease-out"
      />
    </div>
  );
}
