'use client';

import { useMutation } from '@tanstack/react-query';
import { transfersEndpoint } from '@/lib/api/endpoints/transfers';
import { Beneficiary } from '@/lib/types';

export function useBeneficiary() {
  return useMutation<Beneficiary, Error, string>({
    mutationFn: async (phone) => transfersEndpoint.searchBeneficiary(phone),
  });
}
