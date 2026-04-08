'use client';

interface SectionIndicatorProps {
  section: 'BASE' | 'INDUSTRY' | 'CHALLENGE_BONUS' | 'PERSONALIZED' | 'ADAPTIVE';
}

const sectionLabels: Record<string, string> = {
  BASE: 'CORE QUESTIONS',
  INDUSTRY: 'INDUSTRY QUESTIONS',
  CHALLENGE_BONUS: 'CHALLENGE BONUS',
  PERSONALIZED: 'TAILORED TO YOU',
  ADAPTIVE: 'FOLLOW-UP',
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
