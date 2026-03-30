import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from '../src/lib/storage';
import { supabase } from '../src/lib/supabase';

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
        try {
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError || !user) return;

          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

          if (error) {
            console.error("Erro Supabase fetchTransactions:", error);
            throw new Error(`Erro ao carregar transações: ${error.message}`);
          }
          if (data) {
            set({ transactions: data });
          }
        } catch (err: any) {
          console.error("Erro catch fetchTransactions:", err);
          throw err;
        }
      },

      addTransaction: async (newTransaction) => {
        try {
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError || !user) throw new Error("Usuário não autenticado");

          const { data, error } = await supabase
            .from('transactions')
            .insert([{ ...newTransaction, user_id: user.id }])
            .select()
            .single();

          if (error) {
            console.error("Erro Supabase addTransaction:", error);
            throw new Error(`Erro ao salvar transação: ${error.message}`);
          }
          if (data) {
            set((state) => ({
              transactions: [data, ...state.transactions]
            }));
          }
        } catch (err: any) {
          console.error("Erro catch addTransaction:", err);
          throw err;
        }
      },

      updateTransaction: async (id, updatedTransaction) => {
        try {
          const { error } = await supabase
            .from('transactions')
            .update(updatedTransaction)
            .eq('id', id);

          if (error) {
            console.error("Erro Supabase updateTransaction:", error);
            throw new Error(`Erro ao atualizar transação: ${error.message}`);
          }

          set((state) => ({
            transactions: state.transactions.map((t) => t.id === id ? { ...t, ...updatedTransaction } : t)
          }));
        } catch (err: any) {
          console.error("Erro catch updateTransaction:", err);
          throw err;
        }
      },

      deleteTransaction: async (id) => {
        try {
          const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

          if (error) {
            console.error("Erro Supabase deleteTransaction:", error);
            throw new Error(`Erro ao excluir transação: ${error.message}`);
          }

          set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id)
          }));
        } catch (err: any) {
          console.error("Erro catch deleteTransaction:", err);
          throw err;
        }
      },
    }),
    {
      name: 'transaction-storage',
      storage: createJSONStorage(() => safeStorage as any),
    }
  )
);
