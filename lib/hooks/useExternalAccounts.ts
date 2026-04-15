"use client";

import { useQuery } from "@tanstack/react-query";
import { externalAccountsAPI, ExternalAccount } from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";

export function useExternalAccounts() {
  const { isAuthenticated } = useAuth();

  return useQuery<ExternalAccount[]>({
    queryKey: ["externalAccounts"],
    queryFn: async () => externalAccountsAPI.list(),
    enabled: isAuthenticated,
  });
}
