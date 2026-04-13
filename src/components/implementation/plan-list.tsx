'use client';

import { PlanStatusBadge } from './plan-status-badge';
import { Clock, FileText, User } from 'lucide-react';
import type { DeploymentPlan } from '@/types';

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

interface PlanListProps {
  plans: DeploymentPlan[];
  onSelect: (plan: DeploymentPlan) => void;
  selectedId?: string | null;
}

export function PlanList({ plans, onSelect, selectedId }: PlanListProps) {
  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-[#F5F5F4] flex items-center justify-center mb-3">
          <FileText className="w-6 h-6 text-[#A8A29E]" />
        </div>
        <p className="text-sm text-[#78716C]">No deployment plans yet</p>
        <p className="text-xs text-[#A8A29E] mt-1">
          Create a plan from a tracker action to get started
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {plans.map((plan) => {
        const userName =
          [plan.user?.firstName, plan.user?.lastName]
            .filter(Boolean)
            .join(' ') || plan.user?.email || 'Unknown';

        return (
          <button
            key={plan.id}
            onClick={() => onSelect(plan)}
            className={`w-full text-left rounded-xl border p-4 transition-colors ${
              selectedId === plan.id
                ? 'border-[#E11D48] bg-[#FFF1F2]'
                : 'border-[#E7E5E4] bg-white hover:border-[#D6D3D1]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-[#1C1917] truncate">
                  {plan.title}
                </h3>
                {plan.summary && (
                  <p className="text-xs text-[#78716C] mt-1 line-clamp-2">
                    {plan.summary}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-[#A8A29E]">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {plan.action?.title}
                  </span>
                  {plan.estimatedDuration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {plan.estimatedDuration}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {userName}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <PlanStatusBadge status={plan.status} />
                <span className="text-[10px] text-[#A8A29E]">
                  {timeAgo(plan.createdAt)}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
