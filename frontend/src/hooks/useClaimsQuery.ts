import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { claimsApi } from '../services/api';

export function useClaimsQuery(params?: { query?: string; object_type?: string; severity?: string; status?: string }) {
  return useQuery({
    queryKey: ['claims', params],
    queryFn: () => claimsApi.getClaims(params),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useClaimDetailQuery(id: string) {
  return useQuery({
    queryKey: ['claim', id],
    queryFn: () => claimsApi.getClaimById(id),
    enabled: Boolean(id),
  });
}

export function useUpdateClaimDecisionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'approve' | 'reject' | 'escalate' }) =>
      claimsApi.updateDecision(id, decision),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['claim', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useVerifyClaimMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userClaim: string; claimObject: string; imagePaths?: string[] }) =>
      claimsApi.verifyClaim(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
