import { apiClient } from '../../services/apiClient.js';

export async function createMedicalRecord(payload) {
  const { data } = await apiClient.post('/medical-records', payload);
  return data.data;
}

export async function listMedicalRecordsByPatient(patientId) {
  const { data } = await apiClient.get('/medical-records', { params: { patientId } });
  return data.data;
}

export async function getMedicalRecordById(id) {
  const { data } = await apiClient.get(`/medical-records/${id}`);
  return data.data;
}
