'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { IntegrationConnection, IntegrationProvider } from '@/types';

export function useIntegrations() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['integrations'],
    queryFn: () => apiClient<IntegrationConnection[]>('/integrations'),
    enabled: !!accessToken,
  });
}

export function useConnectIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      provider,
      code,
      redirectUri,
    }: {
      provider: string;
      code: string;
      redirectUri?: string;
    }) =>
      apiClient<IntegrationConnection>(
        `/integrations/${provider.toLowerCase().replace(/_/g, '-')}/callback`,
        {
          method: 'POST',
          body: JSON.stringify({ code, redirectUri }),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}

export function useGetAuthorizeUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      provider,
      redirectUri,
    }: {
      provider: string;
      redirectUri: string;
    }) =>
      apiClient<{ url: string }>(
        `/integrations/${provider.toLowerCase().replace(/_/g, '-')}/authorize?redirectUri=${encodeURIComponent(redirectUri)}`,
      ),
  });
}

export function useDisconnectIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ id: string; disconnected: boolean }>(
        `/integrations/${id}`,
        { method: 'DELETE' },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}
