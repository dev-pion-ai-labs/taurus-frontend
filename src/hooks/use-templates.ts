'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { ConsultationTemplate } from '@/types';

export function useTemplates(page = 1) {
  return useQuery({
    queryKey: ['templates', { page }],
    queryFn: () =>
      apiClient<ConsultationTemplate[]>(
        `/consultation/templates?page=${page}&limit=20`
      ),
    placeholderData: (prev) => prev,
  });
}

export function useTemplate(id: string | null | undefined) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => apiClient<ConsultationTemplate>(`/consultation/templates/${id}`),
    enabled: !!id,
  });
}

export function useRegenerateTemplate(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient<ConsultationTemplate>(
        `/consultation/templates/${id}/regenerate`,
        { method: 'POST' }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', id] });
    },
  });
}
