"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { transactionsAPI, PaginatedTransactions, TransactionFilters } from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { useDesignMode } from "@/lib/hooks/useDesignMode";
import { mockPaginatedTransactions } from "@/lib/mocks/mockData";

export function useTransactions(filters?: TransactionFilters) {
  const { isAuthenticated } = useAuth();
  const isDesignMode = useDesignMode();

  return useInfiniteQuery<PaginatedTransactions>({
    queryKey: ["transactions", filters],
    queryFn: async ({ pageParam = 1 }) => {
      if (isDesignMode) {
        // Simular delay de red en modo diseño
        await new Promise((resolve) => setTimeout(resolve, 500));
        return mockPaginatedTransactions;
      }
      return transactionsAPI.list({ ...filters, page: pageParam as number });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextPage : undefined,
    enabled: isAuthenticated || isDesignMode,
  });
}
