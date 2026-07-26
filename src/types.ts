export type Currency = 'BOB' | 'USD';

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  iconName: string;
  color: string;
  budgetLimit?: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  description: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  accountId: string;
  toAccountId?: string;
  tags?: string[];
  notes?: string;
  status: 'completed' | 'pending';
  beneficiary?: string; // BENEFICIARIO from Google Sheet CSV
  glosa?: string;       // GLOSA from Google Sheet CSV
}

export interface GoogleSheetSyncState {
  sheetUrl: string;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
  totalParsedRows: number;
  totalMontoSum: number;
  isSheetModeActive: boolean;
}

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'investment' | 'card' | 'cash' | 'crypto' | 'debt';
  balance: number;
  accountNumberMasked: string;
  color: string;
  institution?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  alertThresholdPercent: number; // e.g. 80
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category: string;
  color: string;
  notes?: string;
}

export type TimePeriod = '1M' | '3M' | '6M' | '1Y' | 'ALL';

export type NavigationTab =
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'accounts'
  | 'goals'
  | 'analytics'
  | 'ai-advisor';

export interface FilterState {
  searchQuery: string;
  categoryId: string;
  accountId: string;
  type: 'all' | 'income' | 'expense' | 'transfer';
  dateFrom: string;
  dateTo: string;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export interface FinanceSummary {
  totalWealth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netSavings: number;
  savingsRatePercent: number;
  wealthGrowthPercent: number;
  incomeVsLastMonthPercent: number;
  expenseVsLastMonthPercent: number;
}
