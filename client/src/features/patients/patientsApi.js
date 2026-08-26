import { apiClient } from '../../services/apiClient.js';

export async function listPatients(params) {
  const { data } = await apiClient.get('/patients', { params });
  return { rows: data.data, meta: data.meta };
}

export async function registerPatient(payload) {
  const { data } = await apiClient.post('/patients', payload);
  return data.data;
}

export async function getPatientById(id) {
  const { data } = await apiClient.get(`/patients/${id}`);
  return data.data;
}

export async function getOwnPatient() {
  const { data } = await apiClient.get('/patients/me');
  return data.data;
}

export async function updatePatient(id, payload) {
  const { data } = await apiClient.patch(`/patients/${id}`, payload);
  return data.data;
}
