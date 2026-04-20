'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transfersEndpoint } from '@/lib/api/endpoints/transfers';
import { queryKeys } from '@/lib/queryKeys';
import { TransferRequest, TransferResult } from '@/lib/types';

export function useSendMoney() {
  const queryClient = useQueryClient();

  return useMutation<TransferResult, Error, TransferRequest>({
    mutationFn: async (data) => transfersEndpoint.send(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
    },
  });
}
