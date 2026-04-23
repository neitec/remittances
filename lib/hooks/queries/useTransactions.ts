'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { transactionsEndpoint } from '@/lib/api/endpoints/transactions';
import { queryKeys } from '@/lib/queryKeys';
import { PaginatedTransactions, TransactionFilters } from '@/lib/types';
import { useAuth } from '@/lib/hooks/useAuth';

export function useTransactions(filters?: TransactionFilters) {
  const { isAuthenticated } = useAuth();

  return useInfiniteQuery<PaginatedTransactions>({
    queryKey: queryKeys.transactions(filters),
    queryFn: async ({ pageParam = 1 }) =>
      transactionsEndpoint.list({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextPage : undefined,
    enabled: isAuthenticated,
    staleTime: 0,
  });
}
