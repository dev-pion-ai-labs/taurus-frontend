'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { ActionCard } from './action-card';
import { useMoveAction } from '@/hooks/use-tracker';
import type { TransformationAction, ActionStatus } from '@/types';

const COLUMNS: {
  id: ActionStatus;
  label: string;
  headerBg: string;
  headerText: string;
  columnBg: string;
  accentBorder: string;
}[] = [
  {
    id: 'BACKLOG',
    label: 'Backlog',
    headerBg: 'bg-slate-100',
    headerText: 'text-slate-700',
    columnBg: 'bg-slate-50/50',
    accentBorder: 'border-t-slate-300',
  },
  {
    id: 'THIS_SPRINT',
    label: 'This Sprint',
    headerBg: 'bg-violet-100',
    headerText: 'text-violet-700',
    columnBg: 'bg-violet-50/30',
    accentBorder: 'border-t-violet-400',
  },
  {
    id: 'IN_PROGRESS',
    label: 'In Progress',
    headerBg: 'bg-blue-100',
    headerText: 'text-blue-700',
    columnBg: 'bg-blue-50/30',
    accentBorder: 'border-t-blue-400',
  },
  {
    id: 'AWAITING_APPROVAL',
    label: 'Awaiting Approval',
    headerBg: 'bg-amber-100',
    headerText: 'text-amber-700',
    columnBg: 'bg-amber-50/30',
    accentBorder: 'border-t-amber-400',
  },
  {
    id: 'DEPLOYED',
    label: 'Deployed',
    headerBg: 'bg-emerald-100',
    headerText: 'text-emerald-700',
    columnBg: 'bg-emerald-50/30',
    accentBorder: 'border-t-emerald-400',
  },
  {
    id: 'VERIFIED',
    label: 'Verified',
    headerBg: 'bg-green-100',
    headerText: 'text-green-800',
    columnBg: 'bg-green-50/30',
    accentBorder: 'border-t-green-500',
  },
];

interface KanbanBoardProps {
  columns: Record<ActionStatus, TransformationAction[]>;
  onCardClick: (action: TransformationAction) => void;
}

function DroppableColumn({
  column,
  actions,
  onCardClick,
}: {
  column: (typeof COLUMNS)[number];
  actions: TransformationAction[];
  onCardClick: (action: TransformationAction) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      className={`
        flex flex-col rounded-xl border border-[#E7E5E4] border-t-[3px]
        ${column.accentBorder} ${column.columnBg}
        min-w-[280px] w-[280px] shrink-0 max-h-full
      `}
    >
      {/* Column header */}
      <div className={`flex items-center gap-2 px-3.5 py-3 ${column.headerBg} rounded-t-lg`}>
        <h3 className={`text-sm font-semibold ${column.headerText}`}>
          {column.label}
        </h3>
        <span
          className={`
            text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center
            ${column.headerBg} ${column.headerText}
          `}
        >
          {actions.length}
        </span>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px]
          transition-colors duration-150
          ${isOver ? 'bg-[#F5F5F4]/80' : ''}
        `}
      >
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onClick={() => onCardClick(action)}
            />
          ))}

        {actions.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-[#A8A29E]">
            No actions
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ columns, onCardClick }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const moveAction = useMoveAction();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Find the active action across all columns
  const allActions = Object.values(columns).flat();
  const activeAction = activeId
    ? allActions.find((a) => a.id === activeId)
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const actionId = active.id as string;
    const targetColumnId = over.id as string;

    // Check if dropped on a column
    const isColumn = COLUMNS.some((c) => c.id === targetColumnId);
    if (!isColumn) return;

    // Find current column of the action
    const currentColumn = Object.entries(columns).find(([, actions]) =>
      actions.some((a) => a.id === actionId)
    );

    if (!currentColumn) return;
    const [currentStatus] = currentColumn;

    if (currentStatus === targetColumnId) return;

    moveAction.mutate({
      id: actionId,
      status: targetColumnId,
      orderIndex: columns[targetColumnId as ActionStatus]?.length || 0,
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 h-full">
        {COLUMNS.map((column) => (
          <DroppableColumn
            key={column.id}
            column={column}
            actions={columns[column.id] || []}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeAction && (
          <div className="rotate-3 scale-105">
            <ActionCard action={activeAction} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
