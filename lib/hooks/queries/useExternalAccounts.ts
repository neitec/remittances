'use client';

import { useQuery } from '@tanstack/react-query';
import { externalAccountsEndpoint } from '@/lib/api/endpoints/externalAccounts';
import { queryKeys } from '@/lib/queryKeys';
import { ExternalAccount } from '@/lib/types';
import { useAuth } from '@/lib/hooks/useAuth';

export function useExternalAccounts() {
  const { isAuthenticated } = useAuth();

  return useQuery<ExternalAccount[]>({
    queryKey: queryKeys.externalAccounts,
    queryFn: () => externalAccountsEndpoint.list(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
