'use client';

import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  MessageSquare,
  AlertTriangle,
  Clock,
  Calendar,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { formatDollar } from '@/lib/format';
import type { TransformationAction, ActionPriority } from '@/types';

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

const effortConfig: Record<string, { label: string; color: string }> = {
  HOURS: { label: 'Hours', color: 'bg-green-50 text-green-700 border-green-200' },
  DAYS: { label: 'Days', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  WEEKS: { label: 'Weeks', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  MONTHS: { label: 'Months', color: 'bg-red-50 text-red-700 border-red-200' },
};

const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const categoryOptions = ['EFFICIENCY', 'GROWTH', 'EXPERIENCE', 'INTELLIGENCE'] as const;
const effortOptions = ['HOURS', 'DAYS', 'WEEKS', 'MONTHS'] as const;

interface ActionCardProps {
  action: TransformationAction;
  onClick: () => void;
  onUpdate?: (id: string, data: Record<string, unknown>) => void;
}

export function ActionCard({ action, onClick, onUpdate }: ActionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: action.title,
    description: action.description || '',
    department: action.department || '',
    priority: action.priority,
    category: action.category || '',
    estimatedValue: action.estimatedValue?.toString() || '',
    estimatedEffort: action.estimatedEffort || '',
    dueDate: action.dueDate ? new Date(action.dueDate).toISOString().split('T')[0] : '',
  });

  // Sync draft when action prop changes (e.g. after server response)
  useEffect(() => {
    if (!editing) {
      setDraft({
        title: action.title,
        description: action.description || '',
        department: action.department || '',
        priority: action.priority,
        category: action.category || '',
        estimatedValue: action.estimatedValue?.toString() || '',
        estimatedEffort: action.estimatedEffort || '',
        dueDate: action.dueDate ? new Date(action.dueDate).toISOString().split('T')[0] : '',
      });
    }
  }, [action, editing]);

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    if (!onUpdate) return;
    onUpdate(action.id, {
      title: draft.title,
      description: draft.description || null,
      department: draft.department || null,
      priority: draft.priority,
      category: draft.category || null,
      estimatedValue: draft.estimatedValue ? parseFloat(draft.estimatedValue) : null,
      estimatedEffort: draft.estimatedEffort || null,
      dueDate: draft.dueDate || null,
    });
    setEditing(false);
  }

  function handleCancel(e: React.MouseEvent) {
    e.stopPropagation();
    setDraft({
      title: action.title,
      description: action.description || '',
      department: action.department || '',
      priority: action.priority,
      category: action.category || '',
      estimatedValue: action.estimatedValue?.toString() || '',
      estimatedEffort: action.estimatedEffort || '',
      dueDate: action.dueDate ? new Date(action.dueDate).toISOString().split('T')[0] : '',
    });
    setEditing(false);
  }

  function handleEditClick(e: React.MouseEvent) {
    e.stopPropagation();
    setEditing(true);
  }

  const priority = priorityConfig[action.priority] || priorityConfig.MEDIUM;
  const category = action.category ? categoryConfig[action.category] : null;

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
  const effort = action.estimatedEffort ? effortConfig[action.estimatedEffort] : null;

  const isOverdue = action.dueDate && new Date(action.dueDate) < new Date() &&
    !['DEPLOYED', 'VERIFIED'].includes(action.status);

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `${diffDays}d left`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // ── Edit mode ────────────────────────────────────────────
  if (editing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-xl border-2 border-[#E11D48]/30 bg-white p-3.5 shadow-md space-y-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div>
          <label className="text-[10px] uppercase tracking-wide text-[#A8A29E] font-medium">Title</label>
          <input
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            className="w-full text-sm font-semibold border border-[#E7E5E4] rounded-lg px-2.5 py-1.5 mt-0.5 focus:outline-none focus:border-[#E11D48]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-[10px] uppercase tracking-wide text-[#A8A29E] font-medium">Description</label>
          <textarea
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            rows={2}
            placeholder="Short description..."
            className="w-full text-xs border border-[#E7E5E4] rounded-lg px-2.5 py-1.5 mt-0.5 focus:outline-none focus:border-[#E11D48] resize-none"
          />
        </div>

        {/* Priority + Category row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase tracking-wide text-[#A8A29E] font-medium">Priority</label>
            <select
              value={draft.priority}
              onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value as ActionPriority }))}
              className="w-full text-xs border border-[#E7E5E4] rounded-lg px-2 py-1.5 mt-0.5 focus:outline-none focus:border-[#E11D48] bg-white"
            >
              {priorityOptions.map((opt) => (
                <option key={opt} value={opt}>{opt.charAt(0) + opt.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wide text-[#A8A29E] font-medium">Category</label>
            <select
              value={draft.category}
              onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
              className="w-full text-xs border border-[#E7E5E4] rounded-lg px-2 py-1.5 mt-0.5 focus:outline-none focus:border-[#E11D48] bg-white"
            >
              <option value="">None</option>
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt}>{opt.charAt(0) + opt.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Department + Value row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase tracking-wide text-[#A8A29E] font-medium">Department</label>
            <input
              value={draft.department}
              onChange={(e) => setDraft((d) => ({ ...d, department: e.target.value }))}
              placeholder="e.g. Engineering"
              className="w-full text-xs border border-[#E7E5E4] rounded-lg px-2.5 py-1.5 mt-0.5 focus:outline-none focus:border-[#E11D48]"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wide text-[#A8A29E] font-medium">Est. Value ($)</label>
            <input
              type="number"
              value={draft.estimatedValue}
              onChange={(e) => setDraft((d) => ({ ...d, estimatedValue: e.target.value }))}
              placeholder="0"
              min={0}
              className="w-full text-xs border border-[#E7E5E4] rounded-lg px-2.5 py-1.5 mt-0.5 focus:outline-none focus:border-[#E11D48]"
            />
          </div>
        </div>

        {/* Effort + Due date row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase tracking-wide text-[#A8A29E] font-medium">Effort</label>
            <select
              value={draft.estimatedEffort}
              onChange={(e) => setDraft((d) => ({ ...d, estimatedEffort: e.target.value }))}
              className="w-full text-xs border border-[#E7E5E4] rounded-lg px-2 py-1.5 mt-0.5 focus:outline-none focus:border-[#E11D48] bg-white"
            >
              <option value="">None</option>
              {effortOptions.map((opt) => (
                <option key={opt} value={opt}>{opt.charAt(0) + opt.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wide text-[#A8A29E] font-medium">Due Date</label>
            <input
              type="date"
              value={draft.dueDate}
              onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))}
              className="w-full text-xs border border-[#E7E5E4] rounded-lg px-2.5 py-1.5 mt-0.5 focus:outline-none focus:border-[#E11D48]"
            />
          </div>
        </div>

        {/* Save / Cancel */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 text-xs font-medium text-white bg-[#E11D48] hover:bg-[#BE123C] px-3 py-1.5 rounded-lg transition-colors"
          >
            <Check className="w-3 h-3" />
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 text-xs font-medium text-[#78716C] hover:text-[#1C1917] px-3 py-1.5 rounded-lg transition-colors"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── View mode ────────────────────────────────────────────
  return (
    <div
      ref={setNodeRef}
      style={style}
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
      {/* Top row: badges + edit button */}
      <div className="flex items-start gap-1.5 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap flex-1">
          {category && (
            <span
              className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${category.bg} ${category.text}`}
            >
              {action.category}
            </span>
          )}
          {effort && (
            <span
              className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${effort.color}`}
            >
              <Clock className="w-2.5 h-2.5" />
              {effort.label}
            </span>
          )}
        </div>

        {/* Edit button — visible on hover */}
        {onUpdate && (
          <button
            onClick={handleEditClick}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-[#A8A29E] hover:text-[#E11D48] hover:bg-[#FFF1F2] transition-all shrink-0"
            title="Edit card"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-[#1C1917] leading-snug mb-1 line-clamp-2">
        {action.title}
      </h4>

      {/* Description preview */}
      {action.description && (
        <p className="text-[11px] text-[#78716C] leading-relaxed mb-2 line-clamp-1">
          {action.description}
        </p>
      )}

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

      {/* Value + Due date row */}
      <div className="flex items-center gap-2 mb-2.5">
        {action.estimatedValue != null && action.estimatedValue > 0 && (
          <p className="text-xs font-semibold text-[#1C1917]">
            {formatDollar(action.estimatedValue)}
            <span className="text-[#A8A29E] font-normal">/yr</span>
          </p>
        )}
        {action.dueDate && (
          <div className={`flex items-center gap-1 ml-auto text-[10px] font-medium ${
            isOverdue ? 'text-red-500' : 'text-[#A8A29E]'
          }`}>
            <Calendar className="w-2.5 h-2.5" />
            <span>{formatDueDate(action.dueDate)}</span>
          </div>
        )}
      </div>

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
