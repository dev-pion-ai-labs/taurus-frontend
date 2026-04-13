'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDollar } from '@/lib/format';
import {
  useTrackerAction,
  useUpdateAction,
  useDeleteAction,
  useAddComment,
} from '@/hooks/use-tracker';
import {
  AlertTriangle,
  Calendar,
  Clock,
  DollarSign,
  Layers,
  Pencil,
  Send,
  Trash2,
  User,
  X,
  Check,
} from 'lucide-react';
import type { TransformationAction } from '@/types';

const statusLabels: Record<string, string> = {
  BACKLOG: 'Backlog',
  THIS_SPRINT: 'This Sprint',
  IN_PROGRESS: 'In Progress',
  AWAITING_APPROVAL: 'Awaiting Approval',
  DEPLOYED: 'Deployed',
  VERIFIED: 'Verified',
};

const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

const priorityColors: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
};

const categoryOptions = ['EFFICIENCY', 'GROWTH', 'EXPERIENCE', 'INTELLIGENCE'] as const;

const effortOptions = ['HOURS', 'DAYS', 'WEEKS', 'MONTHS'] as const;

interface ActionDetailDialogProps {
  action: TransformationAction | null;
  open: boolean;
  onClose: () => void;
}

function EditableField({
  label,
  value,
  onSave,
  isPending,
  type = 'text',
  icon,
  displayValue,
}: {
  label: string;
  value: string;
  onSave: (val: string) => void;
  isPending: boolean;
  type?: 'text' | 'textarea' | 'number' | 'date';
  icon?: React.ReactNode;
  displayValue?: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  function handleSave() {
    onSave(draft);
    setEditing(false);
  }

  function handleCancel() {
    setDraft(value);
    setEditing(false);
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[11px] uppercase tracking-wide text-[#A8A29E] font-medium">
          {label}
        </span>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="ml-auto text-[#A8A29E] hover:text-[#E11D48] transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>
      {editing ? (
        <div className="flex gap-1.5 items-start">
          {type === 'textarea' ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              className="flex-1 text-sm border border-[#E7E5E4] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#E11D48] resize-none"
            />
          ) : (
            <input
              type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="flex-1 text-sm border border-[#E7E5E4] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#E11D48]"
              min={type === 'number' ? 0 : undefined}
            />
          )}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1.5 text-[#A8A29E] hover:bg-[#F5F5F4] rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        displayValue || (
          <p className="font-medium text-[#1C1917] mt-0.5 text-sm">
            {value || <span className="text-[#A8A29E] italic">Not set</span>}
          </p>
        )
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onSave,
  isPending,
  icon,
  renderValue,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onSave: (val: string) => void;
  isPending: boolean;
  icon?: React.ReactNode;
  renderValue?: (val: string) => React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[11px] uppercase tracking-wide text-[#A8A29E] font-medium">
          {label}
        </span>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="ml-auto text-[#A8A29E] hover:text-[#E11D48] transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>
      {editing ? (
        <div className="flex gap-1.5 items-center">
          <select
            value={value}
            onChange={(e) => {
              onSave(e.target.value);
              setEditing(false);
            }}
            disabled={isPending}
            className="flex-1 text-sm border border-[#E7E5E4] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#E11D48] bg-white"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt.charAt(0) + opt.slice(1).toLowerCase().replace('_', ' ')}
              </option>
            ))}
          </select>
          <button
            onClick={() => setEditing(false)}
            className="p-1.5 text-[#A8A29E] hover:bg-[#F5F5F4] rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="mt-0.5">
          {renderValue ? renderValue(value) : (
            <p className="font-medium text-[#1C1917] text-sm">
              {value ? value.charAt(0) + value.slice(1).toLowerCase().replace('_', ' ') : <span className="text-[#A8A29E] italic">Not set</span>}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function ActionDetailDialog({
  action: initialAction,
  open,
  onClose,
}: ActionDetailDialogProps) {
  const { data: fetchedAction } = useTrackerAction(open ? initialAction?.id ?? null : null);
  const action = fetchedAction ?? initialAction;

  const updateAction = useUpdateAction();
  const deleteAction = useDeleteAction();
  const addComment = useAddComment();
  const actionId = action?.id ?? null;

  const [commentText, setCommentText] = useState('');
  const [blockerText, setBlockerText] = useState('');
  const [editingBlocker, setEditingBlocker] = useState(false);

  function handleUpdate(field: string, value: unknown) {
    if (!actionId) return;
    updateAction.mutate({ id: actionId, [field]: value });
  }

  function handleAddComment() {
    if (!commentText.trim() || !actionId) return;
    addComment.mutate(
      { actionId, content: commentText.trim() },
      { onSuccess: () => setCommentText('') }
    );
  }

  function handleSaveBlocker() {
    if (!actionId) return;
    updateAction.mutate(
      { id: actionId, blockerNote: blockerText || '' },
      {
        onSuccess: () => setEditingBlocker(false),
      }
    );
  }

  function handleDelete() {
    if (!actionId) return;
    deleteAction.mutate(actionId, { onSuccess: onClose });
  }

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        {!action ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <EditableField
                label=""
                value={action.title}
                onSave={(val) => handleUpdate('title', val)}
                isPending={updateAction.isPending}
                displayValue={
                  <DialogTitle className="text-base font-bold text-[#1C1917] leading-snug pr-6">
                    {action.title}
                  </DialogTitle>
                }
              />
            </DialogHeader>

            {/* Description */}
            <EditableField
              label="Description"
              value={action.description || ''}
              onSave={(val) => handleUpdate('description', val)}
              isPending={updateAction.isPending}
              type="textarea"
              displayValue={
                action.description ? (
                  <p className="text-sm text-[#44403C] mt-1 leading-relaxed">
                    {action.description}
                  </p>
                ) : (
                  <p className="text-sm text-[#A8A29E] mt-1 italic">No description</p>
                )
              }
            />

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <SelectField
                label="Status"
                value={action.status}
                options={Object.keys(statusLabels) as unknown as readonly string[]}
                onSave={(val) => handleUpdate('status', val)}
                isPending={updateAction.isPending}
                renderValue={(val) => (
                  <p className="font-semibold text-[#1C1917]">
                    {statusLabels[val]}
                  </p>
                )}
              />

              <SelectField
                label="Priority"
                value={action.priority}
                options={priorityOptions}
                onSave={(val) => handleUpdate('priority', val)}
                isPending={updateAction.isPending}
                renderValue={(val) => (
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${priorityColors[val]}`}>
                    {val}
                  </span>
                )}
              />

              <EditableField
                label="Department"
                value={action.department || ''}
                onSave={(val) => handleUpdate('department', val)}
                isPending={updateAction.isPending}
              />

              <SelectField
                label="Category"
                value={action.category || ''}
                options={categoryOptions}
                onSave={(val) => handleUpdate('category', val)}
                isPending={updateAction.isPending}
              />

              <EditableField
                label="Est. Value"
                value={action.estimatedValue?.toString() || ''}
                onSave={(val) => handleUpdate('estimatedValue', val ? parseFloat(val) : null)}
                isPending={updateAction.isPending}
                type="number"
                icon={<DollarSign className="w-3.5 h-3.5 text-[#A8A29E]" />}
                displayValue={
                  action.estimatedValue != null && action.estimatedValue > 0 ? (
                    <p className="font-bold text-[#1C1917] mt-0.5">
                      {formatDollar(action.estimatedValue)}/yr
                    </p>
                  ) : (
                    <p className="text-sm text-[#A8A29E] mt-0.5 italic">Not set</p>
                  )
                }
              />

              <EditableField
                label="Actual Value"
                value={action.actualValue?.toString() || ''}
                onSave={(val) => handleUpdate('actualValue', val ? parseFloat(val) : null)}
                isPending={updateAction.isPending}
                type="number"
                icon={<DollarSign className="w-3.5 h-3.5 text-[#A8A29E]" />}
                displayValue={
                  action.actualValue != null && action.actualValue > 0 ? (
                    <p className="font-bold text-emerald-600 mt-0.5">
                      {formatDollar(action.actualValue)}/yr
                    </p>
                  ) : (
                    <p className="text-sm text-[#A8A29E] mt-0.5 italic">Not set</p>
                  )
                }
              />

              <SelectField
                label="Effort"
                value={action.estimatedEffort || ''}
                options={effortOptions}
                onSave={(val) => handleUpdate('estimatedEffort', val)}
                isPending={updateAction.isPending}
                icon={<Clock className="w-3.5 h-3.5 text-[#A8A29E]" />}
              />

              {action.phase != null && (
                <div className="flex items-start gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#A8A29E] mt-4" />
                  <EditableField
                    label="Phase"
                    value={action.phase?.toString() || ''}
                    onSave={(val) => handleUpdate('phase', val ? parseInt(val) : null)}
                    isPending={updateAction.isPending}
                    type="number"
                  />
                </div>
              )}

              {action.assignee && (
                <div className="flex items-start gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#A8A29E] mt-4" />
                  <div>
                    <span className="text-[11px] uppercase tracking-wide text-[#A8A29E] font-medium">Assignee</span>
                    <p className="font-medium text-[#1C1917] mt-0.5">
                      {[action.assignee.firstName, action.assignee.lastName]
                        .filter(Boolean)
                        .join(' ') || action.assignee.email}
                    </p>
                  </div>
                </div>
              )}

              <EditableField
                label="Due Date"
                value={action.dueDate ? new Date(action.dueDate).toISOString().split('T')[0] : ''}
                onSave={(val) => handleUpdate('dueDate', val || null)}
                isPending={updateAction.isPending}
                type="date"
                icon={<Calendar className="w-3.5 h-3.5 text-[#A8A29E]" />}
                displayValue={
                  action.dueDate ? (
                    <p className={`font-medium mt-0.5 ${
                      new Date(action.dueDate) < new Date() && !['DEPLOYED', 'VERIFIED'].includes(action.status)
                        ? 'text-red-500'
                        : 'text-[#1C1917]'
                    }`}>
                      {new Date(action.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {new Date(action.dueDate) < new Date() && !['DEPLOYED', 'VERIFIED'].includes(action.status) && (
                        <span className="text-xs ml-1">(overdue)</span>
                      )}
                    </p>
                  ) : (
                    <p className="text-sm text-[#A8A29E] mt-0.5 italic">Not set</p>
                  )
                }
              />
            </div>

            {/* Blocker */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className={`w-3.5 h-3.5 ${action.blockerNote ? 'text-red-500' : 'text-[#A8A29E]'}`} />
                <span className="text-[11px] uppercase tracking-wide text-[#A8A29E] font-medium">Blocker</span>
                <button
                  onClick={() => {
                    setBlockerText(action.blockerNote || '');
                    setEditingBlocker(true);
                  }}
                  className="ml-auto text-[#A8A29E] hover:text-[#E11D48] transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
              {editingBlocker ? (
                <div className="flex gap-2">
                  <input
                    value={blockerText}
                    onChange={(e) => setBlockerText(e.target.value)}
                    placeholder="Describe the blocker..."
                    className="flex-1 text-sm border border-[#E7E5E4] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#E11D48]"
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveBlocker}
                    disabled={updateAction.isPending}
                  >
                    Save
                  </Button>
                </div>
              ) : action.blockerNote ? (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {action.blockerNote}
                </div>
              ) : (
                <p className="text-xs text-[#A8A29E]">No blockers</p>
              )}
            </div>

            {/* Comments */}
            <div>
              <span className="text-[11px] uppercase tracking-wide text-[#A8A29E] font-medium">
                Comments ({action.comments?.length || 0})
              </span>
              <div className="mt-2 space-y-3 max-h-[200px] overflow-y-auto">
                {action.comments?.map((c) => (
                  <div key={c.id} className="bg-[#FAFAF9] rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-[#1C1917]">
                        {[c.user.firstName, c.user.lastName]
                          .filter(Boolean)
                          .join(' ') || c.user.email}
                      </span>
                      <span className="text-[10px] text-[#A8A29E]">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-[#44403C]">{c.content}</p>
                  </div>
                ))}
              </div>

              {/* Add comment */}
              <div className="flex gap-2 mt-3">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 text-sm border border-[#E7E5E4] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#E11D48]"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={addComment.isPending || !commentText.trim()}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Delete */}
            <div className="pt-2 border-t border-[#F5F5F4]">
              <button
                onClick={handleDelete}
                disabled={deleteAction.isPending}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleteAction.isPending ? 'Deleting...' : 'Delete Action'}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
