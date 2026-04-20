'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { depositsEndpoint } from '@/lib/api/endpoints/deposits';
import { queryKeys } from '@/lib/queryKeys';
import { DepositRequest, DepositInstruction } from '@/lib/types';

export function useDeposit() {
  const queryClient = useQueryClient();

  return useMutation<DepositInstruction, Error, DepositRequest>({
    mutationFn: async (data) =>
      depositsEndpoint.initiate(data.amount || undefined, data.externalAccountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
    },
  });
}
