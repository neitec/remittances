"use client";

import { useMutation } from "@tanstack/react-query";
import { transferAPI, Beneficiary } from "@/lib/api";

export function useBeneficiary() {
  return useMutation<Beneficiary, Error, string>({
    mutationFn: async (phone) => transferAPI.searchBeneficiary(phone),
  });
}
