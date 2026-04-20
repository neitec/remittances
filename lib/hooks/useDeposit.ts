"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { depositAPI, DepositRequest, DepositInstruction } from "@/lib/api";
import { useDesignMode } from "@/lib/hooks/useDesignMode";

export function useDeposit() {
  const queryClient = useQueryClient();
  const isDesignMode = useDesignMode();

  return useMutation<DepositInstruction, Error, DepositRequest>({
    mutationFn: async (data) => {
      if (isDesignMode) {
        await new Promise((r) => setTimeout(r, 1000));
        return {
          payment_rail: "sepa",
          currency: "EUR",
          amount: data.amount,
          deposit_message: "BRGXZ9924REMITA25",
          iban: "IE62MD0R9M3556N068837",
          bic: "MODRIEZXXX",
          account_holder_name: "Bridge Building S.p.z.o.o.",
          bank_name: "Modulr Finance, Ireland Branch",
          bank_address: "Floor 6, 2 Grand Canal Square, Dublin, Ireland",
        } as DepositInstruction;
      }
      return depositAPI.initiate(data.amount, data.externalAccountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
