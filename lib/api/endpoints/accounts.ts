import { apiClient } from '@/lib/api/client';
import { Account, DashboardData } from '@/lib/types';

export const accountsEndpoint = {
  list: async (): Promise<DashboardData> => {
    const response = await apiClient.get('/remittance/accounts');
    const accounts: Account[] = response.data;
    const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);
    return { accounts, totalBalance };
  },
};
