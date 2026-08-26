import { apiClient } from '../../services/apiClient.js';

export async function listAppointments(params) {
  const { data } = await apiClient.get('/appointments', { params });
  return { rows: data.data, meta: data.meta };
}

export async function createAppointment(payload) {
  const { data } = await apiClient.post('/appointments', payload);
  return data.data;
}

export async function getAppointmentById(id) {
  const { data } = await apiClient.get(`/appointments/${id}`);
  return data.data;
}

export async function rescheduleAppointment(id, payload) {
  const { data } = await apiClient.patch(`/appointments/${id}`, payload);
  return data.data;
}

export async function updateAppointmentStatus(id, status) {
  const { data } = await apiClient.patch(`/appointments/${id}/status`, { status });
  return data.data;
}
