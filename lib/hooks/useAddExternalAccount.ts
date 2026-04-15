"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { externalAccountsAPI, AddExternalAccountRequest, ExternalAccount } from "@/lib/api";

export function useAddExternalAccount() {
  const queryClient = useQueryClient();

  return useMutation<ExternalAccount, Error, AddExternalAccountRequest>({
    mutationFn: async (data) => externalAccountsAPI.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["externalAccounts"] });
    },
  });
}
