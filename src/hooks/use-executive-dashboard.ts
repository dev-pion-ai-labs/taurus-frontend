'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { ExecutiveDashboard } from '@/types';

export function useExecutiveDashboard() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['dashboard', 'executive'],
    queryFn: () => apiClient<ExecutiveDashboard>('/dashboard/executive'),
    enabled: !!accessToken,
    staleTime: 60_000,
  });
}
