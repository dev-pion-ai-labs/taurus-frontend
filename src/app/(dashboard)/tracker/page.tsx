'use client';

import { useState } from 'react';
import { useTrackerBoard, useTrackerStats } from '@/hooks/use-tracker';
import { KanbanBoard } from '@/components/tracker/kanban-board';
import { TrackerStatsBanner } from '@/components/tracker/tracker-stats';
import { ActionDetailDialog } from '@/components/tracker/action-detail-dialog';
import { ImportDialog } from '@/components/tracker/import-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Plus, KanbanSquare } from 'lucide-react';
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
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const { data: board, isLoading: boardLoading } = useTrackerBoard(filters);
  const { data: stats, isLoading: statsLoading } = useTrackerStats();

  const columns = board?.columns || EMPTY_COLUMNS;

  // Extract unique departments from all actions for filter
  const allActions = Object.values(columns).flat();
  const departments = [...new Set(allActions.map((a) => a.department).filter(Boolean))] as string[];

  function handleCardClick(action: TransformationAction) {
    setSelectedActionId(action.id);
    setDetailOpen(true);
  }

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
          <KanbanBoard columns={columns} onCardClick={handleCardClick} />
        </div>
      )}

      {/* Dialogs */}
      <ActionDetailDialog
        actionId={selectedActionId}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedActionId(null);
        }}
      />
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
