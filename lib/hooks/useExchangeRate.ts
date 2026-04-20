"use client";

import { useQuery } from "@tanstack/react-query";
import { remittanceAPI } from "@/lib/api";

export function useExchangeRate(from: string, to: string) {
  return useQuery({
    queryKey: ["exchangeRate", from, to],
    queryFn: () => remittanceAPI.getExchangeRate(from, to),
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
    initialData: from === "EUR" && to === "DOP" ? { rate: 59.5, from: "EUR", to: "DOP" } : undefined,
  });
}
