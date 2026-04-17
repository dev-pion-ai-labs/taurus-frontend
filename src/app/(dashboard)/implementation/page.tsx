'use client';

import { useState } from 'react';
import { useImplementationPlans } from '@/hooks/use-implementation';
import { useTrackerBoard } from '@/hooks/use-tracker';
import { PlanList } from '@/components/implementation/plan-list';
import { PlanDetail } from '@/components/implementation/plan-detail';
import { CreatePlanDialog } from '@/components/implementation/create-plan-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Rocket, RefreshCw, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { DeploymentPlan, DeploymentPlanStatus, TransformationAction } from '@/types';

const STATUS_FILTERS: { label: string; value: DeploymentPlanStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Planning', value: 'PLANNING' },
  { label: 'Ready', value: 'PLAN_READY' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' },
];

export default function ImplementationPage() {
  const [statusFilter, setStatusFilter] = useState<
    DeploymentPlanStatus | undefined
  >(undefined);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [createDialogAction, setCreateDialogAction] = useState<TransformationAction | null>(null);
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useImplementationPlans(
    statusFilter ? { status: statusFilter } : undefined,
  );
  const { data: board } = useTrackerBoard();

  // Get actions that don't already have plans
  const planActionIds = new Set((plans ?? []).map((p) => p.actionId));
  const availableActions = board
    ? Object.values(board.columns)
        .flat()
        .filter((a) => !planActionIds.has(a.id))
    : [];

  function handleSelectPlan(plan: DeploymentPlan) {
    setSelectedPlanId(plan.id);
  }

  function handlePlanDeleted() {
    setSelectedPlanId(null);
  }

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ['implementation'] });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-32px)] p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Rocket className="w-6 h-6 text-[#1C1917]" />
          <h1 className="text-xl font-bold text-[#1C1917]">
            Implementation Engine
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {availableActions.length > 0 && (
            <div className="relative group">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Create Plan
              </Button>
              <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl border border-[#E7E5E4] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 max-h-64 overflow-y-auto">
                <div className="p-2">
                  <p className="text-[10px] uppercase tracking-wide text-[#A8A29E] font-medium px-2 py-1">
                    Select an action
                  </p>
                  {availableActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => setCreateDialogAction(action)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F5F5F4] transition-colors"
                    >
                      <p className="text-sm font-medium text-[#1C1917] truncate">
                        {action.title}
                      </p>
                      <p className="text-xs text-[#A8A29E]">
                        {action.department ?? 'No department'} · {action.category}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <span className="text-xs text-[#A8A29E] font-medium">Status:</span>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setStatusFilter(f.value)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              statusFilter === f.value
                ? 'bg-[#1C1917] text-white border-[#1C1917]'
                : 'border-[#E7E5E4] text-[#78716C] hover:border-[#D6D3D1]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex gap-4 flex-1 overflow-hidden">
          <div className="w-[380px] shrink-0 flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="flex-1 rounded-xl" />
        </div>
      ) : (
        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* Plan list (left panel) */}
          <div className="w-[380px] shrink-0 overflow-y-auto pr-2">
            <PlanList
              plans={plans || []}
              onSelect={handleSelectPlan}
              selectedId={selectedPlanId}
            />
          </div>

          {/* Plan detail (right panel) */}
          <div className="flex-1 overflow-y-auto rounded-xl border border-[#E7E5E4] bg-white p-6">
            {selectedPlanId ? (
              <PlanDetail
                planId={selectedPlanId}
                onDeleted={handlePlanDeleted}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-[#F5F5F4] flex items-center justify-center mb-3">
                  <Rocket className="w-8 h-8 text-[#A8A29E]" />
                </div>
                <h3 className="text-base font-semibold text-[#1C1917] mb-1">
                  Select a plan
                </h3>
                <p className="text-sm text-[#78716C] max-w-sm">
                  Choose a deployment plan from the list to view details, or
                  create one from a tracker action.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {createDialogAction && (
        <CreatePlanDialog
          open={!!createDialogAction}
          onClose={() => setCreateDialogAction(null)}
          actionId={createDialogAction.id}
          actionTitle={createDialogAction.title}
          onCreated={(planId) => {
            setSelectedPlanId(planId);
            setCreateDialogAction(null);
          }}
        />
      )}
    </div>
  );
}
