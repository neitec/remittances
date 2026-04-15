"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { transactionsAPI, PaginatedTransactions, TransactionFilters } from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";

export function useTransactions(filters?: TransactionFilters) {
  const { isAuthenticated } = useAuth();

  return useInfiniteQuery<PaginatedTransactions>({
    queryKey: ["transactions", filters],
    queryFn: async ({ pageParam = 1 }) =>
      transactionsAPI.list({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextPage : undefined,
    enabled: isAuthenticated,
  });
}
