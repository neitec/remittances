import { apiClient } from '@/lib/api/client';
import { DepositInstruction, DepositRequest } from '@/lib/types';

export const depositsEndpoint = {
  initiate: async (amount: string, externalAccountId?: string): Promise<DepositInstruction> => {
    const response = await apiClient.post('/remittance/deposit', { amount, externalAccountId });
    return response.data;
  },
};
