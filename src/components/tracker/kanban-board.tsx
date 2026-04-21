'use client';

import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { ActionCard, ActionCardOverlay } from './action-card';
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

const COLUMN_IDS = new Set(COLUMNS.map((c) => c.id as string));

interface KanbanBoardProps {
  columns: Record<ActionStatus, TransformationAction[]>;
  onCardClick: (action: TransformationAction) => void;
  onCardUpdate?: (id: string, data: Record<string, unknown>) => void;
}

const DroppableColumn = memo(function DroppableColumn({
  column,
  actions,
  onCardClick,
  onCardUpdate,
}: {
  column: (typeof COLUMNS)[number];
  actions: TransformationAction[];
  onCardClick: (action: TransformationAction) => void;
  onCardUpdate?: (id: string, data: Record<string, unknown>) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const itemIds = useMemo(() => actions.map((a) => a.id), [actions]);

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
          transition-colors duration-200 ease-out
          ${isOver ? 'bg-[#F5F5F4]/80' : ''}
        `}
      >
        <SortableContext
          items={itemIds}
          strategy={verticalListSortingStrategy}
        >
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onClick={() => onCardClick(action)}
              onUpdate={onCardUpdate}
            />
          ))}
        </SortableContext>

        {actions.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-[#A8A29E]">
            No actions
          </div>
        )}
      </div>
    </div>
  );
});

/** Find which column a card lives in */
function findColumnOfCard(
  cols: Record<ActionStatus, TransformationAction[]>,
  cardId: string,
): ActionStatus | null {
  for (const status of Object.keys(cols) as ActionStatus[]) {
    if (cols[status].some((a) => a.id === cardId)) return status;
  }
  return null;
}

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const dropAnimationConfig = {
  duration: 200,
  easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
};

export function KanbanBoard({ columns: serverColumns, onCardClick, onCardUpdate }: KanbanBoardProps) {
  const [localColumns, setLocalColumns] = useState(serverColumns);
  const [activeId, setActiveId] = useState<string | null>(null);
  const moveAction = useMoveAction();
  const dragOrigin = useRef<{ status: ActionStatus; index: number } | null>(null);
  // Ref to read localColumns in handleDragEnd without stale closure
  const localColumnsRef = useRef(localColumns);
  localColumnsRef.current = localColumns;
  // Guard ref: dragOver fires on every pointer move even when the hover
  // target hasn't changed. Re-running setState on every move triggers a
  // full board re-render → dnd-kit re-measures → emits more events. The
  // positive feedback loop is what makes the drag feel stuttery. Bail out
  // when the resolved (activeId, overId) pair is unchanged from last call.
  const lastHoverRef = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Sync local state with server data when not mid-drag
  useEffect(() => {
    if (!activeId) setLocalColumns(serverColumns);
  }, [serverColumns, activeId]);

  const activeAction = useMemo(() => {
    if (!activeId) return null;
    for (const actions of Object.values(localColumns)) {
      const found = actions.find((a) => a.id === activeId);
      if (found) return found;
    }
    return null;
  }, [activeId, localColumns]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
    lastHoverRef.current = null;
    const col = findColumnOfCard(serverColumns, id);
    if (col) {
      const idx = serverColumns[col].findIndex((a) => a.id === id);
      dragOrigin.current = { status: col, index: idx };
    }
  }, [serverColumns]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeCardId = active.id as string;
    const overId = over.id as string;

    // Cheap early-out: if we're hovering over the same target as the last
    // event, no state change is needed. This is THE smoothness fix — the
    // dnd-kit pointer sensor fires dragOver continuously during a drag.
    const hoverKey = `${activeCardId}::${overId}`;
    if (lastHoverRef.current === hoverKey) return;
    lastHoverRef.current = hoverKey;

    setLocalColumns((prev) => {
      const fromCol = findColumnOfCard(prev, activeCardId);
      if (!fromCol) return prev;

      let toCol: ActionStatus;
      if (COLUMN_IDS.has(overId)) {
        toCol = overId as ActionStatus;
      } else {
        const col = findColumnOfCard(prev, overId);
        if (!col) return prev;
        toCol = col;
      }

      // Same column — reorder
      if (fromCol === toCol) {
        const items = prev[fromCol];
        const oldIdx = items.findIndex((a) => a.id === activeCardId);
        const newIdx = items.findIndex((a) => a.id === overId);
        if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return prev;
        return { ...prev, [fromCol]: arrayMove(items, oldIdx, newIdx) };
      }

      // Cross-column — move card
      const fromItems = [...prev[fromCol]];
      const toItems = [...prev[toCol]];
      const fromIdx = fromItems.findIndex((a) => a.id === activeCardId);
      if (fromIdx === -1) return prev;

      const [moved] = fromItems.splice(fromIdx, 1);
      const movedCard = { ...moved, status: toCol };

      const overIdx = toItems.findIndex((a) => a.id === overId);
      if (overIdx >= 0) {
        toItems.splice(overIdx, 0, movedCard);
      } else {
        toItems.push(movedCard);
      }

      return { ...prev, [fromCol]: fromItems, [toCol]: toItems };
    });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const origin = dragOrigin.current;
    dragOrigin.current = null;
    setActiveId(null);
    lastHoverRef.current = null;

    if (!over || !origin) return;

    const actionId = active.id as string;
    const cols = localColumnsRef.current;
    const finalCol = findColumnOfCard(cols, actionId);
    if (!finalCol) return;

    const finalIdx = cols[finalCol].findIndex((a) => a.id === actionId);

    if (finalCol === origin.status && finalIdx === origin.index) return;

    moveAction.mutate({
      id: actionId,
      status: finalCol,
      orderIndex: finalIdx,
    });
  }, [moveAction]);

  const stableOnCardClick = useCallback(
    (action: TransformationAction) => onCardClick(action),
    [onCardClick]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      measuring={measuring}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 h-full">
        {COLUMNS.map((column) => (
          <DroppableColumn
            key={column.id}
            column={column}
            actions={localColumns[column.id] || []}
            onCardClick={stableOnCardClick}
            onCardUpdate={onCardUpdate}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeAction && (
          <ActionCardOverlay action={activeAction} />
        )}
      </DragOverlay>
    </DndContext>
  );
}
