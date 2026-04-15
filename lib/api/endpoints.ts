import { apiClient } from './client';
import type {
  Account as RemAccountDto,
  ExternalAccount as RemExternalAccountDto,
  Transaction as RemTransactionDto,
  AddExternalAccountRequest as CreateExternalAccountDto,
  Beneficiary,
} from '@/lib/types';

const BASE = '/remittance';

export const userAPI = {
  // GET /remittance/me
  getMe: () =>
    apiClient.get<{ id: string; email: string; phone: string; country: string }>(`${BASE}/me`),

  // GET /remittance/users?phone={phone}
  findByPhone: (phone: string) =>
    apiClient.get<Beneficiary>(`${BASE}/users?phone=${encodeURIComponent(phone)}`),
};

export const accountsAPI = {
  // GET /remittance/accounts
  getAccounts: () =>
    apiClient.get<RemAccountDto[]>(`${BASE}/accounts`),

  // GET /remittance/external-account
  getExternalAccounts: () =>
    apiClient.get<RemExternalAccountDto[]>(`${BASE}/external-account`),

  // POST /remittance/external-account
  createExternalAccount: (data: CreateExternalAccountDto) =>
    apiClient.post<RemExternalAccountDto>(`${BASE}/external-account`, data),

  // POST /remittance/deposit
  createDeposit: (amount: string, externalAccountId?: string) =>
    apiClient.post<Record<string, unknown>>(`${BASE}/deposit`, { amount, externalAccountId }),

  // POST /remittance/transfer
  createTransfer: (beneficiaryPhone: string, amount: string) =>
    apiClient.post<Record<string, unknown>>(`${BASE}/transfer`, { beneficiaryPhone, amount }),

  // GET /remittance/transactions
  getTransactions: () =>
    apiClient.get<RemTransactionDto[]>(`${BASE}/transactions`),
};
