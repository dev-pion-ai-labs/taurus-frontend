'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
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

  const handleExit = async () => {
    try {
      await abandonSession.mutateAsync();
    } catch {
      // Session may already be completed/abandoned — still navigate away
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
                  <DialogTitle>Exit consultation?</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to exit? Your progress is saved, but the
                    session will be marked as abandoned.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose
                    render={<Button variant="outline" />}
                  >
                    Cancel
                  </DialogClose>
                  <Button
                    onClick={handleExit}
                    disabled={abandonSession.isPending}
                    className="bg-[#1C1917] text-white hover:bg-[#1C1917]/90"
                  >
                    {abandonSession.isPending ? 'Exiting...' : 'Yes, exit'}
                  </Button>
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
