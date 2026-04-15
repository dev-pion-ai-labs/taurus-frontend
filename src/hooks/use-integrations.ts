'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type {
  OrgIntegration,
  ConnectionTestResult,
  DeploymentAuditLog,
  IntegrationProvider,
} from '@/types';

// ── Queries ──────────────────────────────────────────────

export function useIntegrations(orgId: string | undefined) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['integrations', orgId],
    queryFn: () =>
      apiClient<OrgIntegration[]>(
        `/organizations/${orgId}/integrations`,
      ),
    enabled: !!accessToken && !!orgId,
  });
}

export function useIntegrationAuditLogs(orgId: string | undefined) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['integrations', 'audit-logs', orgId],
    queryFn: () =>
      apiClient<DeploymentAuditLog[]>(
        `/organizations/${orgId}/integrations/audit-logs`,
      ),
    enabled: !!accessToken && !!orgId,
  });
}

// ── Mutations ────────────────────────────────────────────

export function useTestConnection(orgId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (integrationId: string) =>
      apiClient<ConnectionTestResult>(
        `/organizations/${orgId}/integrations/${integrationId}/test`,
        { method: 'POST' },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', orgId] });
    },
  });
}

export function useDisconnectIntegration(orgId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (integrationId: string) =>
      apiClient<{ revoked: boolean }>(
        `/organizations/${orgId}/integrations/${integrationId}`,
        { method: 'DELETE' },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', orgId] });
    },
  });
}

export function useConnectApiKey(orgId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      provider: IntegrationProvider;
      apiKey: string;
      label?: string;
      scopes?: string[];
    }) =>
      apiClient<OrgIntegration>(
        `/organizations/${orgId}/integrations/connect-api-key`,
        { method: 'POST', body: JSON.stringify(data) },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', orgId] });
    },
  });
}

// ── Helpers ──────────────────────────────────────────────

/**
 * Build the OAuth redirect URL.
 * The backend handles the redirect to the provider's consent screen.
 */
export function getOAuthConnectUrl(orgId: string, provider: IntegrationProvider): string {
  return `/api/v1/organizations/${orgId}/integrations/connect/${provider.toLowerCase()}`;
}
