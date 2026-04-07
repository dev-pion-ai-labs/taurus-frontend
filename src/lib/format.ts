export function formatDollar(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

export function formatScore(score: number): string {
  return Math.round(score).toString();
}

export function getScoreColor(score: number): string {
  if (score >= 70) return '#16a34a';
  if (score >= 40) return '#d97706';
  return '#dc2626';
}

export function getMaturityColor(level: string): string {
  const colors: Record<string, string> = {
    'AI Native': '#16a34a',
    'AI Advancing': '#22c55e',
    'AI Ready': '#d97706',
    'AI Aware': '#f59e0b',
    'AI Curious': '#dc2626',
  };
  return colors[level] || '#78716C';
}

export function getImpactColor(impact: string): string {
  if (impact === 'HIGH') return '#16a34a';
  if (impact === 'MEDIUM') return '#d97706';
  return '#78716C';
}

export function getEffortColor(effort: string): string {
  if (effort === 'LOW') return '#16a34a';
  if (effort === 'MEDIUM') return '#d97706';
  return '#dc2626';
}
