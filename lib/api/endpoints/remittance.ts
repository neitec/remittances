import { apiClient } from '@/lib/api/client';

export interface ExchangeRateResponse {
  rate: number;
  from: string;
  to: string;
}

export const remittanceEndpoint = {
  getExchangeRate: async (from: string, to: string): Promise<ExchangeRateResponse> => {
    const response = await apiClient.get(`/remittance/fx?from=${from}&to=${to}`);
    return response.data;
  },
};
