'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { Department, DepartmentSummary, Workflow } from '@/types';

export function useDepartments() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['departments'],
    queryFn: () => apiClient<Department[]>('/departments'),
    enabled: !!accessToken,
  });
}

export function useDepartmentSummary() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['departments', 'summary'],
    queryFn: () => apiClient<DepartmentSummary>('/departments/summary'),
    enabled: !!accessToken,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; headcount?: number; avgSalary?: number; notes?: string }) =>
      apiClient<Department>('/departments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; headcount?: number; avgSalary?: number; notes?: string }) =>
      apiClient<Department>(`/departments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ success: boolean }>(`/departments/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      departmentId: string;
      name: string;
      description?: string;
      weeklyHours?: number;
      peopleInvolved?: number;
      automationLevel?: string;
      painPoints?: string;
      priority?: string;
    }) =>
      apiClient<Workflow>('/departments/workflows', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: unknown }) =>
      apiClient<Workflow>(`/departments/workflows/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ success: boolean }>(`/departments/workflows/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}
