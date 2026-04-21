'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  MessageSquare,
  AlertTriangle,
  Clock,
  Calendar,
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

/** Lightweight card view used in drag overlay — no sortable hooks, no edit state */
export function ActionCardOverlay({ action }: { action: TransformationAction }) {
  const priority = priorityConfig[action.priority] || priorityConfig.MEDIUM;
  const category = action.category ? categoryConfig[action.category] : null;
  const effort = action.estimatedEffort ? effortConfig[action.estimatedEffort] : null;
  const commentCount = action._count?.comments || 0;

  const assigneeName = action.assignee
    ? [action.assignee.firstName, action.assignee.lastName]
        .filter(Boolean)
        .join(' ') || action.assignee.email.split('@')[0]
    : null;

  const assigneeInitials = action.assignee
    ? (action.assignee.firstName?.[0] || '') + (action.assignee.lastName?.[0] || '') ||
      action.assignee.email[0].toUpperCase()
    : null;

  const isOverdue = action.dueDate && new Date(action.dueDate) < new Date() &&
    !['DEPLOYED', 'VERIFIED'].includes(action.status);

  return (
    <div
      className="rounded-xl border border-[#D6D3D1] bg-white p-3.5 shadow-xl rotate-2 scale-[1.02] opacity-95 w-[264px]"
      style={{ willChange: 'transform' }}
    >
      <div className="flex items-start gap-1.5 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap flex-1">
          {category && (
            <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${category.bg} ${category.text}`}>
              {action.category}
            </span>
          )}
          {effort && (
            <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${effort.color}`}>
              <Clock className="w-2.5 h-2.5" />
              {effort.label}
            </span>
          )}
        </div>
      </div>

      <h4 className="text-sm font-semibold text-[#1C1917] leading-snug mb-1 line-clamp-2">
        {action.title}
      </h4>

      {action.description && (
        <p className="text-[11px] text-[#78716C] leading-relaxed mb-2 line-clamp-1">
          {action.description}
        </p>
      )}

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

      <div className="flex items-center gap-2 pt-2 border-t border-[#F5F5F4]">
        {assigneeName && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#E7E5E4] flex items-center justify-center">
              <span className="text-[9px] font-bold text-[#78716C]">{assigneeInitials}</span>
            </div>
            <span className="text-[11px] text-[#78716C] truncate max-w-[80px]">{assigneeName}</span>
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

export const ActionCard = memo(function ActionCard({ action, onClick, onUpdate }: ActionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: action.id });

  // CSS.Translate (translate-only) is cheaper than CSS.Transform (translate +
  // scale). Since kanban cards don't scale during sort, the scale matrix is
  // always identity — using Translate avoids unnecessary matrix math and
  // subpixel jitter on GPU rasterisation.
  const style = {
    transform: CSS.Translate.toString(transform),
    transition: transition || undefined,
    willChange: isDragging ? 'transform' : undefined,
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

  const cardRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  // Sync draft when action prop changes while not editing
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

  const flushSave = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (!onUpdate) return;
    const d = draftRef.current;
    onUpdate(action.id, {
      title: d.title,
      description: d.description || null,
      department: d.department || null,
      priority: d.priority,
      category: d.category || null,
      estimatedValue: d.estimatedValue ? parseFloat(d.estimatedValue) : null,
      estimatedEffort: d.estimatedEffort || null,
      dueDate: d.dueDate || null,
    });
  }, [onUpdate, action.id]);

  const scheduleSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(flushSave, 800);
  }, [flushSave]);

  // Update draft and schedule auto-save
  const updateDraft = useCallback((updater: (d: typeof draft) => typeof draft) => {
    setDraft((prev) => {
      const next = updater(prev);
      return next;
    });
    scheduleSave();
  }, [scheduleSave]);

  // Click outside to close edit mode
  useEffect(() => {
    if (!editing) return;
    function handleClickOutside(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        flushSave();
        setEditing(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editing, flushSave]);

  // Flush pending save on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Escape to close
  useEffect(() => {
    if (!editing) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        flushSave();
        setEditing(false);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [editing, flushSave]);

  function handleCardClick() {
    if (onUpdate) {
      setEditing(true);
    } else {
      onClick();
    }
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

  // ── Edit mode ────────────────────────────────────────────
  if (editing) {
    return (
      <div
        ref={(node) => {
          setNodeRef(node);
          (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        style={style}
        className="rounded-xl border-2 border-[#E11D48]/30 bg-white p-3.5 shadow-md space-y-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div>
          <label className="text-[10px] uppercase tracking-wide text-[#A8A29E] font-medium">Title</label>
          <input
            autoFocus
            value={draft.title}
            onChange={(e) => updateDraft((d) => ({ ...d, title: e.target.value }))}
            className="w-full text-sm font-semibold border border-[#E7E5E4] rounded-lg px-2.5 py-1.5 mt-0.5 focus:outline-none focus:border-[#E11D48]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-[10px] uppercase tracking-wide text-[#A8A29E] font-medium">Description</label>
          <textarea
            value={draft.description}
            onChange={(e) => updateDraft((d) => ({ ...d, description: e.target.value }))}
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
              onChange={(e) => updateDraft((d) => ({ ...d, priority: e.target.value as ActionPriority }))}
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
              onChange={(e) => updateDraft((d) => ({ ...d, category: e.target.value }))}
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
              onChange={(e) => updateDraft((d) => ({ ...d, department: e.target.value }))}
              placeholder="e.g. Engineering"
              className="w-full text-xs border border-[#E7E5E4] rounded-lg px-2.5 py-1.5 mt-0.5 focus:outline-none focus:border-[#E11D48]"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wide text-[#A8A29E] font-medium">Est. Value ($)</label>
            <input
              type="number"
              value={draft.estimatedValue}
              onChange={(e) => updateDraft((d) => ({ ...d, estimatedValue: e.target.value }))}
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
              onChange={(e) => updateDraft((d) => ({ ...d, estimatedEffort: e.target.value }))}
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
              onChange={(e) => updateDraft((d) => ({ ...d, dueDate: e.target.value }))}
              className="w-full text-xs border border-[#E7E5E4] rounded-lg px-2.5 py-1.5 mt-0.5 focus:outline-none focus:border-[#E11D48]"
            />
          </div>
        </div>

        <p className="text-[10px] text-[#A8A29E] text-right pt-0.5">Auto-saves as you type</p>
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
      onClick={handleCardClick}
      className={`
        group cursor-pointer rounded-xl border border-[#E7E5E4] bg-white p-3.5
        shadow-sm transition-shadow duration-150
        hover:shadow-md hover:border-[#D6D3D1]
        ${isDragging ? 'opacity-40 shadow-none !transition-none' : ''}
      `}
    >
      {/* Top row: badges */}
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
});
