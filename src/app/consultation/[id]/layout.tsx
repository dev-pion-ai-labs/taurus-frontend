'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/shared/protected-route';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { useAbandonSession } from '@/hooks/use-sessions';

export default function ConsultationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const abandonSession = useAbandonSession(sessionId);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Default exit = save progress and leave. Session stays IN_PROGRESS so the
  // user can return any time from the dashboard or consultations hub. We do
  // NOT call the abandon endpoint here — that's an explicit "Discard" action.
  const handleSaveAndExit = () => {
    setDialogOpen(false);
    router.push('/dashboard');
  };

  const handleDiscard = async () => {
    try {
      await abandonSession.mutateAsync();
      toast.success('Consultation discarded');
    } catch {
      // Session may already be completed/abandoned — still navigate away.
    }
    router.push('/dashboard');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F5F5F4]">
        {/* Minimal header */}
        <header className="sticky top-0 z-40 border-b border-[#E7E5E4] bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-[640px] items-center justify-between px-6">
            <Link
              href="/dashboard"
              className="text-[16px] font-bold text-[#1C1917] transition-opacity hover:opacity-70"
            >
              Taurus
            </Link>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger
                render={
                  <Button variant="ghost" size="sm" className="gap-1.5 text-[#78716C] hover:text-[#1C1917]" />
                }
              >
                <LogOut className="h-4 w-4" />
                Exit
              </DialogTrigger>
              <DialogContent showCloseButton={false}>
                <DialogHeader>
                  <DialogTitle>Leaving the consultation?</DialogTitle>
                  <DialogDescription>
                    Your progress is auto-saved. Pick up where you left off
                    any time from the dashboard or the Consultations hub.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={handleDiscard}
                    disabled={abandonSession.isPending}
                    className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-[#A8A29E] transition-colors hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    {abandonSession.isPending
                      ? 'Discarding…'
                      : 'Discard this consultation'}
                  </button>
                  <div className="flex gap-2">
                    <DialogClose render={<Button variant="outline" />}>
                      Keep going
                    </DialogClose>
                    <Button
                      onClick={handleSaveAndExit}
                      className="bg-[#1C1917] text-white hover:bg-[#1C1917]/90"
                    >
                      Save & continue later
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Centered content area — fills remaining viewport height */}
        <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-[640px] flex-col justify-center px-6 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
