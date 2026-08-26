import { apiClient } from '../../services/apiClient.js';

export async function listDoctors(params) {
  const { data } = await apiClient.get('/doctors', { params });
  return data.data;
}

export async function listAllDoctors() {
  const { data } = await apiClient.get('/doctors', { params: { all: 'true' } });
  return data.data;
}

export async function createDoctor(payload) {
  const { data } = await apiClient.post('/doctors', payload);
  return data.data;
}

export async function updateDoctor(id, payload) {
  const { data } = await apiClient.patch(`/doctors/${id}`, payload);
  return data.data;
}
