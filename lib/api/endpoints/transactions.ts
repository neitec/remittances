import { apiClient } from '@/lib/api/client';
import { Transaction, PaginatedTransactions, TransactionFilters } from '@/lib/types';

const PAGE_SIZE = 20;

export const transactionsEndpoint = {
  list: async (filters?: TransactionFilters): Promise<PaginatedTransactions> => {
    const params = new URLSearchParams();
    if (filters?.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    params.append('page', String(filters?.page || 1));

    const response = await apiClient.get(`/remittance/transactions?${params}`);
    const data: Transaction[] = response.data;
    const page = filters?.page || 1;

    return {
      transactions: data,
      page,
      pageSize: PAGE_SIZE,
      total: data.length,
      hasMore: data.length === PAGE_SIZE,
      nextPage: page + 1,
    };
  },
};
