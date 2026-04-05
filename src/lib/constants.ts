export const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
] as const;

export const SESSION_STATUS_LABELS: Record<string, string> = {
  PENDING_TEMPLATE: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ABANDONED: 'Abandoned',
  FAILED: 'Failed',
};

export const TEMPLATE_STATUS_LABELS: Record<string, string> = {
  GENERATING: 'Generating',
  ACTIVE: 'Active',
  DEPRECATED: 'Deprecated',
};

export const SCALE_LABELS: Record<number, string> = {
  1: 'Not at all',
  2: 'Slightly',
  3: 'Moderately',
  4: 'Very',
  5: 'Fully mature',
};
