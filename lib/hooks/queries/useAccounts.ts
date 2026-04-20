'use client';

import { useQuery } from '@tanstack/react-query';
import { accountsEndpoint } from '@/lib/api/endpoints/accounts';
import { queryKeys } from '@/lib/queryKeys';
import { DashboardData } from '@/lib/types';
import { useAuth } from '@/lib/hooks/useAuth';

export function useAccounts() {
  const { isAuthenticated } = useAuth();

  return useQuery<DashboardData>({
    queryKey: queryKeys.accounts,
    queryFn: () => accountsEndpoint.list(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}
