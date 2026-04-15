import { apiClient } from "@/lib/api/client";
import {
  Account,
  DashboardData,
  ExternalAccount,
  TransactionType,
  Transaction,
  PaginatedTransactions,
  Beneficiary,
  DepositInstruction,
  TransferRequest,
  TransferResult,
  DepositRequest,
  AddExternalAccountRequest,
  TransactionFilters,
} from "@/lib/types";

// ============ RE-EXPORT TYPES ============
// Types are defined in lib/types.ts to avoid circular dependencies

export type {
  Account,
  DashboardData,
  ExternalAccount,
  Transaction,
  PaginatedTransactions,
  Beneficiary,
  DepositInstruction,
  TransferRequest,
  TransferResult,
  DepositRequest,
  AddExternalAccountRequest,
  TransactionFilters,
};
export { TransactionType };

// ============ API FUNCTIONS ============
// All APIs now use Auth0 JWT authentication via Bearer token (injected by axios interceptor)

export const accountsAPI = {
  getAccounts: async (): Promise<DashboardData> => {
    const response = await apiClient.get("/remittance/accounts");
    const accounts: Account[] = response.data;
    const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);
    return { accounts, totalBalance };
  },
};

export const externalAccountsAPI = {
  list: async (): Promise<ExternalAccount[]> => {
    const response = await apiClient.get("/remittance/external-account");
    return response.data;
  },

  add: async (data: AddExternalAccountRequest): Promise<ExternalAccount> => {
    const response = await apiClient.post("/remittance/external-account", data);
    return response.data;
  },
};

export const depositAPI = {
  initiate: async (amount: string, externalAccountId?: string): Promise<DepositInstruction> => {
    const response = await apiClient.post("/remittance/deposit", { amount, externalAccountId });
    return response.data;
  },
};

export const transferAPI = {
  searchBeneficiary: async (phone: string): Promise<Beneficiary> => {
    const response = await apiClient.get(`/remittance/users?phone=${encodeURIComponent(phone)}`);
    return response.data;
  },

  send: async (beneficiaryPhone: string, amount: string): Promise<TransferResult> => {
    const response = await apiClient.post("/remittance/transfer", { beneficiaryPhone, amount });
    return response.data;
  },
};

export const transactionsAPI = {
  list: async (filters?: TransactionFilters): Promise<PaginatedTransactions> => {
    const params = new URLSearchParams();
    if (filters?.type && filters.type !== "all") {
      params.append("type", filters.type);
    }
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    params.append("page", String(filters?.page || 1));

    const response = await apiClient.get(`/remittance/transactions?${params}`);
    const data: Transaction[] = response.data;
    const page = filters?.page || 1;

    return {
      transactions: data,
      page,
      pageSize: data.length,
      total: data.length,
      hasMore: false,
      nextPage: page + 1,
    };
  },
};

// ============ RE-EXPORT CLIENT ============
export { apiClient } from "@/lib/api/client";
