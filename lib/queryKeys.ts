import { TransactionFilters } from './types';

export const queryKeys = {
  me: ['me'] as const,
  accounts: ['accounts'] as const,
  transactions: (filters?: TransactionFilters) => ['transactions', filters] as const,
  exchangeRate: (from: string, to: string) => ['exchangeRate', from, to] as const,
  externalAccounts: ['externalAccounts'] as const,
  beneficiary: (phone: string) => ['beneficiary', phone] as const,
} as const;
