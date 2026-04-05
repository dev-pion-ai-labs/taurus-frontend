import { useAuthStore } from '@/stores/auth-store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearAuth();
      return false;
    }

    const json = await res.json();
    setTokens(json.data.accessToken, json.data.refreshToken);
    return true;
  } catch {
    clearAuth();
    return false;
  }
}

export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(statusCode: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { accessToken } = useAuthStore.getState();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 — attempt token refresh
  if (res.status === 401 && accessToken) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshTokens().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;
    if (refreshed) {
      const newToken = useAuthStore.getState().accessToken;
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } else {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new ApiError(401, 'Session expired');
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({
      message: 'An unexpected error occurred',
    }));
    throw new ApiError(
      res.status,
      errorBody.message || 'An unexpected error occurred',
      errorBody.errors
    );
  }

  const json = await res.json();
  return json.data as T;
}
