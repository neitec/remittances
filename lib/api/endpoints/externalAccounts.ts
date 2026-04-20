import { apiClient } from '@/lib/api/client';
import { ExternalAccount, AddExternalAccountRequest } from '@/lib/types';

export const externalAccountsEndpoint = {
  list: async (): Promise<ExternalAccount[]> => {
    const response = await apiClient.get('/remittance/external-account');
    return response.data;
  },

  add: async (data: AddExternalAccountRequest): Promise<ExternalAccount> => {
    const response = await apiClient.post('/remittance/external-account', data);
    return response.data;
  },
};
