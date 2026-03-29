import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase } from '../src/lib/supabase';
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
  cardId?: string;
  user_id?: string;
}

// 2. Definimos o que a nossa "Caixa" (Store) vai guardar e as funções que tem
interface TransactionStore {
  transactions: Transaction[];
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
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
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return;

        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;
        if (data) {
          set({ transactions: data });
        }
      },

      addTransaction: async (newTransaction) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("Usuário não autenticado");

        const { data, error } = await supabase
          .from('transactions')
          .insert([{ ...newTransaction, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          set((state) => ({
            transactions: [data, ...state.transactions]
          }));
        }
      },

      updateTransaction: async (id, updatedTransaction) => {
        const { error } = await supabase
          .from('transactions')
          .update(updatedTransaction)
          .eq('id', id);

        if (error) throw error;
        
        set((state) => ({
          transactions: state.transactions.map((t) => t.id === id ? { ...t, ...updatedTransaction } : t)
        }));
      },

      deleteTransaction: async (id) => {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id);

        if (error) throw error;

        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id)
        }));
      },
    }),
    {
      name: 'transaction-storage',
      storage: createJSONStorage(() => safeStorage as any),
    }
  )
);
