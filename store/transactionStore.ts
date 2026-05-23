import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
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
  fetchTransactions: () => Promise<void>;
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

      fetchTransactions: async () => {
        // Agora os dados já estão no cache (persistência do Zustand)
      },

      addTransaction: async (newTransaction) => {
        const transaction: Transaction = {
          ...newTransaction,
          id: Math.random().toString(36).substring(2, 9),
        };
        set((state) => ({
          transactions: [transaction, ...state.transactions]
        }));
      },

      addTransactions: async (newTransactions) => {
        const addedTransactions = newTransactions.map(t => ({
          ...t,
          id: Math.random().toString(36).substring(2, 9),
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
