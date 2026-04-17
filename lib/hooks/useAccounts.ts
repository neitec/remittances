"use client";

import { useQuery } from "@tanstack/react-query";
import { accountsAPI, DashboardData } from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { useDesignMode } from "@/lib/hooks/useDesignMode";
import { mockDashboardData } from "@/lib/mocks/mockData";

export function useAccounts() {
  const { isAuthenticated } = useAuth();
  const isDesignMode = useDesignMode();

  return useQuery<DashboardData>({
    queryKey: ["accounts"],
    queryFn: async () => {
      if (isDesignMode) {
        // Simular delay de red en modo diseño
        await new Promise((resolve) => setTimeout(resolve, 500));
        return mockDashboardData;
      }
      return accountsAPI.getAccounts();
    },
    enabled: isAuthenticated || isDesignMode,
    staleTime: 60_000,
  });
}
