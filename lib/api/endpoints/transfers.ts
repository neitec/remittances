import { apiClient } from '@/lib/api/client';
import { Beneficiary, TransferRequest, TransferResult } from '@/lib/types';

export const transfersEndpoint = {
  searchBeneficiary: async (phone: string): Promise<Beneficiary> => {
    const response = await apiClient.get(`/remittance/users?phone=${encodeURIComponent(phone)}`);
    return response.data;
  },

  send: async (data: TransferRequest): Promise<TransferResult> => {
    const response = await apiClient.post('/remittance/transfer', {
      amount: data.amount,
      beneficiaryPhone: data.beneficiaryPhone,
      userAlias: data.userAlias,
      reference: data.reference,
    });
    return response.data;
  },
};
