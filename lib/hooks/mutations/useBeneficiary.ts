'use client';

import { useMutation } from '@tanstack/react-query';
import { transfersEndpoint } from '@/lib/api/endpoints/transfers';
import { Beneficiary } from '@/lib/types';

export function useBeneficiaryByPhone() {
  return useMutation<Beneficiary, Error, string>({
    mutationFn: async (phone) => transfersEndpoint.searchBeneficiaryByPhone(phone),
  });
}

export function useBeneficiaryByAlias() {
  return useMutation<Beneficiary, Error, string>({
    mutationFn: async (alias) => transfersEndpoint.searchBeneficiaryByAlias(alias),
  });
}
