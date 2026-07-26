import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Transaction,
  Category,
  Account,
  Budget,
  SavingsGoal,
  Currency,
  NavigationTab,
  FilterState,
  TimePeriod,
  FinanceSummary,
  GoogleSheetSyncState,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_ACCOUNTS,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  INITIAL_TRANSACTIONS,
} from '../data/mockData';
import { parseCSVString } from '../utils/csvParser';

export const DEFAULT_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQyATe6zNqapQ_zEQvkckWz5wsDW1IlAv0oZxvL1tcRygie5cLpQIXtB5kgMxaQcgZpuRckF-WrvM1w/pub?output=csv';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  goals: SavingsGoal[];
  currency: Currency;
  selectedTab: NavigationTab;
  filters: FilterState;
  timePeriod: TimePeriod;
  isAddTxModalOpen: boolean;
  editingTx: Transaction | null;
  isAiPanelOpen: boolean;

  // Google Sheets CSV Sync State & Control
  sheetState: GoogleSheetSyncState;
  syncGoogleSheet: (customUrl?: string) => Promise<void>;
  toggleSheetMode: (active: boolean) => void;

  // Setters & UI Actions
  setCurrency: (c: Currency) => void;
  setSelectedTab: (tab: NavigationTab) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  setTimePeriod: (period: TimePeriod) => void;
  setIsAddTxModalOpen: (open: boolean) => void;
  setEditingTx: (tx: Transaction | null) => void;
  setIsAiPanelOpen: (open: boolean) => void;

  // CRUD Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;

  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;

  addCategory: (category: Omit<Category, 'id'>) => void;
  saveBudget: (categoryId: string, monthlyLimit: number) => void;

  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateGoal: (goal: SavingsGoal) => void;
  depositToGoal: (goalId: string, amount: number, accountId: string) => void;

  resetToDemoData: () => void;
  exportDataJSON: () => void;
  exportTransactionsCSV: () => void;

  // Computed
  summary: FinanceSummary;
  filteredTransactions: Transaction[];
}

const STORAGE_KEYS = {
  TRANSACTIONS: 'finanzapp_transactions_v1',
  CATEGORIES: 'finanzapp_categories_v1',
  ACCOUNTS: 'finanzapp_accounts_v1',
  BUDGETS: 'finanzapp_budgets_v1',
  GOALS: 'finanzapp_goals_v1',
  CURRENCY: 'finanzapp_currency_v1',
  SHEET_URL: 'finanzapp_sheet_url_v1',
  SHEET_MODE: 'finanzapp_sheet_mode_v1',
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
    return (saved as Currency) || 'BOB';
  });

  const [sheetState, setSheetState] = useState<GoogleSheetSyncState>(() => {
    const savedUrl = localStorage.getItem(STORAGE_KEYS.SHEET_URL) || DEFAULT_SHEET_URL;
    const savedMode = localStorage.getItem(STORAGE_KEYS.SHEET_MODE);
    return {
      sheetUrl: savedUrl,
      isSyncing: false,
      lastSyncedAt: null,
      error: null,
      totalParsedRows: 0,
      totalMontoSum: 0,
      isSheetModeActive: savedMode !== null ? savedMode === 'true' : true,
    };
  });

  const [selectedTab, setSelectedTab] = useState<NavigationTab>('dashboard');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('1M');
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    categoryId: 'all',
    accountId: 'all',
    type: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date-desc',
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  }, [currency]);

  // Google Sheets CSV Sync Function
  const syncGoogleSheet = async (customUrl?: string) => {
    const targetUrl = customUrl || sheetState.sheetUrl || DEFAULT_SHEET_URL;

    setSheetState((prev) => ({
      ...prev,
      sheetUrl: targetUrl,
      isSyncing: true,
      error: null,
    }));

    try {
      let csvText = '';
      // Try server proxy first
      const proxyRes = await fetch(`/api/fetch-sheet-csv?url=${encodeURIComponent(targetUrl)}`);
      if (proxyRes.ok) {
        csvText = await proxyRes.text();
      } else {
        // Direct fetch fallback
        const directRes = await fetch(targetUrl);
        if (!directRes.ok) {
          throw new Error(`HTTP ${directRes.status} al descargar CSV`);
        }
        csvText = await directRes.text();
      }

      const parsed = parseCSVString(csvText);

      if (parsed.rows.length === 0) {
        throw new Error('No se encontraron filas de datos válidas en el CSV.');
      }

      // Convert parsed rows into Transaction items
      const sheetTransactions: Transaction[] = parsed.rows.map((r) => {
        const isInc = r.monto >= 0;
        return {
          id: r.id,
          date: r.fecha,
          description: r.beneficiario || r.glosa || 'Transacción CSV',
          categoryId: isInc ? 'cat-1' : 'cat-6',
          amount: Math.abs(r.monto),
          type: isInc ? 'income' : 'expense',
          accountId: 'sheet-acc',
          status: 'completed',
          beneficiary: r.beneficiario,
          glosa: r.glosa,
          notes: r.glosa,
        };
      });

      setTransactions(sheetTransactions);

      // Create or update Google Sheets account item
      setAccounts((prev) => {
        const exists = prev.some((a) => a.id === 'sheet-acc');
        if (exists) {
          return prev.map((a) =>
            a.id === 'sheet-acc' ? { ...a, balance: parsed.totalMontoSum } : a
          );
        } else {
          return [
            {
              id: 'sheet-acc',
              name: 'Google Sheets (CSV)',
              type: 'bank',
              balance: parsed.totalMontoSum,
              accountNumberMasked: '**** GSHT',
              color: '#4edea3',
              institution: 'Google Sheets Live Sync',
            },
            ...prev,
          ];
        }
      });

      const nowFormatted = new Date().toLocaleTimeString('es-BO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      localStorage.setItem(STORAGE_KEYS.SHEET_URL, targetUrl);

      setSheetState({
        sheetUrl: targetUrl,
        isSyncing: false,
        lastSyncedAt: nowFormatted,
        error: null,
        totalParsedRows: parsed.rowCount,
        totalMontoSum: parsed.totalMontoSum,
        isSheetModeActive: true,
      });
    } catch (err: any) {
      console.error('Error syncing Google Sheet:', err);
      setSheetState((prev) => ({
        ...prev,
        isSyncing: false,
        error: err?.message || 'Error al conectar con Google Sheets.',
      }));
    }
  };

  const toggleSheetMode = (active: boolean) => {
    localStorage.setItem(STORAGE_KEYS.SHEET_MODE, String(active));
    setSheetState((prev) => ({
      ...prev,
      isSheetModeActive: active,
    }));
  };

  // Auto-sync CSV from Google Sheets on initial mount
  useEffect(() => {
    syncGoogleSheet();
  }, []);

  // Recalculate Account balances dynamically when transactions change or adjust account balance
  const adjustAccountBalance = (
    accs: Account[],
    accountId: string,
    delta: number
  ): Account[] => {
    return accs.map((acc) => {
      if (acc.id === accountId) {
        return { ...acc, balance: Number((acc.balance + delta).toFixed(2)) };
      }
      return acc;
    });
  };

  const addTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update account balance
    setAccounts((prevAccs) => {
      let updated = prevAccs;
      if (newTx.type === 'income') {
        updated = adjustAccountBalance(updated, newTx.accountId, newTx.amount);
      } else if (newTx.type === 'expense') {
        updated = adjustAccountBalance(updated, newTx.accountId, -newTx.amount);
      } else if (newTx.type === 'transfer' && newTx.toAccountId) {
        updated = adjustAccountBalance(updated, newTx.accountId, -newTx.amount);
        updated = adjustAccountBalance(updated, newTx.toAccountId, newTx.amount);
      }
      return updated;
    });
  };

  const updateTransaction = (updatedTx: Transaction) => {
    const oldTx = transactions.find((t) => t.id === updatedTx.id);
    if (!oldTx) return;

    setTransactions((prev) => prev.map((t) => (t.id === updatedTx.id ? updatedTx : t)));

    // Revert old effect and apply new effect on balances
    setAccounts((prevAccs) => {
      let temp = prevAccs;
      // Revert old
      if (oldTx.type === 'income') {
        temp = adjustAccountBalance(temp, oldTx.accountId, -oldTx.amount);
      } else if (oldTx.type === 'expense') {
        temp = adjustAccountBalance(temp, oldTx.accountId, oldTx.amount);
      } else if (oldTx.type === 'transfer' && oldTx.toAccountId) {
        temp = adjustAccountBalance(temp, oldTx.accountId, oldTx.amount);
        temp = adjustAccountBalance(temp, oldTx.toAccountId, -oldTx.amount);
      }

      // Apply new
      if (updatedTx.type === 'income') {
        temp = adjustAccountBalance(temp, updatedTx.accountId, updatedTx.amount);
      } else if (updatedTx.type === 'expense') {
        temp = adjustAccountBalance(temp, updatedTx.accountId, -updatedTx.amount);
      } else if (updatedTx.type === 'transfer' && updatedTx.toAccountId) {
        temp = adjustAccountBalance(temp, updatedTx.accountId, -updatedTx.amount);
        temp = adjustAccountBalance(temp, updatedTx.toAccountId, updatedTx.amount);
      }

      return temp;
    });
  };

  const deleteTransaction = (id: string) => {
    const oldTx = transactions.find((t) => t.id === id);
    if (!oldTx) return;

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    // Revert balance
    setAccounts((prevAccs) => {
      let temp = prevAccs;
      if (oldTx.type === 'income') {
        temp = adjustAccountBalance(temp, oldTx.accountId, -oldTx.amount);
      } else if (oldTx.type === 'expense') {
        temp = adjustAccountBalance(temp, oldTx.accountId, oldTx.amount);
      } else if (oldTx.type === 'transfer' && oldTx.toAccountId) {
        temp = adjustAccountBalance(temp, oldTx.accountId, oldTx.amount);
        temp = adjustAccountBalance(temp, oldTx.toAccountId, -oldTx.amount);
      }
      return temp;
    });
  };

  const addAccount = (accData: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...accData,
      id: `acc-${Date.now()}`,
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  const updateAccount = (updatedAcc: Account) => {
    setAccounts((prev) => prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a)));
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const saveBudget = (categoryId: string, monthlyLimit: number) => {
    setBudgets((prev) => {
      const existing = prev.find((b) => b.categoryId === categoryId);
      if (existing) {
        return prev.map((b) => (b.categoryId === categoryId ? { ...b, monthlyLimit } : b));
      }
      return [
        ...prev,
        {
          id: `b-${Date.now()}`,
          categoryId,
          monthlyLimit,
          alertThresholdPercent: 80,
        },
      ];
    });

    // Also sync budgetLimit on Category object
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, budgetLimit: monthlyLimit } : c))
    );
  };

  const addGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const updateGoal = (goal: SavingsGoal) => {
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? goal : g)));
  };

  const depositToGoal = (goalId: string, amount: number, accountId: string) => {
    if (amount <= 0) return;
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    // Update goal
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );

    // Create a transaction of type expense/transfer for Goal savings
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      description: `Aportación a Meta: ${goal.title}`,
      categoryId: 'cat-inversiones-div',
      amount: amount,
      type: 'expense',
      accountId: accountId,
      tags: ['Ahorro', 'Meta'],
      status: 'completed',
    });
  };

  const resetToDemoData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setCategories(INITIAL_CATEGORIES);
    setAccounts(INITIAL_ACCOUNTS);
    setBudgets(INITIAL_BUDGETS);
    setGoals(INITIAL_GOALS);
    setCurrency('BOB');
    localStorage.clear();
  };

  const exportDataJSON = () => {
    const data = {
      transactions,
      categories,
      accounts,
      budgets,
      goals,
      currency,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanzapp_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportTransactionsCSV = () => {
    const headers = ['ID', 'Fecha', 'Tipo', 'Descripción', 'Categoría', 'Importe', 'Cuenta', 'Estado'];
    const rows = transactions.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId)?.name || t.categoryId;
      const acc = accounts.find((a) => a.id === t.accountId)?.name || t.accountId;
      return [
        t.id,
        t.date,
        t.type,
        `"${t.description.replace(/"/g, '""')}"`,
        `"${cat}"`,
        t.amount,
        `"${acc}"`,
        t.status,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanzapp_transacciones_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered transactions computation
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Query
        if (
          filters.searchQuery &&
          !tx.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
          !tx.tags?.some((tag) => tag.toLowerCase().includes(filters.searchQuery.toLowerCase()))
        ) {
          return false;
        }

        // Category
        if (filters.categoryId !== 'all' && tx.categoryId !== filters.categoryId) {
          return false;
        }

        // Account
        if (filters.accountId !== 'all' && tx.accountId !== filters.accountId) {
          return false;
        }

        // Type
        if (filters.type !== 'all' && tx.type !== filters.type) {
          return false;
        }

        // Dates
        if (filters.dateFrom && tx.date < filters.dateFrom) return false;
        if (filters.dateTo && tx.date > filters.dateTo) return false;

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'date-desc') return b.date.localeCompare(a.date);
        if (filters.sortBy === 'date-asc') return a.date.localeCompare(b.date);
        if (filters.sortBy === 'amount-desc') return b.amount - a.amount;
        if (filters.sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, filters]);

  // Compute Overall Financial Summary
  const summary = useMemo<FinanceSummary>(() => {
    // If Google Sheet CSV data is active, use the total sum of MONTO values for Patrimonio Total & Ingresos
    if (sheetState.isSheetModeActive && sheetState.totalParsedRows > 0) {
      const totalMonto = sheetState.totalMontoSum;
      let expenses = 0;

      transactions.forEach((tx) => {
        if (tx.type === 'expense') {
          expenses += tx.amount;
        }
      });

      const netSavings = totalMonto - expenses;
      const savingsRatePercent = totalMonto > 0 ? (netSavings / totalMonto) * 100 : 0;

      return {
        totalWealth: totalMonto,
        monthlyIncome: totalMonto,
        monthlyExpenses: expenses,
        netSavings,
        savingsRatePercent: Math.max(0, savingsRatePercent),
        wealthGrowthPercent: 5.2,
        incomeVsLastMonthPercent: 12.5,
        expenseVsLastMonthPercent: -3.4,
      };
    }

    const totalWealth = accounts.reduce((acc, account) => acc + account.balance, 0);

    // Current month determination
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevYearMonth = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, '0')}`;

    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    let prevIncome = 0;
    let prevExpenses = 0;

    transactions.forEach((tx) => {
      const txMonth = tx.date.substring(0, 7);
      if (txMonth === currentYearMonth || txMonth === '2026-07') {
        if (tx.type === 'income') monthlyIncome += tx.amount;
        if (tx.type === 'expense') monthlyExpenses += tx.amount;
      } else if (txMonth === prevYearMonth || txMonth === '2026-06') {
        if (tx.type === 'income') prevIncome += tx.amount;
        if (tx.type === 'expense') prevExpenses += tx.amount;
      }
    });

    const netSavings = monthlyIncome - monthlyExpenses;
    const savingsRatePercent = monthlyIncome > 0 ? (netSavings / monthlyIncome) * 100 : 0;

    const incomeVsLastMonthPercent =
      prevIncome > 0 ? ((monthlyIncome - prevIncome) / prevIncome) * 100 : 0;
    const expenseVsLastMonthPercent =
      prevExpenses > 0 ? ((monthlyExpenses - prevExpenses) / prevExpenses) * 100 : 0;

    return {
      totalWealth,
      monthlyIncome,
      monthlyExpenses,
      netSavings,
      savingsRatePercent,
      wealthGrowthPercent: 4.8,
      incomeVsLastMonthPercent,
      expenseVsLastMonthPercent,
    };
  }, [accounts, transactions, sheetState]);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        accounts,
        budgets,
        goals,
        currency,
        selectedTab,
        filters,
        timePeriod,
        isAddTxModalOpen,
        editingTx,
        isAiPanelOpen,

        sheetState,
        syncGoogleSheet,
        toggleSheetMode,

        setCurrency,
        setSelectedTab,
        setFilters,
        setTimePeriod,
        setIsAddTxModalOpen,
        setEditingTx,
        setIsAiPanelOpen,

        addTransaction,
        updateTransaction,
        deleteTransaction,

        addAccount,
        updateAccount,
        deleteAccount,

        addCategory,
        saveBudget,

        addGoal,
        updateGoal,
        depositToGoal,

        resetToDemoData,
        exportDataJSON,
        exportTransactionsCSV,

        summary,
        filteredTransactions,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
