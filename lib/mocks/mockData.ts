import {
  Account,
  DashboardData,
  ExternalAccount,
  Transaction,
  PaginatedTransactions,
  Beneficiary,
  DepositInstruction,
} from "@/lib/types";

export const mockAccount: Account[] = [
  {
    id: "ACC-001",
    currency: "EUR",
    balance: "5432.50",
  },
  {
    id: "ACC-002",
    currency: "USD",
    balance: "2100.75",
  },
];

export const mockDashboardData: DashboardData = {
  accounts: mockAccount,
  totalBalance: 5432.50 + 2100.75,
};

export const mockExternalAccounts: ExternalAccount[] = [
  {
    id: "EXT-001",
    accountNumber: "****1234",
    bankName: "ING Bank España",
    currency: "EUR",
  },
  {
    id: "EXT-002",
    accountNumber: "****5678",
    bankName: "Banco Bilbao Vizcaya",
    currency: "EUR",
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: "TXN-001",
    type: "DEPOSIT",
    status: "COMPLETED",
    amount: "500.00",
    currency: "EUR",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "TXN-002",
    type: "TRANSFER",
    status: "COMPLETED",
    amount: "250.50",
    currency: "EUR",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "TXN-003",
    type: "DEPOSIT",
    status: "PENDING",
    amount: "1000.00",
    currency: "EUR",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "TXN-004",
    type: "TRANSFER",
    status: "COMPLETED",
    amount: "75.25",
    currency: "EUR",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "TXN-005",
    type: "DEPOSIT",
    status: "COMPLETED",
    amount: "2000.00",
    currency: "EUR",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockPaginatedTransactions: PaginatedTransactions = {
  transactions: mockTransactions,
  page: 1,
  pageSize: mockTransactions.length,
  total: mockTransactions.length,
  hasMore: false,
  nextPage: 2,
};

export const mockBeneficiary: Beneficiary = {
  id: "BEN-001",
  phone: "+34 600 123 456",
  name: "Juan García López",
  country: "ES",
  email: "juan@example.com",
};

export const mockDepositInstruction: DepositInstruction = {
  payment_rail: "sepa",
  currency: "EUR",
  amount: "500.00",
  deposit_message: "BRGXZ4GT9SCANM4325P3",
  iban: "ES9121000418450200051332",
  bic: "BBVAESMMXXX",
  account_holder_name: "Remita Services S.L.",
  bank_name: "Banco Bilbao Vizcaya",
  bank_address: "Paseo de la Castellana 81, 28046 Madrid, Spain",
};
