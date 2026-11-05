import { tenantApiClient } from 'src/libs/apiClient';

export async function getAllMetricsService() {
  const res = await tenantApiClient.get("/metrics");

  return res.data
}
