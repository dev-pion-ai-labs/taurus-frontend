'use client';

type Section = 'BASE' | 'INDUSTRY' | 'CHALLENGE_BONUS' | 'PERSONALIZED' | 'ADAPTIVE';

interface SectionIndicatorProps {
  section: Section;
}

const sectionLabels: Record<Section, string> = {
  BASE: 'Core',
  INDUSTRY: 'Industry',
  CHALLENGE_BONUS: 'Challenge bonus',
  PERSONALIZED: 'Tailored',
  ADAPTIVE: 'Follow-up',
};

const sectionStyles: Record<Section, string> = {
  BASE: 'bg-muted text-muted-foreground border-border',
  INDUSTRY: 'bg-muted text-muted-foreground border-border',
  CHALLENGE_BONUS: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  PERSONALIZED: 'bg-accent text-accent-foreground border-accent-foreground/15',
  ADAPTIVE: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
};

export function SectionIndicator({ section }: SectionIndicatorProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase leading-none tracking-wide ${sectionStyles[section] ?? sectionStyles.BASE}`}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {sectionLabels[section] ?? section}
    </span>
  );
}
