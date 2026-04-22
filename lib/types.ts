// ============ SHARED TYPES ============

export interface Account {
  id: string;
  currency: string;
  balance: string;
  userId: string;
  user?: User | null;
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
  createdAt?: string;
}

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  TRANSFER = "TRANSFER",
}

export enum TransactionStatus {
  FUNDS_RECEIVED = "FUNDS_RECEIVED",
  PAYMENT_SUBMITTED = "PAYMENT_SUBMITTED",
  IN_REVIEW = "IN_REVIEW",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  sourceAccount?: Account | null;
  destinationAccount?: Account | null;
  amount: string;
  currency: string;
  reference?: string;
  externalAccount?: {
    id: string;
    accountNumber: string; // Masked
    bankName: string;
    currency: string;
  } | null;
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

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  surname: string;
  alias?: string | null;
  country: string;
}

export interface Beneficiary extends User {}

export interface DepositInstruction {
  payment_rail: string; // "sepa"
  currency: string; // "EUR"
  amount: string; // "0.0"
  deposit_message: string; // Reference number (e.g., "BRGXZ4GT9SCANM4325P3")
  iban: string;
  account_holder_name: string;
  bank_name: string;
  bank_address: string;
}

export interface TransferRequest {
  amount: string;
  beneficiaryPhone?: string;
  userAlias?: string;
  reference?: string;
}

export interface TransferResult {
  operationId: string;
  status: string;
}

export interface DepositRequest {
  externalAccountId?: string;
  amount?: string; // String Big number — optional, required only for mock mode
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

export interface UpdateAliasRequest {
  alias: string;
}
