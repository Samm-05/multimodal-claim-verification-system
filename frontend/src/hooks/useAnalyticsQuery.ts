import { useQuery } from '@tanstack/react-query';
import { claimsApi } from '../services/api';

export function useAnalyticsQuery() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => claimsApi.getAnalytics(),
    staleTime: 1000 * 60, // 1 minute
  });
}
