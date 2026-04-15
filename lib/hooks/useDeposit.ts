"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { depositAPI, DepositRequest, DepositInstruction } from "@/lib/api";

export function useDeposit() {
  const queryClient = useQueryClient();

  return useMutation<DepositInstruction, Error, DepositRequest>({
    mutationFn: async (data) => depositAPI.initiate(data.amount, data.externalAccountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
