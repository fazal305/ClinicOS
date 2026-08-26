import { apiClient, refreshSession } from '../../services/apiClient.js';

export async function loginRequest(email, password) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data.data;
}

export async function refreshRequest() {
  const { data } = await refreshSession();
  return data.data;
}

export async function logoutRequest() {
  await apiClient.post('/auth/logout');
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get('/auth/me');
  return data.data.user;
}
