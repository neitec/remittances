"use client";

import { useQuery } from "@tanstack/react-query";
import { accountsAPI, DashboardData } from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";

export function useAccounts() {
  const { isAuthenticated } = useAuth();

  return useQuery<DashboardData>({
    queryKey: ["accounts"],
    queryFn: async () => accountsAPI.getAccounts(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}
