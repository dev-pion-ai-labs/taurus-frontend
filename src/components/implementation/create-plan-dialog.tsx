'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCreatePlan } from '@/hooks/use-implementation';
import { Loader2, Rocket } from 'lucide-react';
import { toast } from 'sonner';

interface CreatePlanDialogProps {
  open: boolean;
  onClose: () => void;
  actionId: string;
  actionTitle: string;
  onCreated: (planId: string) => void;
}

export function CreatePlanDialog({
  open,
  onClose,
  actionId,
  actionTitle,
  onCreated,
}: CreatePlanDialogProps) {
  const createPlan = useCreatePlan();

  function handleCreate() {
    createPlan.mutate(
      { actionId },
      {
        onSuccess: (data) => {
          toast.success('Deployment plan created — AI is generating your plan');
          onCreated(data.id);
          onClose();
        },
        onError: () => toast.error('Failed to create deployment plan'),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Deployment Plan</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[#78716C]">
            The AI will analyze your organization&apos;s context — departments,
            tech stack, and transformation report — to generate a detailed
            step-by-step deployment plan for:
          </p>
          <div className="rounded-lg border border-[#E7E5E4] bg-[#FAFAF9] px-4 py-3">
            <p className="text-sm font-semibold text-[#1C1917]">
              {actionTitle}
            </p>
          </div>
          <p className="text-xs text-[#A8A29E]">
            This typically takes 30–60 seconds. You&apos;ll be able to review and
            refine the plan before approving.
          </p>
          <div className="flex items-center gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={createPlan.isPending}
            >
              {createPlan.isPending ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Rocket className="w-4 h-4 mr-1.5" />
              )}
              Generate Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
