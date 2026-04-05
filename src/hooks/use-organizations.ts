'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Organization, User } from '@/types';

export function useCreateOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; industryId: string; size?: string }) =>
      apiClient<Organization>('/organizations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

export function useOrganization(id: string | null | undefined) {
  return useQuery({
    queryKey: ['organization', id],
    queryFn: () => apiClient<Organization>(`/organizations/${id}`),
    enabled: !!id,
  });
}

export function useUpdateOrg(id: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; size?: string }) =>
      apiClient<Organization>(`/organizations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', id] });
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

interface MembersResponse {
  data: User[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function useOrgMembers(id: string | null | undefined, page = 1) {
  return useQuery({
    queryKey: ['organization', id, 'members', { page }],
    queryFn: async () => {
      const res = await apiClient<User[]>(
        `/organizations/${id}/members?page=${page}&limit=20`
      );
      return res;
    },
    enabled: !!id,
  });
}
