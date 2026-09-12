import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';
import { useNetworkStatusStore } from '../store/networkStatusStore.js';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true, // send the httpOnly refresh cookie
});

// Requests still pending after this long flip on the "still working..."
// indicator (see components/SlowNetworkIndicator.jsx) without affecting the
// request itself — purely a UI signal, not a timeout/abort.
const SLOW_REQUEST_MS = 5000;

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config._slowTimer = setTimeout(() => {
    config._slowTimerFired = true;
    useNetworkStatusStore.getState().markSlow();
  }, SLOW_REQUEST_MS);

  return config;
});

function clearSlowTimer(config) {
  if (!config) return;
  clearTimeout(config._slowTimer);
  if (config._slowTimerFired) {
    useNetworkStatusStore.getState().clearSlow();
    config._slowTimerFired = false;
  }
}

// The refresh endpoint rotates the token on every call (old one is revoked),
// so two concurrent refresh calls — e.g. React StrictMode double-invoking an
// effect — would otherwise race: the second uses an already-revoked token,
// fails, and wipes out the session the first call just established. This
// singleton collapses concurrent callers onto a single in-flight request.
let refreshPromise = null;

export function refreshSession() {
  refreshPromise ??= apiClient.post('/auth/refresh').finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => {
    clearSlowTimer(response.config);
    return response;
  },
  async (error) => {
    const original = error.config;
    clearSlowTimer(original);
    const status = error.response?.status;
    const isAuthEndpoint = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/refresh');

    if (status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        const { data } = await refreshSession();
        useAuthStore.getState().setSession(data.data.accessToken, data.data.user);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(original);
      } catch (refreshError) {
        useAuthStore.getState().clearSession();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export function extractErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.error?.message || fallback;
}
