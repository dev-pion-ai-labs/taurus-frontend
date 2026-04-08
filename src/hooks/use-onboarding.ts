'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, uploadFile } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type {
  OnboardingStatus,
  OnboardingData,
  OnboardingSubmitResponse,
  OnboardingProfile,
  OnboardingInsights,
  ScrapingStatusResponse,
  UploadedDocument,
} from '@/types';

export function useOnboardingStatus() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['onboarding', 'status'],
    queryFn: () => apiClient<OnboardingStatus>('/onboarding/status'),
    enabled: !!accessToken,
    retry: false,
  });
}

export function useSaveOnboardingProgress() {
  return useMutation({
    mutationFn: (data: { step: number; data: Partial<OnboardingData> }) =>
      apiClient<{ success: boolean }>('/onboarding/progress', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  });
}

export function useSubmitOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OnboardingData) =>
      apiClient<OnboardingSubmitResponse>('/onboarding/submit', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'status'] });
    },
  });
}

export function useUploadDocument() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return uploadFile<UploadedDocument>('/onboarding/documents', formData);
    },
  });
}

export function useDeleteDocument() {
  return useMutation({
    mutationFn: (documentId: string) =>
      apiClient<{ success: boolean }>(`/onboarding/documents/${documentId}`, {
        method: 'DELETE',
      }),
  });
}

export function useOnboardingProfile() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['onboarding', 'profile'],
    queryFn: () => apiClient<OnboardingProfile>('/onboarding/profile'),
    enabled: !!accessToken,
    retry: false,
  });
}

export function useStartScraping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyUrl: string) =>
      apiClient<{ status: string; message: string }>('/onboarding/scrape', {
        method: 'POST',
        body: JSON.stringify({ companyUrl }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['onboarding', 'scraping-status'],
      });
    },
  });
}

export function useScrapingStatus(enabled = false) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['onboarding', 'scraping-status'],
    queryFn: () =>
      apiClient<ScrapingStatusResponse>('/onboarding/scraping-status'),
    enabled: !!accessToken && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'QUEUED' || status === 'IN_PROGRESS') return 3500;
      return false;
    },
  });
}

export function useOnboardingInsights() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['onboarding', 'insights'],
    queryFn: () => apiClient<OnboardingInsights>('/onboarding/insights'),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes — AI call is expensive
    retry: false,
  });
}
