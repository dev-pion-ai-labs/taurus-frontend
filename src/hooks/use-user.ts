'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/types';

export function useMe() {
  const { accessToken, setUser } = useAuthStore();

  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const user = await apiClient<User>('/users/me');
      setUser(user);
      return user;
    },
    enabled: !!accessToken,
    retry: false,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: { firstName?: string; lastName?: string }) =>
      apiClient<User>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}
