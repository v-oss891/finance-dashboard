import { useState, useCallback, createContext, useContext } from "react";

export type TransactionType = "income" | "expense";
export type Role = "admin" | "viewer";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
}

const generateId = () => Math.random().toString(36).slice(2, 10);

const initialTransactions: Transaction[] = [
  { id: generateId(), date: "2026-04-01", description: "Salary Deposit", amount: 5800, category: "Salary", type: "income" },
  { id: generateId(), date: "2026-04-02", description: "Grocery Shopping", amount: 134.50, category: "Food", type: "expense" },
  { id: generateId(), date: "2026-04-03", description: "Netflix Subscription", amount: 17.99, category: "Entertainment", type: "expense" },
  { id: generateId(), date: "2026-04-03", description: "Freelance Project", amount: 1200, category: "Freelance", type: "income" },
  { id: generateId(), date: "2026-04-04", description: "Electric Bill", amount: 89.20, category: "Utilities", type: "expense" },
  { id: generateId(), date: "2026-04-05", description: "Coffee Shop", amount: 12.40, category: "Food", type: "expense" },
  { id: generateId(), date: "2026-04-06", description: "Gym Membership", amount: 49.99, category: "Health", type: "expense" },
  { id: generateId(), date: "2026-04-07", description: "Consulting Income", amount: 850, category: "Freelance", type: "income" },
  { id: generateId(), date: "2026-04-08", description: "Amazon Purchase", amount: 67.30, category: "Shopping", type: "expense" },
  { id: generateId(), date: "2026-04-09", description: "Restaurant Dinner", amount: 95.00, category: "Food", type: "expense" },
  { id: generateId(), date: "2026-04-10", description: "Spotify Premium", amount: 10.99, category: "Entertainment", type: "expense" },
  { id: generateId(), date: "2026-04-11", description: "Internet Bill", amount: 59.99, category: "Utilities", type: "expense" },
  { id: generateId(), date: "2026-04-12", description: "Bonus Payment", amount: 600, category: "Salary", type: "income" },
  { id: generateId(), date: "2026-04-13", description: "Pharmacy", amount: 34.75, category: "Health", type: "expense" },
  { id: generateId(), date: "2026-04-14", description: "Gas Station", amount: 58.00, category: "Transport", type: "expense" },
  { id: generateId(), date: "2026-04-15", description: "Online Course", amount: 199, category: "Education", type: "expense" },
  { id: generateId(), date: "2026-04-16", description: "Dividend Income", amount: 320, category: "Investment", type: "income" },
  { id: generateId(), date: "2026-04-17", description: "Clothing Store", amount: 145.00, category: "Shopping", type: "expense" },
  { id: generateId(), date: "2026-04-18", description: "Taxi Ride", amount: 22.50, category: "Transport", type: "expense" },
  { id: generateId(), date: "2026-04-19", description: "Movie Tickets", amount: 38.00, category: "Entertainment", type: "expense" },
  // Previous month March 2026
  { id: generateId(), date: "2026-03-01", description: "Salary Deposit", amount: 5800, category: "Salary", type: "income" },
  { id: generateId(), date: "2026-03-03", description: "Grocery Shopping", amount: 121.00, category: "Food", type: "expense" },
  { id: generateId(), date: "2026-03-05", description: "Netflix Subscription", amount: 17.99, category: "Entertainment", type: "expense" },
  { id: generateId(), date: "2026-03-07", description: "Freelance Project", amount: 900, category: "Freelance", type: "income" },
  { id: generateId(), date: "2026-03-09", description: "Electric Bill", amount: 102.30, category: "Utilities", type: "expense" },
  { id: generateId(), date: "2026-03-12", description: "Restaurant", amount: 78.00, category: "Food", type: "expense" },
  { id: generateId(), date: "2026-03-14", description: "Gym Membership", amount: 49.99, category: "Health", type: "expense" },
  { id: generateId(), date: "2026-03-16", description: "Gas Station", amount: 61.00, category: "Transport", type: "expense" },
  { id: generateId(), date: "2026-03-18", description: "Amazon Purchase", amount: 90.00, category: "Shopping", type: "expense" },
  { id: generateId(), date: "2026-03-20", description: "Internet Bill", amount: 59.99, category: "Utilities", type: "expense" },
  { id: generateId(), date: "2026-03-22", description: "Dividend Income", amount: 280, category: "Investment", type: "income" },
  { id: generateId(), date: "2026-03-25", description: "Coffee Shop", amount: 9.80, category: "Food", type: "expense" },
  { id: generateId(), date: "2026-03-28", description: "Pharmacy", amount: 28.50, category: "Health", type: "expense" },
  // Feb 2026
  { id: generateId(), date: "2026-02-01", description: "Salary Deposit", amount: 5800, category: "Salary", type: "income" },
  { id: generateId(), date: "2026-02-03", description: "Grocery Shopping", amount: 109.50, category: "Food", type: "expense" },
  { id: generateId(), date: "2026-02-05", description: "Netflix Subscription", amount: 17.99, category: "Entertainment", type: "expense" },
  { id: generateId(), date: "2026-02-08", description: "Freelance Project", amount: 1500, category: "Freelance", type: "income" },
  { id: generateId(), date: "2026-02-10", description: "Electric Bill", amount: 118.40, category: "Utilities", type: "expense" },
  { id: generateId(), date: "2026-02-14", description: "Valentine Dinner", amount: 145.00, category: "Food", type: "expense" },
  { id: generateId(), date: "2026-02-16", description: "Gym Membership", amount: 49.99, category: "Health", type: "expense" },
  { id: generateId(), date: "2026-02-20", description: "Internet Bill", amount: 59.99, category: "Utilities", type: "expense" },
  { id: generateId(), date: "2026-02-22", description: "Dividend Income", amount: 260, category: "Investment", type: "income" },
  // Jan 2026
  { id: generateId(), date: "2026-01-01", description: "Salary Deposit", amount: 5800, category: "Salary", type: "income" },
  { id: generateId(), date: "2026-01-05", description: "Grocery Shopping", amount: 130.00, category: "Food", type: "expense" },
  { id: generateId(), date: "2026-01-08", description: "Freelance Project", amount: 700, category: "Freelance", type: "income" },
  { id: generateId(), date: "2026-01-10", description: "Electric Bill", amount: 130.00, category: "Utilities", type: "expense" },
  { id: generateId(), date: "2026-01-15", description: "Gym Membership", amount: 49.99, category: "Health", type: "expense" },
  { id: generateId(), date: "2026-01-20", description: "Amazon Purchase", amount: 210.00, category: "Shopping", type: "expense" },
  { id: generateId(), date: "2026-01-25", description: "Dividend Income", amount: 300, category: "Investment", type: "income" },
];

export const CATEGORIES = [
  "Salary", "Freelance", "Investment", "Food", "Entertainment",
  "Utilities", "Health", "Transport", "Shopping", "Education", "Other"
];

export interface FinanceState {
  transactions: Transaction[];
  role: Role;
  darkMode: boolean;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, tx: Partial<Omit<Transaction, "id">>) => void;
  deleteTransaction: (id: string) => void;
  setRole: (role: Role) => void;
  toggleDarkMode: () => void;
}

import React from "react";

const FinanceContext = createContext<FinanceState | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem("finance-transactions");
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [role, setRoleState] = useState<Role>(() => {
    return (localStorage.getItem("finance-role") as Role) || "admin";
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("finance-dark");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const saveTransactions = useCallback((txs: Transaction[]) => {
    setTransactions(txs);
    localStorage.setItem("finance-transactions", JSON.stringify(txs));
  }, []);

  const addTransaction = useCallback((tx: Omit<Transaction, "id">) => {
    const newTx: Transaction = { ...tx, id: generateId() };
    saveTransactions([newTx, ...transactions]);
  }, [transactions, saveTransactions]);

  const updateTransaction = useCallback((id: string, tx: Partial<Omit<Transaction, "id">>) => {
    saveTransactions(transactions.map(t => t.id === id ? { ...t, ...tx } : t));
  }, [transactions, saveTransactions]);

  const deleteTransaction = useCallback((id: string) => {
    saveTransactions(transactions.filter(t => t.id !== id));
  }, [transactions, saveTransactions]);

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    localStorage.setItem("finance-role", r);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("finance-dark", String(next));
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  }, []);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return React.createElement(FinanceContext.Provider, {
    value: {
      transactions, role, darkMode,
      addTransaction, updateTransaction, deleteTransaction,
      setRole, toggleDarkMode
    }
  }, children);
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
}
