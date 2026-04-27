'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LogOut, Trash2 } from 'lucide-react';
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
import { useAbandonSession, useSession } from '@/hooks/use-sessions';

export default function ConsultationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const session = useSession(sessionId);
  const abandonSession = useAbandonSession(sessionId);
  const [dialogOpen, setDialogOpen] = useState(false);

  const isFinished =
    session.data?.status === 'COMPLETED' ||
    session.data?.status === 'ABANDONED' ||
    session.data?.status === 'FAILED';

  const handleSaveAndExit = () => {
    setDialogOpen(false);
    router.push('/dashboard');
  };

  const handleDiscard = async () => {
    try {
      await abandonSession.mutateAsync();
      toast.success('Consultation discarded');
    } catch {
      // already completed/abandoned — still navigate away
    }
    router.push('/dashboard');
  };

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen bg-background">
        {/* Soft radial backdrop — adds depth without being noisy */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_50%_at_50%_0%,rgba(255,241,242,0.6)_0%,transparent_70%)]"
        />

        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-[15px] font-bold tracking-tight text-foreground transition-opacity hover:opacity-70"
            >
              <span
                aria-hidden
                className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-[11px] font-black text-background"
              >
                T
              </span>
              Taurus
            </Link>

            {isFinished ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Button>
            ) : (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-muted-foreground hover:text-foreground"
                    />
                  }
                >
                  <LogOut className="h-4 w-4" />
                  Exit
                </DialogTrigger>
                <DialogContent
                  showCloseButton={false}
                  className="sm:max-w-md"
                >
                  <DialogHeader>
                    <DialogTitle className="text-[15px]">
                      Leaving the consultation?
                    </DialogTitle>
                    <DialogDescription className="text-[13px] leading-relaxed">
                      Your progress is auto-saved. Pick up where you left off
                      any time from the dashboard or the Consultations hub.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleDiscard}
                      disabled={abandonSession.isPending}
                      className="gap-1.5 self-start text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {abandonSession.isPending
                        ? 'Discarding…'
                        : 'Discard consultation'}
                    </Button>
                    <div className="flex gap-2 sm:shrink-0">
                      <DialogClose
                        render={
                          <Button variant="outline" className="flex-1 sm:flex-none" />
                        }
                      >
                        Keep going
                      </DialogClose>
                      <Button
                        onClick={handleSaveAndExit}
                        className="flex-1 sm:flex-none"
                      >
                        Save &amp; continue later
                      </Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </header>

        <main className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-3xl flex-col justify-center px-6 py-8 sm:py-12">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
