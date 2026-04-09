'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSessions } from '@/hooks/use-sessions';
import { useImportFromReport } from '@/hooks/use-tracker';
import { CheckCircle2, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ImportDialog({ open, onClose }: ImportDialogProps) {
  const { data: sessionsData } = useSessions(1);
  const importFromReport = useImportFromReport();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const completedSessions =
    (Array.isArray(sessionsData) ? sessionsData : []).filter(
      (s) => s.status === 'COMPLETED'
    );

  function handleImport() {
    if (!selectedId) return;
    importFromReport.mutate(selectedId, {
      onSuccess: (result) => {
        toast.success(
          `Imported ${result.imported} actions${result.skipped > 0 ? ` (${result.skipped} already existed)` : ''}`
        );
        onClose();
        setSelectedId(null);
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to import');
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import from Report</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-[#78716C]">
          Select a completed consultation to import its recommendations as tracker actions.
        </p>

        <div className="max-h-[300px] overflow-y-auto space-y-2 mt-2">
          {completedSessions.length === 0 ? (
            <p className="text-sm text-[#A8A29E] text-center py-8">
              No completed sessions found.
            </p>
          ) : (
            completedSessions.map((session: any) => (
              <button
                key={session.id}
                onClick={() => setSelectedId(session.id)}
                className={`
                  w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all
                  ${
                    selectedId === session.id
                      ? 'border-[#E11D48] bg-[#FFF1F2]'
                      : 'border-[#E7E5E4] hover:border-[#D6D3D1] bg-white'
                  }
                `}
              >
                <FileText
                  className={`w-5 h-5 shrink-0 ${
                    selectedId === session.id ? 'text-[#E11D48]' : 'text-[#A8A29E]'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#1C1917] truncate">
                    Session — {new Date(session.completedAt || session.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-[#78716C]">
                    Started {new Date(session.startedAt).toLocaleDateString()}
                  </p>
                </div>
                {selectedId === session.id && (
                  <CheckCircle2 className="w-5 h-5 text-[#E11D48] shrink-0" />
                )}
              </button>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedId || importFromReport.isPending}
          >
            {importFromReport.isPending ? 'Importing...' : 'Import Actions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
