'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type {
  DeploymentSession,
  IntegrationProvider,
} from '@/types';

// ── Queries ──────────────────────────────────────────────

export function useDeploymentSessions(
  orgId: string | undefined,
  planId?: string,
) {
  const { accessToken } = useAuthStore();
  const qs = planId ? `?planId=${planId}` : '';

  return useQuery({
    queryKey: ['deployment', 'sessions', orgId, planId],
    queryFn: () =>
      apiClient<DeploymentSession[]>(
        `/organizations/${orgId}/deploy${qs}`,
      ),
    enabled: !!accessToken && !!orgId,
  });
}

export function useDeploymentSession(
  orgId: string | undefined,
  sessionId: string | null,
) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['deployment', 'session', sessionId],
    queryFn: () =>
      apiClient<DeploymentSession>(
        `/organizations/${orgId}/deploy/${sessionId}`,
      ),
    enabled: !!accessToken && !!orgId && !!sessionId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Poll while executing
      if (status === 'EXECUTING') return 3000;
      return false;
    },
  });
}

// ── Mutations ────────────────────────────────────────────

export function useCreateDeploymentSession(orgId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      planId: string;
      steps: {
        provider: IntegrationProvider;
        action: string;
        params: Record<string, unknown>;
        dependsOn?: string[];
      }[];
    }) =>
      apiClient<DeploymentSession>(
        `/organizations/${orgId}/deploy`,
        { method: 'POST', body: JSON.stringify(data) },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployment'] });
    },
  });
}

export function useDryRunSession(orgId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      apiClient<DeploymentSession>(
        `/organizations/${orgId}/deploy/${sessionId}/dry-run`,
        { method: 'POST' },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployment'] });
    },
  });
}

export function useApproveSession(orgId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      apiClient<DeploymentSession>(
        `/organizations/${orgId}/deploy/${sessionId}/approve`,
        { method: 'POST' },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployment'] });
    },
  });
}

export function useExecuteSession(orgId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      apiClient<DeploymentSession>(
        `/organizations/${orgId}/deploy/${sessionId}/execute`,
        { method: 'POST' },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployment'] });
    },
  });
}

export function useRollbackSession(orgId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      apiClient<DeploymentSession>(
        `/organizations/${orgId}/deploy/${sessionId}/rollback`,
        { method: 'POST' },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployment'] });
    },
  });
}
