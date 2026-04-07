'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { TransformationReport } from '@/types';

export function useReport(sessionId: string | undefined) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['session', sessionId, 'report'],
    queryFn: () =>
      apiClient<TransformationReport>(
        `/consultation/sessions/${sessionId}/report`
      ),
    enabled: !!accessToken && !!sessionId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'GENERATING') return 5000;
      return false;
    },
    retry: (failureCount, error) => {
      // Don't retry 404s (no report yet)
      if (error && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useRegenerateReport(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient<TransformationReport>(
        `/consultation/sessions/${sessionId}/report/regenerate`,
        { method: 'POST' }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['session', sessionId, 'report'],
      });
    },
  });
}
