'use client';

import { useState } from 'react';
import { useTrackerBoard, useTrackerStats, useUpdateAction, useStalledActions, useSuggestSprint, useSuggestNextAction, useMoveAction } from '@/hooks/use-tracker';
import { KanbanBoard } from '@/components/tracker/kanban-board';
import { TrackerStatsBanner } from '@/components/tracker/tracker-stats';
import { ActionDetailDialog } from '@/components/tracker/action-detail-dialog';
import { ImportDialog } from '@/components/tracker/import-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, KanbanSquare, AlertTriangle, Sparkles, Loader2, Play, X } from 'lucide-react';
import { toast } from 'sonner';
import type { TransformationAction, ActionStatus } from '@/types';

const EMPTY_COLUMNS: Record<ActionStatus, TransformationAction[]> = {
  BACKLOG: [],
  THIS_SPRINT: [],
  IN_PROGRESS: [],
  AWAITING_APPROVAL: [],
  DEPLOYED: [],
  VERIFIED: [],
};

export default function TrackerPage() {
  const [filters, setFilters] = useState<{
    department?: string;
    priority?: string;
  }>({});
  const [selectedAction, setSelectedAction] = useState<TransformationAction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const { data: board, isLoading: boardLoading } = useTrackerBoard(filters);
  const { data: stats, isLoading: statsLoading } = useTrackerStats();
  const { data: stalledActions } = useStalledActions();
  const suggestSprint = useSuggestSprint();
  const suggestNextAction = useSuggestNextAction();
  const moveAction = useMoveAction();
  const updateAction = useUpdateAction();
  const [dismissedSuggestionId, setDismissedSuggestionId] = useState<string | null>(null);

  const columns = board?.columns || EMPTY_COLUMNS;

  // Extract unique departments from all actions for filter
  const allActions = Object.values(columns).flat();
  const departments = [...new Set(allActions.map((a) => a.department).filter(Boolean))] as string[];

  function handleCardClick(action: TransformationAction) {
    setSelectedAction(action);
    setDetailOpen(true);
  }

  function handleCardUpdate(id: string, data: Record<string, unknown>) {
    updateAction.mutate({ id, ...data });
  }

  function handleStartSuggested(actionId: string) {
    moveAction.mutate(
      { id: actionId, status: 'IN_PROGRESS', orderIndex: 0 },
      {
        onSuccess: () => {
          toast.success('Action started');
          suggestNextAction.reset();
        },
        onError: () => toast.error('Failed to start action'),
      },
    );
  }

  const suggestedAction =
    suggestNextAction.data?.suggestion &&
    suggestNextAction.data.suggestion.action.id !== dismissedSuggestionId
      ? suggestNextAction.data.suggestion
      : null;

  return (
    <div className="flex flex-col h-[calc(100vh-32px)] p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <KanbanSquare className="w-6 h-6 text-[#1C1917]" />
          <h1 className="text-xl font-bold text-[#1C1917]">
            Transformation Tracker
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDismissedSuggestionId(null);
              suggestNextAction.mutate(undefined, {
                onSuccess: (data) => {
                  if (!data.suggestion) {
                    toast.info(data.message || 'No actions available to start');
                  }
                },
                onError: () => toast.error('Failed to suggest next action'),
              });
            }}
            disabled={suggestNextAction.isPending}
          >
            {suggestNextAction.isPending ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-1.5" />
            )}
            Suggest Next Action
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              suggestSprint.mutate(undefined, {
                onSuccess: (data) => {
                  if ('message' in data) {
                    toast.info(data.message as string);
                  } else {
                    toast.success(`Sprint suggested: ${data.name}`, {
                      description: data.rationale,
                      duration: 8000,
                    });
                  }
                },
                onError: () => toast.error('Failed to generate sprint suggestion'),
              });
            }}
            disabled={suggestSprint.isPending}
          >
            {suggestSprint.isPending ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-1.5" />
            )}
            Suggest Sprint
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Download className="w-4 h-4 mr-1.5" />
            Import from Report
          </Button>
        </div>
      </div>

      {/* Stats banner */}
      {statsLoading ? (
        <Skeleton className="h-[100px] rounded-xl" />
      ) : stats && stats.total > 0 ? (
        <div className="shrink-0">
          <TrackerStatsBanner stats={stats} />
        </div>
      ) : null}

      {/* AI suggested next action */}
      {suggestedAction && (
        <div className="shrink-0 rounded-xl border border-[#E11D48]/30 bg-gradient-to-r from-rose-50 to-orange-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[#E11D48] shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#E11D48]">
                  Start this next
                </span>
                <span className="text-sm font-medium text-[#1C1917]">
                  {suggestedAction.action.title}
                </span>
                {suggestedAction.action.department && (
                  <span className="text-[10px] text-[#78716C] uppercase tracking-wide">
                    · {suggestedAction.action.department}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                {suggestedAction.reason}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                onClick={() => handleStartSuggested(suggestedAction.action.id)}
                disabled={moveAction.isPending}
                className="bg-[#E11D48] hover:bg-[#BE123C]"
              >
                {moveAction.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                )}
                Start Now
              </Button>
              <button
                onClick={() =>
                  setDismissedSuggestionId(suggestedAction.action.id)
                }
                className="p-1.5 text-[#A8A29E] hover:text-[#57534E] transition-colors"
                aria-label="Dismiss suggestion"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stalled Actions Alert */}
      {stalledActions && stalledActions.length > 0 && (
        <div className="shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-sm font-medium text-amber-800">
              {stalledActions.length} action{stalledActions.length > 1 ? 's' : ''} stalled for 5+ days
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {stalledActions.slice(0, 5).map((action) => (
              <button
                key={action.id}
                onClick={() => { setSelectedAction(action); setDetailOpen(true); }}
                className="text-xs rounded-full border border-amber-300 bg-white px-2.5 py-1 text-amber-700 hover:bg-amber-100 transition-colors"
              >
                {action.title}
              </button>
            ))}
            {stalledActions.length > 5 && (
              <span className="text-xs text-amber-600 py-1">
                +{stalledActions.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      {departments.length > 0 && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <span className="text-xs text-[#A8A29E] font-medium">Filter:</span>

          <button
            onClick={() => setFilters({})}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              !filters.department && !filters.priority
                ? 'bg-[#1C1917] text-white border-[#1C1917]'
                : 'border-[#E7E5E4] text-[#78716C] hover:border-[#D6D3D1]'
            }`}
          >
            All
          </button>

          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  department: f.department === dept ? undefined : dept,
                }))
              }
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                filters.department === dept
                  ? 'bg-[#1C1917] text-white border-[#1C1917]'
                  : 'border-[#E7E5E4] text-[#78716C] hover:border-[#D6D3D1]'
              }`}
            >
              {dept}
            </button>
          ))}

          {(['HIGH', 'CRITICAL'] as const).map((p) => (
            <button
              key={p}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  priority: f.priority === p ? undefined : p,
                }))
              }
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                filters.priority === p
                  ? 'bg-[#1C1917] text-white border-[#1C1917]'
                  : 'border-[#E7E5E4] text-[#78716C] hover:border-[#D6D3D1]'
              }`}
            >
              {p === 'HIGH' ? 'High Priority' : 'Critical'}
            </button>
          ))}
        </div>
      )}

      {/* Board */}
      {boardLoading ? (
        <div className="flex gap-3 flex-1 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="min-w-[280px] w-[280px] h-full rounded-xl" />
          ))}
        </div>
      ) : allActions.length === 0 && !filters.department && !filters.priority ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#F5F5F4] flex items-center justify-center">
            <KanbanSquare className="w-8 h-8 text-[#A8A29E]" />
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold text-[#1C1917] mb-1">
              No actions yet
            </h3>
            <p className="text-sm text-[#78716C] max-w-sm">
              Import recommendations from a completed report to start tracking
              your AI transformation.
            </p>
          </div>
          <Button onClick={() => setImportOpen(true)}>
            <Download className="w-4 h-4 mr-1.5" />
            Import from Report
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <KanbanBoard columns={columns} onCardClick={handleCardClick} onCardUpdate={handleCardUpdate} />
        </div>
      )}

      {/* Dialogs */}
      <ActionDetailDialog
        action={selectedAction}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedAction(null);
        }}
      />
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
