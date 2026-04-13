'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type {
  MaturityTrendPoint,
  RoadmapProgress,
  ValueRealization,
  SprintVelocity,
  StackOverview,
} from '@/types';

export function useMaturityTrend() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['dashboard', 'maturity-trend'],
    queryFn: () => apiClient<MaturityTrendPoint[]>('/dashboard/maturity-trend'),
    enabled: !!accessToken,
    staleTime: 60_000,
  });
}

export function useRoadmapProgress() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['dashboard', 'roadmap-progress'],
    queryFn: () => apiClient<RoadmapProgress>('/dashboard/roadmap-progress'),
    enabled: !!accessToken,
    staleTime: 60_000,
  });
}

export function useValueRealization() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['dashboard', 'value-realization'],
    queryFn: () => apiClient<ValueRealization>('/dashboard/value-realization'),
    enabled: !!accessToken,
    staleTime: 60_000,
  });
}

export function useSprintVelocity() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['dashboard', 'sprint-velocity'],
    queryFn: () => apiClient<SprintVelocity>('/dashboard/sprint-velocity'),
    enabled: !!accessToken,
    staleTime: 60_000,
  });
}

export function useStackOverview() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['dashboard', 'stack-overview'],
    queryFn: () => apiClient<StackOverview>('/dashboard/stack-overview'),
    enabled: !!accessToken,
    staleTime: 60_000,
  });
}
