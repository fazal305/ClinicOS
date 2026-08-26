import { apiClient } from '../../services/apiClient.js';

export async function listPayments(params) {
  const { data } = await apiClient.get('/payments', { params });
  return { rows: data.data, meta: data.meta };
}

export async function createPayment(payload) {
  const { data } = await apiClient.post('/payments', payload);
  return data.data;
}

export async function updatePaymentStatus(id, status) {
  const { data } = await apiClient.patch(`/payments/${id}/status`, { status });
  return data.data;
}
