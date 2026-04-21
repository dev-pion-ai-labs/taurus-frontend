'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useMe } from '@/hooks/use-user';

/**
 * Right-side header actions for public pages (landing, marketing).
 *
 * - Zustand auth store persists the accessToken to localStorage. On first
 *   client render `hydrated` is false until the persist middleware reads
 *   storage — render a shimmer during that window so we don't flash the
 *   wrong state.
 * - If a token is present, hit /users/me to verify it's still valid. A 401
 *   (token expired / revoked) clears the store and falls back to the
 *   login buttons.
 * - If authenticated, show a single Dashboard link.
 */
export function HeaderAuthActions() {
  const { accessToken, hydrated } = useAuthStore();
  const { data: user, isLoading, isError } = useMe();

  useEffect(() => {
    if (hydrated && accessToken && isError) {
      useAuthStore.getState().clearAuth();
    }
  }, [hydrated, accessToken, isError]);

  const isChecking = !hydrated || (!!accessToken && isLoading && !user);
  const isAuthenticated = hydrated && !!accessToken && !!user && !isError;

  if (isChecking) {
    return (
      <div className="flex items-center gap-3" aria-busy="true" aria-live="polite">
        <span className="sr-only">Checking sign-in status</span>
        <div className="hidden sm:block h-9 w-[88px] rounded-lg animate-shimmer" />
        <div className="h-9 w-[132px] rounded-full animate-shimmer" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center h-9 px-5 text-sm font-medium text-white rounded-full transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ backgroundColor: '#1C1917' }}
        >
          <LayoutDashboard className="mr-1.5 w-3.5 h-3.5" />
          Dashboard
          <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="hidden sm:inline-flex items-center justify-center h-9 px-4 text-sm font-medium border rounded-lg transition-all hover:bg-[#F5F5F4]"
        style={{ color: '#1C1917', borderColor: '#E7E5E4' }}
      >
        Login
      </Link>
      <Link
        href="/login"
        className="inline-flex items-center justify-center h-9 px-5 text-sm font-medium text-white rounded-full transition-all hover:-translate-y-0.5 hover:shadow-md"
        style={{ backgroundColor: '#1C1917' }}
      >
        Start for free
        <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
