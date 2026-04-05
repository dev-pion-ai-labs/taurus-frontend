'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Industry } from '@/types';

export function useIndustries(search = '', page = 1) {
  return useQuery({
    queryKey: ['industries', { search, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);

      return apiClient<Industry[]>(`/industries?${params}`);
    },
    placeholderData: (prev) => prev,
  });
}

export function useIndustry(id: string | null | undefined) {
  return useQuery({
    queryKey: ['industry', id],
    queryFn: () => apiClient<Industry>(`/industries/${id}`),
    enabled: !!id,
  });
}
