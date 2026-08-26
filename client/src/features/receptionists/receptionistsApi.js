import { apiClient } from '../../services/apiClient.js';

export async function listReceptionists() {
  const { data } = await apiClient.get('/receptionists');
  return data.data;
}

export async function createReceptionist(payload) {
  const { data } = await apiClient.post('/receptionists', payload);
  return data.data;
}

export async function updateReceptionist(id, payload) {
  const { data } = await apiClient.patch(`/receptionists/${id}`, payload);
  return data.data;
}
