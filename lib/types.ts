// ============ SHARED TYPES ============

export interface Account {
  id: string;
  currency: string;
  balance: string; // Backend returns Big.toFixed(2)
}

export interface DashboardData {
  accounts: Account[];
  totalBalance: number;
}

export interface ExternalAccount {
  id: string;
  accountNumber: string; // Masked ****1234
  bankName: string;
  currency: string;
}

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  TRANSFER = "TRANSFER",
}

export interface Transaction {
  id: string;
  type: string; // "DEPOSIT" | "TRANSFER" (uppercase)
  status: string; // "PENDING" | "COMPLETED" | "FAILED"
  amount: string;
  currency: string;
  createdAt: string;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  nextPage: number;
}

export interface Beneficiary {
  id: string;
  phone: string;
  name: string;
  country: string;
  email: string;
}

export interface DepositInstruction {
  depositInstructions: string; // SEPA instructions
}

export interface TransferRequest {
  beneficiaryPhone: string;
  amount: string;
}

export interface TransferResult {
  operationId: string;
  status: string;
}

export interface DepositRequest {
  externalAccountId?: string;
  amount: string; // String Big number
}

export interface AddExternalAccountRequest {
  accountNumber: string; // IBAN
  bankName: string;
  currency: string;
}

export interface TransactionFilters {
  type?: string | "all";
  startDate?: string;
  endDate?: string;
  page?: number;
}
