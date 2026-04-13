'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type {
  TrackerBoard,
  TrackerStats,
  TransformationAction,
  ActionStatus,
  Sprint,
  ActionComment,
} from '@/types';

// ── Board ─────────────────────────────────────────────────

export function useTrackerBoard(filters?: {
  department?: string;
  assigneeId?: string;
  priority?: string;
  sprintId?: string;
}) {
  const { accessToken } = useAuthStore();

  const params = new URLSearchParams();
  if (filters?.department) params.set('department', filters.department);
  if (filters?.assigneeId) params.set('assigneeId', filters.assigneeId);
  if (filters?.priority) params.set('priority', filters.priority);
  if (filters?.sprintId) params.set('sprintId', filters.sprintId);

  const qs = params.toString();

  return useQuery({
    queryKey: ['tracker', 'board', filters],
    queryFn: () => apiClient<TrackerBoard>(`/tracker/board${qs ? `?${qs}` : ''}`),
    enabled: !!accessToken,
  });
}

// ── Stats ─────────────────────────────────────────────────

export function useTrackerStats() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['tracker', 'stats'],
    queryFn: () => apiClient<TrackerStats>('/tracker/stats'),
    enabled: !!accessToken,
  });
}

// ── Action Detail ─────────────────────────────────────────

export function useTrackerAction(id: string | null) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['tracker', 'action', id],
    queryFn: () => apiClient<TransformationAction>(`/tracker/actions/${id}`),
    enabled: !!accessToken && !!id,
  });
}

// ── Mutations ─────────────────────────────────────────────

export function useCreateAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      department?: string;
      category?: string;
      priority?: string;
      estimatedValue?: number;
      estimatedEffort?: string;
      phase?: number;
      assigneeId?: string;
      sprintId?: string;
      dueDate?: string;
    }) =>
      apiClient<TransformationAction>('/tracker/actions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracker'] });
    },
  });
}

export function useUpdateAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: unknown }) =>
      apiClient<TransformationAction>(`/tracker/actions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onMutate: async ({ id, ...data }) => {
      await queryClient.cancelQueries({ queryKey: ['tracker', 'action', id] });

      const previousAction = queryClient.getQueryData<TransformationAction>([
        'tracker', 'action', id,
      ]);

      // Optimistically patch the action detail cache
      queryClient.setQueryData<TransformationAction>(
        ['tracker', 'action', id],
        (old) => (old ? { ...old, ...data } as TransformationAction : old),
      );

      return { previousAction };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousAction) {
        queryClient.setQueryData(['tracker', 'action', id], context.previousAction);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tracker'] });
    },
  });
}

export function useMoveAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      orderIndex,
    }: {
      id: string;
      status: string;
      orderIndex: number;
    }) =>
      apiClient<TransformationAction>(`/tracker/actions/${id}/move`, {
        method: 'PATCH',
        body: JSON.stringify({ status, orderIndex }),
      }),
    onMutate: async () => {
      // Cancel in-flight board fetches so they don't overwrite the local optimistic state
      await queryClient.cancelQueries({ queryKey: ['tracker', 'board'] });
    },
    onSettled: () => {
      // Refetch to reconcile with server truth
      queryClient.invalidateQueries({ queryKey: ['tracker'] });
    },
  });
}

export function useDeleteAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ success: boolean }>(`/tracker/actions/${id}`, {
        method: 'DELETE',
      }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tracker', 'board'] });

      const previousBoards = queryClient.getQueriesData<TrackerBoard>({
        queryKey: ['tracker', 'board'],
      });

      // Optimistically remove from board
      queryClient.setQueriesData<TrackerBoard>(
        { queryKey: ['tracker', 'board'] },
        (old) => {
          if (!old) return old;
          const newColumns = { ...old.columns };
          for (const col of Object.keys(newColumns) as ActionStatus[]) {
            newColumns[col] = newColumns[col].filter((a) => a.id !== id);
          }
          return { ...old, columns: newColumns };
        },
      );

      return { previousBoards };
    },
    onError: (_err, _id, context) => {
      if (context?.previousBoards) {
        for (const [queryKey, data] of context.previousBoards) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tracker'] });
    },
  });
}

export function useImportFromReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      apiClient<{ imported: number; skipped: number }>(
        `/tracker/import/${sessionId}`,
        { method: 'POST' }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracker'] });
    },
  });
}

// ── Sprints ───────────────────────────────────────────────

export function useSprints() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['tracker', 'sprints'],
    queryFn: () => apiClient<Sprint[]>('/tracker/sprints'),
    enabled: !!accessToken,
  });
}

export function useCreateSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      startDate: string;
      endDate: string;
      goal?: string;
    }) =>
      apiClient<Sprint>('/tracker/sprints', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracker', 'sprints'] });
    },
  });
}

export function useUpdateSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: unknown }) =>
      apiClient<Sprint>(`/tracker/sprints/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracker', 'sprints'] });
    },
  });
}

// ── Comments ──────────────────────────────────────────────

export function useActionComments(actionId: string | null) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['tracker', 'comments', actionId],
    queryFn: () =>
      apiClient<ActionComment[]>(`/tracker/actions/${actionId}/comments`),
    enabled: !!accessToken && !!actionId,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ actionId, content }: { actionId: string; content: string }) =>
      apiClient<ActionComment>(`/tracker/actions/${actionId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tracker', 'comments', variables.actionId],
      });
      queryClient.invalidateQueries({ queryKey: ['tracker', 'action', variables.actionId] });
      queryClient.invalidateQueries({ queryKey: ['tracker', 'board'] });
    },
  });
}
