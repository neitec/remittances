'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transfersEndpoint } from '@/lib/api/endpoints/transfers';
import { queryKeys } from '@/lib/queryKeys';
import { TransferRequest, TransferResult } from '@/lib/types';

export function useSendMoney() {
  const queryClient = useQueryClient();

  return useMutation<TransferResult, Error, TransferRequest>({
    mutationFn: async (data) => {
      console.log('[useSendMoney] Mutation triggered with:', data);
      return transfersEndpoint.send(data);
    },
    onSuccess: (data) => {
      console.log('[useSendMoney] Mutation success:', data);
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      console.error('[useSendMoney] Mutation error:', error);
    },
  });
}
