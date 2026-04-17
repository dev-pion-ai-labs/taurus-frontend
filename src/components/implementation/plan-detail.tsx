'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlanStatusBadge } from './plan-status-badge';
import { ArtifactViewer } from './artifact-viewer';
import {
  useImplementationPlan,
  useApprovePlan,
  useRejectPlan,
  useRefinePlan,
  useExecutePlan,
  useDeletePlan,
  useDeployPlan,
} from '@/hooks/use-implementation';
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Circle,
  CircleCheck,
  CircleX,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  Rocket,
  Send,
  Shield,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import type { DeploymentPlan, DeploymentArtifact } from '@/types';

interface PlanDetailProps {
  planId: string;
  onDeleted: () => void;
}

const severityColors: Record<string, string> = {
  CRITICAL: 'border-red-200 bg-red-50 text-red-800',
  HIGH: 'border-orange-200 bg-orange-50 text-orange-800',
  MEDIUM: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  LOW: 'border-green-200 bg-green-50 text-green-800',
};

export function PlanDetail({ planId, onDeleted }: PlanDetailProps) {
  const { data: plan, isLoading, refetch } = useImplementationPlan(planId);
  const [refineMessage, setRefineMessage] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [selectedArtifact, setSelectedArtifact] =
    useState<DeploymentArtifact | null>(null);

  const approvePlan = useApprovePlan();
  const rejectPlan = useRejectPlan();
  const refinePlan = useRefinePlan();
  const executePlan = useExecutePlan();
  const deletePlan = useDeletePlan();
  const deployPlanMutation = useDeployPlan();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#A8A29E]" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[#78716C]">
        Plan not found
      </div>
    );
  }

  const isProcessing = plan.status === 'PLANNING' || plan.status === 'EXECUTING';
  const canApprove = plan.status === 'PLAN_READY';
  const canRefine = plan.status === 'PLAN_READY' || plan.status === 'DRAFT';
  const canExecute = plan.status === 'APPROVED' || plan.status === 'FAILED';
  const canDelete = plan.status === 'DRAFT' || plan.status === 'FAILED';

  // Deploy readiness: plan is COMPLETED and all integration checklists are fully checked
  const canDeploy = (() => {
    if (plan.status !== 'COMPLETED' || !plan.artifacts) return false;
    const checklists = plan.artifacts.filter(
      (a) => a.type === 'INTEGRATION_CHECKLIST',
    );
    if (checklists.length === 0) return true; // no checklist = ready
    return checklists.every((cl) => {
      const lines = (cl.content ?? '').split('\n');
      const checklistIndices = lines.reduce<number[]>((acc, line, idx) => {
        if (/^\s*-\s*\[[ x]\]/i.test(line)) acc.push(idx);
        return acc;
      }, []);
      if (checklistIndices.length === 0) return true;
      const state = (cl.checklistState ?? {}) as Record<string, boolean>;
      return checklistIndices.every((idx) => state[idx]);
    });
  })();

  function handleApprove() {
    approvePlan.mutate(planId, {
      onSuccess: () => {
        toast.success('Plan approved — artifact generation started');
        refetch();
      },
      onError: () => toast.error('Failed to approve plan'),
    });
  }

  function handleReject() {
    rejectPlan.mutate(
      { id: planId, note: rejectNote || undefined },
      {
        onSuccess: () => {
          toast.success('Plan rejected — returned to draft');
          setShowReject(false);
          setRejectNote('');
          refetch();
        },
        onError: () => toast.error('Failed to reject plan'),
      },
    );
  }

  function handleRefine() {
    if (!refineMessage.trim()) return;
    refinePlan.mutate(
      { id: planId, message: refineMessage },
      {
        onSuccess: () => {
          toast.success('Refinement in progress...');
          setRefineMessage('');
          refetch();
        },
        onError: () => toast.error('Failed to refine plan'),
      },
    );
  }

  function handleExecute() {
    executePlan.mutate(planId, {
      onSuccess: () => {
        toast.success('Artifact generation started');
        refetch();
      },
      onError: () => toast.error('Failed to start execution'),
    });
  }

  function handleDeploy() {
    deployPlanMutation.mutate(planId, {
      onSuccess: () => {
        toast.success('Deployed successfully — action marked as deployed');
        refetch();
      },
      onError: () => toast.error('Failed to deploy — check all checklist items are complete'),
    });
  }

  function handleDelete() {
    deletePlan.mutate(planId, {
      onSuccess: () => {
        toast.success('Plan deleted');
        onDeleted();
      },
      onError: () => toast.error('Failed to delete plan'),
    });
  }

  if (selectedArtifact) {
    return (
      <ArtifactViewer
        artifact={selectedArtifact}
        onBack={() => setSelectedArtifact(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1C1917]">{plan.title}</h2>
            <p className="text-sm text-[#78716C] mt-1">
              Action: {plan.action?.title}
              {plan.action?.department && ` · ${plan.action.department}`}
            </p>
          </div>
          <PlanStatusBadge status={plan.status} />
        </div>
        {plan.summary && (
          <p className="text-sm text-[#57534E] mt-3 leading-relaxed">
            {plan.summary}
          </p>
        )}
        {plan.estimatedDuration && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-[#A8A29E]">
            <Clock className="w-3.5 h-3.5" />
            Estimated: {plan.estimatedDuration}
          </div>
        )}
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {plan.status === 'PLANNING'
                ? 'AI is generating your deployment plan...'
                : 'Generating deployment artifacts...'}
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            This may take a minute. Refresh to check progress.
          </p>
        </div>
      )}

      {/* Rejection note */}
      {plan.rejectionNote && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              Previously rejected
            </span>
          </div>
          <p className="text-xs text-amber-700 mt-1">{plan.rejectionNote}</p>
        </div>
      )}

      {/* Steps */}
      {plan.steps && plan.steps.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#1C1917] mb-3">
            Implementation Steps
          </h3>
          <div className="flex flex-col gap-2">
            {plan.steps.map((step) => (
              <div
                key={step.stepNumber}
                className="rounded-lg border border-[#E7E5E4] p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#F5F5F4] text-xs font-bold text-[#57534E]">
                    {step.stepNumber}
                  </span>
                  <span className="text-sm font-medium text-[#1C1917]">
                    {step.title}
                  </span>
                  {step.estimatedDuration && (
                    <span className="ml-auto text-xs text-[#A8A29E] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {step.estimatedDuration}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#78716C] mt-1.5 ml-8">
                  {step.description}
                </p>
                {step.dependencies.length > 0 && (
                  <p className="text-[10px] text-[#A8A29E] mt-1 ml-8">
                    Depends on: Step{' '}
                    {step.dependencies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prerequisites */}
      {plan.prerequisites && plan.prerequisites.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#1C1917] mb-2">
            Prerequisites
          </h3>
          <ul className="flex flex-col gap-1">
            {plan.prerequisites.map((prereq, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-[#57534E]"
              >
                <ChevronRight className="w-3 h-3 mt-0.5 text-[#A8A29E] shrink-0" />
                {prereq}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks */}
      {plan.risks && plan.risks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#1C1917] mb-2 flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            Risks
          </h3>
          <div className="flex flex-col gap-2">
            {plan.risks.map((risk, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 ${severityColors[risk.severity] || severityColors.MEDIUM}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{risk.risk}</span>
                  <span className="text-[10px] font-semibold uppercase">
                    {risk.severity}
                  </span>
                </div>
                <p className="text-xs mt-1 opacity-80">
                  Mitigation: {risk.mitigation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deployment Steps — what Taurus will execute at deploy time */}
      {plan.deploymentSteps && plan.deploymentSteps.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#1C1917] mb-1 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#E11D48]" />
            What Taurus will execute
          </h3>
          <p className="text-xs text-[#78716C] mb-3">
            {plan.status === 'COMPLETED' && plan.deploymentSteps.every((s) => !s.status || s.status === 'pending')
              ? 'These actions will run automatically when you click Deploy.'
              : 'Execution status per step.'}
          </p>
          <div className="flex flex-col gap-2">
            {plan.deploymentSteps.map((step, i) => {
              const status = step.status ?? 'pending';
              const badge = (() => {
                switch (status) {
                  case 'completed':
                    return {
                      icon: <CircleCheck className="w-4 h-4 text-emerald-600" />,
                      label: 'Completed',
                      cls: 'border-emerald-200 bg-emerald-50',
                    };
                  case 'failed':
                    return {
                      icon: <CircleX className="w-4 h-4 text-red-600" />,
                      label: 'Failed',
                      cls: 'border-red-200 bg-red-50',
                    };
                  case 'executing':
                    return {
                      icon: <Loader2 className="w-4 h-4 animate-spin text-blue-600" />,
                      label: 'Executing…',
                      cls: 'border-blue-200 bg-blue-50',
                    };
                  case 'skipped':
                    return {
                      icon: <Circle className="w-4 h-4 text-[#A8A29E]" />,
                      label: 'Skipped',
                      cls: 'border-[#E7E5E4] bg-[#F5F5F4] opacity-70',
                    };
                  default:
                    return {
                      icon: <Circle className="w-4 h-4 text-[#A8A29E]" />,
                      label: 'Pending',
                      cls: 'border-[#E7E5E4] bg-white',
                    };
                }
              })();

              return (
                <div
                  key={i}
                  className={`rounded-lg border p-3 ${badge.cls}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">{badge.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold uppercase tracking-wide text-[#57534E]">
                          {step.provider}
                        </span>
                        <span className="text-[10px] font-mono text-[#A8A29E]">
                          {step.tool}
                        </span>
                        <span className="ml-auto text-[10px] font-medium text-[#57534E]">
                          {badge.label}
                        </span>
                      </div>
                      {step.description && (
                        <p className="text-sm text-[#1C1917] mt-1">
                          {step.description}
                        </p>
                      )}
                      {step.error && (
                        <p className="text-xs text-red-700 mt-1.5 font-mono break-all">
                          {step.error}
                        </p>
                      )}
                      {step.dependsOn && step.dependsOn.length > 0 && (
                        <p className="text-[10px] text-[#A8A29E] mt-1">
                          Depends on step{step.dependsOn.length > 1 ? 's' : ''}{' '}
                          {step.dependsOn.map((d) => d + 1).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Artifacts */}
      {plan.artifacts && plan.artifacts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#1C1917] mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            Generated Artifacts
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {plan.artifacts.map((artifact) => (
              <button
                key={artifact.id}
                onClick={() => setSelectedArtifact(artifact)}
                className="flex items-center gap-3 rounded-lg border border-[#E7E5E4] p-3 text-left hover:border-[#D6D3D1] transition-colors"
              >
                <FileText className="w-5 h-5 text-[#E11D48] shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1C1917] truncate">
                    {artifact.title}
                  </p>
                  <p className="text-[10px] text-[#A8A29E]">
                    {artifact.type.replace(/_/g, ' ')}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A8A29E] shrink-0 ml-auto" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Refine input */}
      {canRefine && (
        <div>
          <h3 className="text-sm font-semibold text-[#1C1917] mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            Refine Plan
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={refineMessage}
              onChange={(e) => setRefineMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleRefine();
                }
              }}
              placeholder="Describe changes you'd like to the plan..."
              className="flex-1 rounded-lg border border-[#E7E5E4] px-3 py-2 text-sm outline-none focus:border-[#E11D48] transition-colors"
              disabled={refinePlan.isPending}
            />
            <Button
              size="sm"
              onClick={handleRefine}
              disabled={!refineMessage.trim() || refinePlan.isPending}
            >
              {refinePlan.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#E7E5E4]">
        {canApprove && (
          <>
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={approvePlan.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {approvePlan.isPending ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-1.5" />
              )}
              Approve & Generate Artifacts
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowReject(!showReject)}
            >
              <X className="w-4 h-4 mr-1.5" />
              Reject
            </Button>
          </>
        )}

        {canExecute && (
          <Button
            size="sm"
            onClick={handleExecute}
            disabled={executePlan.isPending}
          >
            {executePlan.isPending ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 mr-1.5" />
            )}
            {plan.status === 'FAILED' ? 'Retry Artifacts' : 'Generate Artifacts'}
          </Button>
        )}

        {plan.status === 'COMPLETED' && (
          <Button
            size="sm"
            onClick={handleDeploy}
            disabled={!canDeploy || deployPlanMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
          >
            {deployPlanMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Rocket className="w-4 h-4 mr-1.5" />
            )}
            {canDeploy ? 'Deploy' : 'Complete Checklist to Deploy'}
          </Button>
        )}

        {canDelete && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDelete}
            disabled={deletePlan.isPending}
            className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete
          </Button>
        )}
      </div>

      {/* Reject dialog inline */}
      {showReject && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800 mb-2">
            Reject this plan?
          </p>
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Optional: reason for rejection..."
            className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-400 resize-none"
            rows={2}
          />
          <div className="flex items-center gap-2 mt-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={handleReject}
              disabled={rejectPlan.isPending}
            >
              {rejectPlan.isPending ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : null}
              Confirm Reject
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowReject(false);
                setRejectNote('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
