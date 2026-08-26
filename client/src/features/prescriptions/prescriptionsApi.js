import { apiClient } from '../../services/apiClient.js';

export async function createPrescription(payload) {
  const { data } = await apiClient.post('/prescriptions', payload);
  return data.data;
}

export async function listPrescriptionsByPatient(patientId) {
  const { data } = await apiClient.get('/prescriptions', { params: { patientId } });
  return data.data;
}

export async function getPrescriptionById(id) {
  const { data } = await apiClient.get(`/prescriptions/${id}`);
  return data.data;
}
