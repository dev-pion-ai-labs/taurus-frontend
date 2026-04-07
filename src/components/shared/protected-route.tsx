'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useMe } from '@/hooks/use-user';

export function ProtectedRoute({
  children,
  requireOrg = false,
}: {
  children: React.ReactNode;
  requireOrg?: boolean;
}) {
  const router = useRouter();
  const { accessToken, hydrated } = useAuthStore();
  const { data: user, isLoading, isError } = useMe();

  useEffect(() => {
    if (!hydrated) return;

    if (!accessToken) {
      router.replace('/login');
      return;
    }

    if (isError) {
      useAuthStore.getState().clearAuth();
      router.replace('/login');
      return;
    }

    if (user && (!user.firstName || !user.lastName) && requireOrg) {
      router.replace('/onboarding');
      return;
    }

    if (user && !user.onboardingCompleted && requireOrg) {
      router.replace('/questionnaire');
      return;
    }
  }, [accessToken, hydrated, user, isLoading, isError, requireOrg, router]);

  if (!hydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F4]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[#1C1917] border-t-transparent animate-spin" />
          <p className="text-sm text-[#78716C]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!accessToken) return null;

  return <>{children}</>;
}
