'use client';

import { useDraggable } from '@dnd-kit/core';
import { MessageSquare, AlertTriangle } from 'lucide-react';
import { formatDollar } from '@/lib/format';
import type { TransformationAction } from '@/types';

const priorityConfig: Record<string, { dot: string; label: string }> = {
  CRITICAL: { dot: 'bg-red-500', label: 'Critical' },
  HIGH: { dot: 'bg-orange-500', label: 'High' },
  MEDIUM: { dot: 'bg-yellow-500', label: 'Medium' },
  LOW: { dot: 'bg-green-500', label: 'Low' },
};

const categoryConfig: Record<string, { bg: string; text: string }> = {
  EFFICIENCY: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  GROWTH: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  EXPERIENCE: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
  INTELLIGENCE: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
};

interface ActionCardProps {
  action: TransformationAction;
  onClick: () => void;
}

export function ActionCard({ action, onClick }: ActionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({ id: action.id });

  const priority = priorityConfig[action.priority] || priorityConfig.MEDIUM;
  const category = action.category
    ? categoryConfig[action.category]
    : null;

  const assigneeName = action.assignee
    ? [action.assignee.firstName, action.assignee.lastName]
        .filter(Boolean)
        .join(' ') || action.assignee.email.split('@')[0]
    : null;

  const assigneeInitials = action.assignee
    ? (action.assignee.firstName?.[0] || '') + (action.assignee.lastName?.[0] || '') ||
      action.assignee.email[0].toUpperCase()
    : null;

  const commentCount = action._count?.comments || 0;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        group cursor-pointer rounded-xl border border-[#E7E5E4] bg-white p-3.5
        shadow-sm transition-all duration-150
        hover:shadow-md hover:border-[#D6D3D1]
        ${isDragging ? 'opacity-50 shadow-lg rotate-2 scale-105' : ''}
      `}
    >
      {/* Category badge */}
      {category && (
        <span
          className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border mb-2 ${category.bg} ${category.text}`}
        >
          {action.category}
        </span>
      )}

      {/* Title */}
      <h4 className="text-sm font-semibold text-[#1C1917] leading-snug mb-2 line-clamp-2">
        {action.title}
      </h4>

      {/* Department + Priority row */}
      <div className="flex items-center gap-2 mb-2.5">
        {action.department && (
          <span className="text-[11px] font-medium text-[#78716C] bg-[#F5F5F4] px-2 py-0.5 rounded-md">
            {action.department}
          </span>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <span className={`w-2 h-2 rounded-full ${priority.dot}`} />
          <span className="text-[10px] text-[#A8A29E] font-medium">{priority.label}</span>
        </div>
      </div>

      {/* Value */}
      {action.estimatedValue != null && action.estimatedValue > 0 && (
        <p className="text-xs font-semibold text-[#1C1917] mb-2.5">
          {formatDollar(action.estimatedValue)}
          <span className="text-[#A8A29E] font-normal">/yr</span>
        </p>
      )}

      {/* Bottom row: assignee + comments + blocker */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#F5F5F4]">
        {assigneeName && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#E7E5E4] flex items-center justify-center">
              <span className="text-[9px] font-bold text-[#78716C]">
                {assigneeInitials}
              </span>
            </div>
            <span className="text-[11px] text-[#78716C] truncate max-w-[80px]">
              {assigneeName}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {commentCount > 0 && (
            <div className="flex items-center gap-0.5 text-[#A8A29E]">
              <MessageSquare className="w-3 h-3" />
              <span className="text-[10px] font-medium">{commentCount}</span>
            </div>
          )}

          {action.blockerNote && (
            <div className="flex items-center gap-0.5 text-red-500">
              <AlertTriangle className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
