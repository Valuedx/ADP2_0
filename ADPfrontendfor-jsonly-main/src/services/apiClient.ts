import config from '@/config';
import { store } from '@/store';
import { setAuthData, clearAuthData } from '@/store/authSlice';

const getAccessToken = () => store.getState().auth.accessToken;
const getRefreshToken = () => store.getState().auth.refreshToken;

const isTokenExpired = (token: string | null) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // refresh a minute before expiry
    return payload.exp * 1000 - 60_000 < Date.now();
  } catch {
    return true;
  }
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${config.API_BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) throw new Error('refresh failed');
    const data = await res.json();
    store.dispatch(
      setAuthData({
        accessToken: data.access,
        refreshToken: data.refresh ?? refresh,
      })
    );
    return data.access as string;
  } catch {
    store.dispatch(clearAuthData());
    return null;
  }
};

// Convert snake_case keys to camelCase recursively
const toCamel = (str: string) =>
  str.replace(/[_-](\w)/g, (_, c) => (c ? c.toUpperCase() : ''));

const camelizeKeys = (data: unknown): unknown => {
  if (Array.isArray(data)) {
    return data.map(camelizeKeys);
  }
  if (data && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([key, value]) => [
        toCamel(key),
        camelizeKeys(value),
      ])
    );
  }
  return data;
};

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {},
  requiresAuth = true
) => {
  let token = requiresAuth ? getAccessToken() : null;
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  if (requiresAuth) {
    if (isTokenExpired(token)) {
      token = await refreshAccessToken();
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      store.dispatch(clearAuthData());
    }
  }

  if (!(options.body instanceof FormData) && !('Content-Type' in headers)) {
    headers['Content-Type'] = 'application/json';
  }

  let response = await fetch(`${config.API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && requiresAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(`${config.API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    }
  }

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

  const data = await response.json();
  return camelizeKeys(data);
};

