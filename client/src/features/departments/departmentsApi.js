import { apiClient } from '../../services/apiClient.js';

export async function listDepartments(includeInactive = false) {
  const { data } = await apiClient.get('/departments', { params: includeInactive ? { all: 'true' } : undefined });
  return data.data;
}

export async function createDepartment(payload) {
  const { data } = await apiClient.post('/departments', payload);
  return data.data;
}

export async function updateDepartment(id, payload) {
  const { data } = await apiClient.patch(`/departments/${id}`, payload);
  return data.data;
}
