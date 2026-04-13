'use client';

import type { DeploymentPlanStatus } from '@/types';

const statusConfig: Record<
  DeploymentPlanStatus,
  { label: string; className: string }
> = {
  DRAFT: { label: 'Draft', className: 'bg-stone-100 text-stone-600' },
  PLANNING: { label: 'Planning...', className: 'bg-blue-100 text-blue-700' },
  PLAN_READY: { label: 'Ready for Review', className: 'bg-indigo-100 text-indigo-700' },
  APPROVED: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700' },
  EXECUTING: { label: 'Generating...', className: 'bg-amber-100 text-amber-700' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  FAILED: { label: 'Failed', className: 'bg-red-100 text-red-700' },
};

export function PlanStatusBadge({ status }: { status: DeploymentPlanStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {(status === 'PLANNING' || status === 'EXECUTING') && (
        <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      )}
      {config.label}
    </span>
  );
}
