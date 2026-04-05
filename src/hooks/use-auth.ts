'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

export function useSendOtp() {
  return useMutation({
    mutationFn: (email: string) =>
      apiClient<{ message: string }>('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  });
}

export function useVerifyOtp() {
  const setTokens = useAuthStore((s) => s.setTokens);

  return useMutation({
    mutationFn: (data: { email: string; code: string }) =>
      apiClient<{ accessToken: string; refreshToken: string }>(
        '/auth/verify-otp',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
    },
  });
}

export function useLogout() {
  const { refreshToken, clearAuth } = useAuthStore.getState();

  return useMutation({
    mutationFn: () =>
      apiClient<{ message: string }>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),
    onSettled: () => {
      clearAuth();
      window.location.href = '/login';
    },
  });
}
