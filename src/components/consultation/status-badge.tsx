'use client';

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { bg: string; text: string; pulse: boolean }> = {
  PENDING_TEMPLATE: { bg: '#EA580C', text: '#FFFFFF', pulse: true },
  IN_PROGRESS:      { bg: '#1C1917', text: '#FFFFFF', pulse: false },
  COMPLETED:        { bg: '#0D9488', text: '#FFFFFF', pulse: false },
  ABANDONED:        { bg: '#A8A29E', text: '#FFFFFF', pulse: false },
  FAILED:           { bg: '#EF4444', text: '#FFFFFF', pulse: false },
  GENERATING:       { bg: '#EA580C', text: '#FFFFFF', pulse: true },
  ACTIVE:           { bg: '#0D9488', text: '#FFFFFF', pulse: false },
  DEPRECATED:       { bg: '#A8A29E', text: '#FFFFFF', pulse: false },
};

const defaultConfig = { bg: '#A8A29E', text: '#FFFFFF', pulse: false };

function formatLabel(status: string): string {
  return status.replace(/_/g, ' ');
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? defaultConfig;

  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2.5 py-1
        text-[11px] font-semibold uppercase leading-none tracking-wide
        ${config.pulse ? 'animate-pulse-subtle' : ''}
      `}
      style={{
        backgroundColor: config.bg,
        color: config.text,
      }}
    >
      {formatLabel(status)}
    </span>
  );
}
