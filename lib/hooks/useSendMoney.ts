"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transferAPI, TransferRequest, TransferResult } from "@/lib/api";

export function useSendMoney() {
  const queryClient = useQueryClient();

  return useMutation<TransferResult, Error, TransferRequest>({
    mutationFn: async (data) => transferAPI.send(data.beneficiaryPhone, data.amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
