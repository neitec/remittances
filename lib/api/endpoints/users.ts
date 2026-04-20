import { apiClient } from '@/lib/api/client';
import { User, UpdateAliasRequest } from '@/lib/types';

export const usersEndpoint = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/remittance/me');
    return response.data;
  },

  updateAlias: async (alias: string): Promise<User> => {
    const response = await apiClient.post('/remittance/me/alias', { alias });
    return response.data;
  },
};
