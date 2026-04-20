import { apiClient } from '@/lib/api/client';
import { Beneficiary, TransferRequest, TransferResult } from '@/lib/types';

export const transfersEndpoint = {
  searchBeneficiary: async (phone: string): Promise<Beneficiary> => {
    const response = await apiClient.get(`/remittance/users?phone=${encodeURIComponent(phone)}`);
    return response.data;
  },

  send: async (data: TransferRequest): Promise<TransferResult> => {
    // Validate amount is a valid number
    const amountNum = parseFloat(data.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error('Monto inválido: debe ser un número mayor que 0');
    }

    const payload = {
      amount: data.amount,
      beneficiaryPhone: data.beneficiaryPhone,
      ...(data.userAlias && { userAlias: data.userAlias }),
      ...(data.reference && { reference: data.reference }),
    };

    console.log('[TransfersEndpoint] Calling /remittance/transfer with:', payload);

    try {
      const response = await apiClient.post('/remittance/transfer', payload);
      console.log('[TransfersEndpoint] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[TransfersEndpoint] Error:', error);
      throw error;
    }
  },
};
