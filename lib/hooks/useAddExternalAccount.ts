"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { externalAccountsAPI, AddExternalAccountRequest, ExternalAccount } from "@/lib/api";
import { useDesignMode } from "@/lib/hooks/useDesignMode";

export function useAddExternalAccount() {
  const queryClient = useQueryClient();
  const isDesignMode = useDesignMode();

  return useMutation<ExternalAccount, Error, AddExternalAccountRequest>({
    mutationFn: async (data) => {
      if (isDesignMode) {
        await new Promise((r) => setTimeout(r, 800));
        return {
          id: `mock-${Date.now()}`,
          accountNumber: data.accountNumber,
          bankName: data.bankName,
          currency: data.currency ?? "EUR",
          createdAt: new Date().toISOString(),
        } as ExternalAccount;
      }
      return externalAccountsAPI.add(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["externalAccounts"] });
    },
  });
}
