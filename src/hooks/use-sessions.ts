'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type {
  ConsultationSession,
  CurrentQuestionResponse,
  StartSessionInput,
  SubmitAnswerResponse,
} from '@/types';

interface UseSessionsParams {
  page?: number;
  scope?: StartSessionInput['scope'];
  departmentId?: string;
  workflowId?: string;
}

export function useSessions(params: number | UseSessionsParams = 1) {
  const { page = 1, scope, departmentId, workflowId }: UseSessionsParams =
    typeof params === 'number' ? { page: params } : params;

  const search = new URLSearchParams({
    page: String(page),
    limit: '20',
  });
  if (scope) search.set('scope', scope);
  if (departmentId) search.set('departmentId', departmentId);
  if (workflowId) search.set('workflowId', workflowId);

  return useQuery({
    queryKey: ['sessions', { page, scope, departmentId, workflowId }],
    queryFn: () =>
      apiClient<ConsultationSession[]>(`/consultation/sessions?${search.toString()}`),
    placeholderData: (prev) => prev,
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () =>
      apiClient<ConsultationSession>(`/consultation/sessions/${id}`),
    enabled: !!id,
  });
}

export function useCurrentQuestion(id: string, enabled = true) {
  return useQuery({
    queryKey: ['session', id, 'current-question'],
    queryFn: () =>
      apiClient<CurrentQuestionResponse>(
        `/consultation/sessions/${id}/current-question`
      ),
    enabled: !!id && enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'PENDING_TEMPLATE') return 5000;
      // Periodically refresh to pick up adaptive questions added by background jobs
      if (data?.status === 'IN_PROGRESS') return 10000;
      return false;
    },
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input?: StartSessionInput) =>
      apiClient<ConsultationSession>('/consultation/sessions', {
        method: 'POST',
        body: JSON.stringify(input ?? {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useSubmitAnswer(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      questionId: string;
      value: string | string[] | number;
    }) =>
      apiClient<SubmitAnswerResponse>(
        `/consultation/sessions/${sessionId}/answers`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),
    onSuccess: (data) => {
      // If backend returns the next question, update cache instantly
      if (data.nextQuestion) {
        queryClient.setQueryData(
          ['session', sessionId, 'current-question'],
          (old: CurrentQuestionResponse | undefined) => {
            if (!old) return old;
            return {
              ...old,
              status: data.status,
              question: data.nextQuestion,
              progress: data.progress ?? {
                ...old.progress,
                answered: old.progress.answered + 1,
              },
            };
          }
        );
      } else if (data.status === 'COMPLETED') {
        // Session completed — update status immediately, no refetch needed
        queryClient.setQueryData(
          ['session', sessionId, 'current-question'],
          (old: CurrentQuestionResponse | undefined) => {
            if (!old) return old;
            return {
              ...old,
              status: 'COMPLETED',
              question: null,
              progress: {
                ...old.progress,
                answered: old.progress.total,
              },
            };
          }
        );
      } else {
        // Fallback — refetch if backend didn't return nextQuestion
        queryClient.invalidateQueries({
          queryKey: ['session', sessionId, 'current-question'],
        });
      }
      // Background-refresh session data (non-blocking)
      queryClient.invalidateQueries({
        queryKey: ['session', sessionId],
      });
    },
  });
}

export function useAbandonSession(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient<ConsultationSession>(
        `/consultation/sessions/${sessionId}/abandon`,
        { method: 'PATCH' }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
    },
  });
}
