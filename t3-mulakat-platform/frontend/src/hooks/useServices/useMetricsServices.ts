import { useQuery } from '@tanstack/react-query';
import { getAllMetricsService } from 'src/services';

export function useGetAllMetricsQuery() {
  return useQuery(['metrics'], () => getAllMetricsService());
}
