'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type {
  ToolEntry,
  StackSummary,
  StackRecommendation,
  StackSyncResult,
} from '@/types';

function useOrgId() {
  return useAuthStore((s) => s.user?.organizationId ?? null);
}

export function useStackInventory(filters?: {
  category?: string;
  status?: string;
  source?: string;
}) {
  const orgId = useOrgId();
  const { accessToken } = useAuthStore();

  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.source) params.set('source', filters.source);
  const qs = params.toString();

  return useQuery({
    queryKey: ['stack', 'inventory', orgId, filters],
    queryFn: () =>
      apiClient<ToolEntry[]>(
        `/organizations/${orgId}/stack${qs ? `?${qs}` : ''}`,
      ),
    enabled: !!accessToken && !!orgId,
  });
}

export function useStackSummary() {
  const orgId = useOrgId();
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['stack', 'summary', orgId],
    queryFn: () =>
      apiClient<StackSummary>(`/organizations/${orgId}/stack/summary`),
    enabled: !!accessToken && !!orgId,
    staleTime: 60_000,
  });
}

export function useStackRecommendations() {
  const orgId = useOrgId();
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['stack', 'recommendations', orgId],
    queryFn: () =>
      apiClient<StackRecommendation[]>(
        `/organizations/${orgId}/stack/recommendations`,
      ),
    enabled: !!accessToken && !!orgId,
    staleTime: 60_000,
  });
}

export function useAddTool() {
  const orgId = useOrgId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      category?: string;
      status?: string;
      monthlyCost?: number;
      userCount?: number;
      rating?: number;
      notes?: string;
    }) =>
      apiClient<ToolEntry>(`/organizations/${orgId}/stack`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stack'] });
    },
  });
}

export function useUpdateTool() {
  const orgId = useOrgId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      toolId,
      ...data
    }: {
      toolId: string;
      [key: string]: unknown;
    }) =>
      apiClient<ToolEntry>(`/organizations/${orgId}/stack/${toolId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stack'] });
    },
  });
}

export function useRemoveTool() {
  const orgId = useOrgId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (toolId: string) =>
      apiClient<{ message: string }>(`/organizations/${orgId}/stack/${toolId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stack'] });
    },
  });
}

export function useSyncStack() {
  const orgId = useOrgId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient<StackSyncResult>(`/organizations/${orgId}/stack/sync`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stack'] });
    },
  });
}
