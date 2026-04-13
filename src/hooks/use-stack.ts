'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type {
  ToolEntry,
  StackSummary,
  StackRecommendation,
  StackSyncResult,
  SpendTrends,
  SpendRecord,
  ToolROI,
  ToolOverlapResult,
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

// ── Spend Tracking ───────────────────────────────────────

export function useAddSpend() {
  const orgId = useOrgId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      toolEntryId: string;
      month: string;
      amount: number;
      notes?: string;
    }) =>
      apiClient<SpendRecord>(`/organizations/${orgId}/stack/spend`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stack'] });
    },
  });
}

export function useSpendTrends(months: number = 12) {
  const orgId = useOrgId();
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['stack', 'spend', orgId, months],
    queryFn: () =>
      apiClient<SpendTrends>(
        `/organizations/${orgId}/stack/spend?months=${months}`,
      ),
    enabled: !!accessToken && !!orgId,
    staleTime: 60_000,
  });
}

// ── ROI ──────────────────────────────────────────────────

export function useToolROI() {
  const orgId = useOrgId();
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['stack', 'roi', orgId],
    queryFn: () =>
      apiClient<ToolROI>(`/organizations/${orgId}/stack/roi`),
    enabled: !!accessToken && !!orgId,
    staleTime: 60_000,
  });
}

// ── Overlap Detection ────────────────────────────────────

export function useToolOverlaps() {
  const orgId = useOrgId();
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['stack', 'overlaps', orgId],
    queryFn: () =>
      apiClient<ToolOverlapResult>(`/organizations/${orgId}/stack/overlaps`),
    enabled: !!accessToken && !!orgId,
    staleTime: 120_000,
  });
}

// ── Renewals ─────────────────────────────────────────────

export function useUpcomingRenewals() {
  const orgId = useOrgId();
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['stack', 'renewals', orgId],
    queryFn: () =>
      apiClient<ToolEntry[]>(`/organizations/${orgId}/stack/renewals`),
    enabled: !!accessToken && !!orgId,
    staleTime: 60_000,
  });
}
