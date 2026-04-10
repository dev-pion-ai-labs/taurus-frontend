'use client';

import { useState } from 'react';
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
  Layers,
  Send,
  Trash2,
  User,
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

const priorityColors: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
};

interface ActionDetailDialogProps {
  action: TransformationAction | null;
  open: boolean;
  onClose: () => void;
}

export function ActionDetailDialog({
  action: initialAction,
  open,
  onClose,
}: ActionDetailDialogProps) {
  // Show the board data instantly; fetch full details (comments, etc.) in the background
  const { data: fetchedAction } = useTrackerAction(open ? initialAction?.id ?? null : null);
  const action = fetchedAction ?? initialAction;

  const updateAction = useUpdateAction();
  const deleteAction = useDeleteAction();
  const addComment = useAddComment();
  const actionId = action?.id ?? null;

  const [commentText, setCommentText] = useState('');
  const [blockerText, setBlockerText] = useState('');
  const [editingBlocker, setEditingBlocker] = useState(false);

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
              <DialogTitle className="text-base font-bold text-[#1C1917] leading-snug pr-6">
                {action.title}
              </DialogTitle>
            </DialogHeader>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-[11px] uppercase tracking-wide text-[#A8A29E] font-medium">Status</span>
                <p className="font-semibold text-[#1C1917] mt-0.5">
                  {statusLabels[action.status]}
                </p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wide text-[#A8A29E] font-medium">Priority</span>
                <p className="mt-0.5">
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${priorityColors[action.priority]}`}>
                    {action.priority}
                  </span>
                </p>
              </div>
              {action.department && (
                <div>
                  <span className="text-[11px] uppercase tracking-wide text-[#A8A29E] font-medium">Department</span>
                  <p className="font-medium text-[#1C1917] mt-0.5">{action.department}</p>
                </div>
              )}
              {action.phase && (
                <div className="flex items-start gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#A8A29E] mt-4" />
                  <div>
                    <span className="text-[11px] uppercase tracking-wide text-[#A8A29E] font-medium">Phase</span>
                    <p className="font-medium text-[#1C1917] mt-0.5">{action.phase}</p>
                  </div>
                </div>
              )}
              {action.estimatedValue != null && action.estimatedValue > 0 && (
                <div>
                  <span className="text-[11px] uppercase tracking-wide text-[#A8A29E] font-medium">Est. Value</span>
                  <p className="font-bold text-[#1C1917] mt-0.5">
                    {formatDollar(action.estimatedValue)}/yr
                  </p>
                </div>
              )}
              {action.estimatedEffort && (
                <div>
                  <span className="text-[11px] uppercase tracking-wide text-[#A8A29E] font-medium">Effort</span>
                  <p className="font-medium text-[#1C1917] mt-0.5">{action.estimatedEffort}</p>
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
              {action.dueDate && (
                <div className="flex items-start gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#A8A29E] mt-4" />
                  <div>
                    <span className="text-[11px] uppercase tracking-wide text-[#A8A29E] font-medium">Due</span>
                    <p className="font-medium text-[#1C1917] mt-0.5">
                      {new Date(action.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {action.description && (
              <div>
                <span className="text-[11px] uppercase tracking-wide text-[#A8A29E] font-medium">Description</span>
                <p className="text-sm text-[#44403C] mt-1 leading-relaxed">
                  {action.description}
                </p>
              </div>
            )}

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
                  className="ml-auto text-[11px] text-[#E11D48] font-medium hover:underline"
                >
                  {action.blockerNote ? 'Edit' : 'Add'}
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
