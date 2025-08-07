import config from '@/config';
import { store } from '@/store';

const getAccessToken = () => store.getState().auth.accessToken;

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {},
  requiresAuth = true
) => {
  const token = requiresAuth ? getAccessToken() : null;
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  if (requiresAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !('Content-Type' in headers)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${config.API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: unknown = null;
    try {
      errorData = await response.json();
    } catch {
      // ignore parse errors
    }

    interface ApiError extends Error {
      status?: number;
      data?: unknown;
    }
    const apiError: ApiError = new Error(
      (errorData as { detail?: string })?.detail || response.statusText
    );
    apiError.status = response.status;
    apiError.data = errorData;
    throw apiError;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

