'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  LogOut,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/shared/protected-route';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
                  showCloseButton
                  className="gap-0 p-5 sm:max-w-md"
                >
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                    <LogOut className="h-4 w-4 text-accent-foreground" />
                  </div>

                  <DialogHeader className="gap-1.5">
                    <DialogTitle className="text-[15px]">
                      Leave this consultation?
                    </DialogTitle>
                    <DialogDescription className="text-[13px] leading-relaxed">
                      Your progress is saved automatically. You can come
                      back anytime and continue where you left off.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 px-3 py-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-chart-1" />
                    <div className="text-[12.5px] leading-tight">
                      <div className="font-semibold text-foreground">
                        Auto-saved
                      </div>
                      <div className="mt-0.5 text-muted-foreground">
                        All your inputs and answers are securely saved.
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button onClick={handleSaveAndExit} className="gap-1.5">
                      Leave &amp; Save
                      <LogOut className="h-3.5 w-3.5" />
                    </Button>
                    <DialogClose render={<Button variant="outline" />}>
                      Stay in consultation
                    </DialogClose>
                  </div>

                  <div className="my-3 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[11px] text-muted-foreground">
                      or
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <button
                    type="button"
                    onClick={handleDiscard}
                    disabled={abandonSession.isPending}
                    className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-destructive/5 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4 shrink-0 text-destructive" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-destructive">
                        {abandonSession.isPending
                          ? 'Discarding…'
                          : 'Discard consultation'}
                      </div>
                      <div className="text-[11.5px] text-muted-foreground">
                        This will permanently delete your progress.
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-destructive" />
                  </button>
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
