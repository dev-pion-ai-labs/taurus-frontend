'use client';

interface SectionIndicatorProps {
  section: 'BASE' | 'INDUSTRY' | 'CHALLENGE_BONUS';
}

const sectionLabels: Record<string, string> = {
  BASE: 'BASE QUESTIONS',
  INDUSTRY: 'INDUSTRY QUESTIONS',
  CHALLENGE_BONUS: 'CHALLENGE BONUS',
};

export function SectionIndicator({ section }: SectionIndicatorProps) {
  return (
    <span
      className="inline-flex items-center rounded-full bg-[#F5F5F4] px-3 py-1 text-[11px] font-semibold uppercase leading-none tracking-wide text-[#78716C]"
    >
      {sectionLabels[section] ?? section}
    </span>
  );
}
