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
  User,
  UpdateAliasRequest,
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
  User,
  UpdateAliasRequest,
};
export { TransactionType };

// ============ API FUNCTIONS ============
// All APIs now use Auth0 JWT authentication via Bearer token (injected by axios interceptor)

export const userAPI = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get("/remittance/me");
    return response.data;
  },

  updateAlias: async (alias: string): Promise<User> => {
    const response = await apiClient.post("/remittance/me/alias", { alias });
    return response.data;
  },
};

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

  send: async (data: TransferRequest): Promise<TransferResult> => {
    const response = await apiClient.post("/remittance/transfer", {
      amount: data.amount,
      beneficiaryPhone: data.beneficiaryPhone,
      userAlias: data.userAlias,
      reference: data.reference,
    });
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
    const PAGE_SIZE = 20;
    params.append("page", String(filters?.page || 1));

    const response = await apiClient.get(`/remittance/transactions?${params}`);
    const data: Transaction[] = response.data;
    const page = filters?.page || 1;
    const pageSize = PAGE_SIZE;
    const hasMore = data.length === PAGE_SIZE;

    return {
      transactions: data,
      page,
      pageSize,
      total: data.length,
      hasMore,
      nextPage: page + 1,
    };
  },
};

// ============ RE-EXPORT CLIENT ============
export { apiClient } from "@/lib/api/client";
