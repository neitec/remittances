'use client';

import { useQuery } from '@tanstack/react-query';
import { remittanceEndpoint } from '@/lib/api/endpoints/remittance';
import { queryKeys } from '@/lib/queryKeys';

export function useExchangeRate(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.exchangeRate(from, to),
    queryFn: () => remittanceEndpoint.getExchangeRate(from, to),
    staleTime: 1000 * 60 * 60,
    enabled: false,
    initialData: { rate: 59.5, from, to },
  });
}
