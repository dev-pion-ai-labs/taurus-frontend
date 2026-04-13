'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { DiscoveryReport, DiscoveryScanResponse } from '@/types';

export function useDiscoveryScan() {
  return useMutation({
    mutationFn: (data: { url: string; email?: string; industry?: string }) =>
      apiClient<DiscoveryScanResponse>('/discovery/scan', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}

export function useDiscoveryReport(id: string | null) {
  return useQuery({
    queryKey: ['discovery', id],
    queryFn: () => apiClient<DiscoveryReport>(`/discovery/${id}`),
    enabled: !!id,
    refetchInterval: (query) =>
      query.state.data?.status === 'GENERATING' ? 2000 : false,
  });
}
