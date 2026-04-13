'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type {
  DeploymentPlan,
  DeploymentArtifact,
  DeploymentPlanStatus,
  CreatePlanResponse,
  PlanActionResponse,
} from '@/types';

// ── Plans (queries) ──────────────────────────────────────

export function useImplementationPlans(filters?: {
  status?: DeploymentPlanStatus;
  actionId?: string;
}) {
  const { accessToken } = useAuthStore();

  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.actionId) params.set('actionId', filters.actionId);
  const qs = params.toString();

  return useQuery({
    queryKey: ['implementation', 'plans', filters],
    queryFn: () =>
      apiClient<DeploymentPlan[]>(`/implementation/plans${qs ? `?${qs}` : ''}`),
    enabled: !!accessToken,
  });
}

export function useImplementationPlan(id: string | null) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['implementation', 'plan', id],
    queryFn: () => apiClient<DeploymentPlan>(`/implementation/plans/${id}`),
    enabled: !!accessToken && !!id,
  });
}

export function usePlanArtifacts(planId: string | null) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['implementation', 'artifacts', planId],
    queryFn: () =>
      apiClient<DeploymentArtifact[]>(
        `/implementation/plans/${planId}/artifacts`,
      ),
    enabled: !!accessToken && !!planId,
  });
}

export function useArtifact(id: string | null) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['implementation', 'artifact', id],
    queryFn: () =>
      apiClient<DeploymentArtifact>(`/implementation/artifacts/${id}`),
    enabled: !!accessToken && !!id,
  });
}

// ── Mutations ────────────────────────────────────────────

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { actionId: string }) =>
      apiClient<CreatePlanResponse>('/implementation/plans', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['implementation'] });
    },
  });
}

export function useRefinePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      apiClient<PlanActionResponse>(`/implementation/plans/${id}/refine`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ['implementation', 'plan', id],
      });
      queryClient.invalidateQueries({ queryKey: ['implementation', 'plans'] });
    },
  });
}

export function useApprovePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient<PlanActionResponse>(`/implementation/plans/${id}/approve`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['implementation'] });
      queryClient.invalidateQueries({ queryKey: ['tracker'] });
    },
  });
}

export function useRejectPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      apiClient<PlanActionResponse>(`/implementation/plans/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['implementation'] });
    },
  });
}

export function useExecutePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient<PlanActionResponse>(`/implementation/plans/${id}/execute`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['implementation'] });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ deleted: boolean }>(`/implementation/plans/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['implementation'] });
    },
  });
}
