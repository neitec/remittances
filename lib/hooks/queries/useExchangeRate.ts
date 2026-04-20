'use client';

import { useQuery } from '@tanstack/react-query';
import { remittanceEndpoint } from '@/lib/api/endpoints/remittance';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/lib/hooks/useAuth';

export function useExchangeRate(from: string, to: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.exchangeRate(from, to),
    queryFn: async () => {
      console.log(`[FX] Fetching exchange rate: ${from} → ${to}`);
      try {
        const result = await remittanceEndpoint.getExchangeRate(from, to);
        console.log(`[FX] Success:`, result);
        return result;
      } catch (error) {
        console.error(`[FX] Error fetching ${from}/${to}:`, error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60,
    enabled: isAuthenticated,
    initialData: { rate: 70.82, from, to },
    retry: 1,
  });
}
