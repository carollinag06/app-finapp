import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as Crypto from 'expo-crypto';
import { safeStorage } from '../src/lib/storage';

// 1. Definimos o formato da nossa Transação
export interface Transaction {
  id: string;
  description: string;
  value: number;
  type: 'expense' | 'income'; // Despesa ou Receita
  category: string;
  date: string;
  paymentMethod?: 'credit' | 'debit' | 'pix';
  recurrence?: 'fixed' | 'variable' | 'installment';
  installmentsCount?: number;
  installmentNumber?: number;
  installmentGroupId?: string;
  cardId?: string;
  user_id?: string;
}

// 2. Definimos o que a nossa "Caixa" (Store) vai guardar e as funções que tem
interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  addTransactions: (transactions: Omit<Transaction, 'id'>[]) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteTransactionsByGroupId: (groupId: string) => Promise<void>;
  setTransactions: (transactions: Transaction[]) => void;
  reset: () => void;
}

// 3. Criamos o Store com o Zustand e persistimos os dados com AsyncStorage
export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],

      setTransactions: (transactions) => set({ transactions }),

      reset: () => set({ transactions: [] }),

      addTransaction: async (newTransaction) => {
        const transaction: Transaction = {
          ...newTransaction,
          id: Crypto.randomUUID(),
        };
        set((state) => ({
          transactions: [transaction, ...state.transactions]
        }));
      },

      addTransactions: async (newTransactions) => {
        const addedTransactions = newTransactions.map(t => ({
          ...t,
          id: Crypto.randomUUID(),
        }));
        
        set((state) => ({
          transactions: [...addedTransactions, ...state.transactions]
        }));
      },

      updateTransaction: async (id, updatedTransaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) => 
            t.id === id ? { ...t, ...updatedTransaction } : t
          )
        }));
      },

      deleteTransaction: async (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id)
        }));
      },

      deleteTransactionsByGroupId: async (groupId) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.installmentGroupId !== groupId)
        }));
      },
    }),
    { 
      name: 'transaction-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
