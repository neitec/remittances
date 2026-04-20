'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { externalAccountsEndpoint } from '@/lib/api/endpoints/externalAccounts';
import { queryKeys } from '@/lib/queryKeys';
import { AddExternalAccountRequest, ExternalAccount } from '@/lib/types';

export function useAddExternalAccount() {
  const queryClient = useQueryClient();

  return useMutation<ExternalAccount, Error, AddExternalAccountRequest>({
    mutationFn: async (data) => externalAccountsEndpoint.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.externalAccounts });
    },
  });
}
