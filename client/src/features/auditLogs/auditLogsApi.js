import { apiClient } from '../../services/apiClient.js';

export async function listAuditLogs(params) {
  const { data } = await apiClient.get('/audit-logs', { params });
  return { rows: data.data, meta: data.meta };
}
