import { apiClient } from '../../services/apiClient.js';

export async function getOverview() {
  const { data } = await apiClient.get('/reports/overview');
  return data.data;
}
