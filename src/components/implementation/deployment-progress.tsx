'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  Circle,
  Loader2,
  Play,
  RotateCcw,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  SkipForward,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useDeploymentSessions,
  useDeploymentSession,
  useDryRunSession,
  useApproveSession,
  useExecuteSession,
  useRollbackSession,
} from '@/hooks/use-deployment';
import type {
  DeploymentSession,
  DeploymentStep,
  DeploymentStepStatus,
  DeploymentSessionStatus,
} from '@/types';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

// ─── Step Status Icon ────────────────────────────────────

function StepStatusIcon({ status }: { status: DeploymentStepStatus }) {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case 'FAILED':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'EXECUTING':
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    case 'SKIPPED':
      return <SkipForward className="h-4 w-4 text-[#A8A29E]" />;
    case 'DRY_RUN':
      return <Eye className="h-4 w-4 text-violet-500" />;
    case 'APPROVED':
      return <CheckCircle2 className="h-4 w-4 text-blue-400" />;
    default:
      return <Circle className="h-4 w-4 text-[#D6D3D1]" />;
  }
}

// ─── Session Status Badge ────────────────────────────────

const sessionStatusConfig: Record<
  DeploymentSessionStatus,
  { label: string; className: string }
> = {
  PREPARING: { label: 'Preparing', className: 'bg-[#F5F5F4] text-[#57534E]' },
  DRY_RUN: { label: 'Dry Run Complete', className: 'bg-violet-50 text-violet-700' },
  APPROVED: { label: 'Approved', className: 'bg-blue-50 text-blue-700' },
  EXECUTING: { label: 'Executing', className: 'bg-blue-50 text-blue-700' },
  COMPLETED: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700' },
  FAILED: { label: 'Failed', className: 'bg-red-50 text-red-700' },
  ROLLED_BACK: { label: 'Rolled Back', className: 'bg-amber-50 text-amber-700' },
};

function SessionStatusBadge({ status }: { status: DeploymentSessionStatus }) {
  const config = sessionStatusConfig[status] ?? sessionStatusConfig.PREPARING;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${config.className}`}
    >
      {status === 'EXECUTING' && (
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
      )}
      {config.label}
    </span>
  );
}

// ─── Step Detail Row ─────────────────────────────────────

function StepRow({ step, index }: { step: DeploymentStep; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const dryRun = step.dryRunResult as Record<string, unknown> | null;

  return (
    <div className="rounded-lg border border-[#E7E5E4] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[#FAFAF9] transition-colors"
      >
        <StepStatusIcon status={step.status} />
        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#F5F5F4] text-[10px] font-bold text-[#57534E]">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium text-[#1C1917]">
            {step.provider.toLowerCase()}.{step.action}
          </span>
          <span className="ml-2 text-[11px] text-[#A8A29E]">
            {step.status.toLowerCase().replace('_', ' ')}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-[#A8A29E]" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-[#A8A29E]" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-[#E7E5E4] bg-[#FAFAF9] px-3 py-2.5 space-y-2">
          {/* Params */}
          <div>
            <p className="text-[10px] font-semibold uppercase text-[#A8A29E] mb-1">
              Parameters
            </p>
            <pre className="text-xs text-[#57534E] whitespace-pre-wrap break-all">
              {JSON.stringify(step.params, null, 2)}
            </pre>
          </div>

          {/* Dry run result */}
          {dryRun && (
            <div>
              <p className="text-[10px] font-semibold uppercase text-[#A8A29E] mb-1">
                Dry Run Preview
              </p>
              <p className="text-xs text-[#57534E]">
                {(dryRun.preview as string) || 'No preview'}
              </p>
              {Array.isArray(dryRun.warnings) &&
                dryRun.warnings.length > 0 && (
                  <div className="mt-1 flex items-start gap-1 text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>{(dryRun.warnings as string[]).join(', ')}</span>
                  </div>
                )}
            </div>
          )}

          {/* Error */}
          {step.error && (
            <div className="flex items-start gap-1 text-xs text-red-600">
              <XCircle className="h-3 w-3 mt-0.5 shrink-0" />
              {step.error}
            </div>
          )}

          {/* Result */}
          {step.result && (
            <div>
              <p className="text-[10px] font-semibold uppercase text-[#A8A29E] mb-1">
                Result
              </p>
              <pre className="text-xs text-[#57534E] whitespace-pre-wrap break-all">
                {JSON.stringify(step.result, null, 2)}
              </pre>
            </div>
          )}

          {/* Dependencies */}
          {step.dependsOn.length > 0 && (
            <p className="text-[10px] text-[#A8A29E]">
              Depends on: {step.dependsOn.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Session Detail ──────────────────────────────────────

function SessionDetail({
  orgId,
  sessionId,
}: {
  orgId: string;
  sessionId: string;
}) {
  const { data: session, isLoading } = useDeploymentSession(orgId, sessionId);
  const dryRun = useDryRunSession(orgId);
  const approve = useApproveSession(orgId);
  const execute = useExecuteSession(orgId);
  const rollback = useRollbackSession(orgId);

  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-[#A8A29E]" />
      </div>
    );
  }

  const canDryRun = session.status === 'PREPARING';
  const canApprove = session.status === 'DRY_RUN';
  const canExecute =
    session.status === 'DRY_RUN' || session.status === 'APPROVED';
  const canRollback =
    session.status === 'COMPLETED' || session.status === 'FAILED';

  return (
    <div className="space-y-3">
      {/* Steps */}
      {session.steps.map((step, i) => (
        <StepRow key={step.id} step={step} index={i} />
      ))}

      {/* Error banner */}
      {session.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-red-700">
            <XCircle className="h-3.5 w-3.5" />
            {session.error}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        {canDryRun && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full text-xs"
            disabled={dryRun.isPending}
            onClick={() =>
              dryRun.mutate(sessionId, {
                onSuccess: () => toast.success('Dry run complete'),
                onError: (err) => toast.error(err.message),
              })
            }
          >
            {dryRun.isPending ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : (
              <Eye className="mr-1.5 h-3 w-3" />
            )}
            Dry Run
          </Button>
        )}

        {canApprove && (
          <Button
            size="sm"
            className="rounded-full bg-emerald-600 text-xs text-white hover:bg-emerald-700"
            disabled={approve.isPending}
            onClick={() =>
              approve.mutate(sessionId, {
                onSuccess: () => toast.success('Session approved'),
                onError: (err) => toast.error(err.message),
              })
            }
          >
            {approve.isPending ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-1.5 h-3 w-3" />
            )}
            Approve
          </Button>
        )}

        {canExecute && (
          <Button
            size="sm"
            className="rounded-full bg-[#1C1917] text-xs text-white hover:bg-[#1C1917]/90"
            disabled={execute.isPending}
            onClick={() =>
              execute.mutate(sessionId, {
                onSuccess: () => toast.success('Deployment started'),
                onError: (err) => toast.error(err.message),
              })
            }
          >
            {execute.isPending ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : (
              <Play className="mr-1.5 h-3 w-3" />
            )}
            Execute
          </Button>
        )}

        {canRollback && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full text-xs text-red-600 hover:bg-red-50"
            disabled={rollback.isPending}
            onClick={() =>
              rollback.mutate(sessionId, {
                onSuccess: () => toast.success('Rollback complete'),
                onError: (err) => toast.error(err.message),
              })
            }
          >
            {rollback.isPending ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : (
              <RotateCcw className="mr-1.5 h-3 w-3" />
            )}
            Rollback
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main Export: DeploymentProgress ─────────────────────

interface DeploymentProgressProps {
  orgId: string;
  planId: string;
}

export function DeploymentProgress({ orgId, planId }: DeploymentProgressProps) {
  const { data: sessions, isLoading } = useDeploymentSessions(orgId, planId);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    null,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-[#A8A29E]" />
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return null;
  }

  return (
    <motion.div variants={itemVariants} className="space-y-3">
      <h3 className="text-sm font-semibold text-[#1C1917] flex items-center gap-1.5">
        <Play className="h-4 w-4" />
        Deployment Sessions
      </h3>

      {sessions.map((session) => (
        <div
          key={session.id}
          className="rounded-xl border border-[#E7E5E4] bg-white overflow-hidden"
        >
          {/* Session header */}
          <button
            type="button"
            onClick={() =>
              setExpandedSessionId(
                expandedSessionId === session.id ? null : session.id,
              )
            }
            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#FAFAF9] transition-colors"
          >
            <SessionStatusBadge status={session.status} />
            <span className="text-xs text-[#78716C]">
              {session.steps.length} step{session.steps.length !== 1 ? 's' : ''}
            </span>
            <span className="ml-auto text-[11px] text-[#A8A29E]">
              {new Date(session.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {expandedSessionId === session.id ? (
              <ChevronUp className="h-3.5 w-3.5 text-[#A8A29E]" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-[#A8A29E]" />
            )}
          </button>

          {/* Expanded detail */}
          {expandedSessionId === session.id && (
            <div className="border-t border-[#E7E5E4] px-4 py-3">
              <SessionDetail orgId={orgId} sessionId={session.id} />
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );
}
