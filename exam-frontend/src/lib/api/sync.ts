import { apiClient } from './client';

export async function checkServerStatus() {
  try {
    const response = await apiClient.get('/health');
    return response.status === 200;
  } catch (e) {
    return false;
  }
}

export async function syncBatch(items: any[]) {
  const response = await apiClient.post('/sync/batch', { items });
  return response.data;
}

export async function getSyncConfig() {
  const response = await apiClient.get('/sync/config');
  return response.data;
}