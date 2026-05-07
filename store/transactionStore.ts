import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import api from '../src/lib/api';
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
        try {
          const { data } = await api.get('/transactions');
          set({ transactions: data });
        } catch (error) {
          console.error('Erro ao buscar transações:', error);
        }
      },

      addTransaction: async (newTransaction) => {
        try {
          const { data } = await api.post('/transactions', newTransaction);
          set((state) => ({
            transactions: [data, ...state.transactions]
          }));
        } catch (error) {
          console.error('Erro ao adicionar transação:', error);
          throw error;
        }
      },

      addTransactions: async (newTransactions) => {
        try {
          // No backend genérico não temos bulk create exposto diretamente via /transactions
          // Poderíamos adicionar ou fazer um loop (menos eficiente, mas resolve por agora)
          const promises = newTransactions.map(t => api.post('/transactions', t));
          const results = await Promise.all(promises);
          const addedTransactions = results.map(r => r.data);
          
          set((state) => ({
            transactions: [...addedTransactions, ...state.transactions]
          }));
        } catch (error) {
          console.error('Erro ao adicionar múltiplas transações:', error);
          throw error;
        }
      },

      updateTransaction: async (id, updatedTransaction) => {
        try {
          const { data } = await api.put(`/transactions/${id}`, updatedTransaction);
          set((state) => ({
            transactions: state.transactions.map((t) => t.id === id ? data : t)
          }));
        } catch (error) {
          console.error('Erro ao atualizar transação:', error);
          throw error;
        }
      },

      deleteTransaction: async (id) => {
        try {
          await api.delete(`/transactions/${id}`);
          set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id)
          }));
        } catch (error) {
          console.error('Erro ao excluir transação:', error);
          throw error;
        }
      },

      deleteTransactionsByGroupId: async (groupId) => {
        try {
          // No backend genérico não temos delete by group id
          // Vamos buscar as transações desse grupo e deletar uma a uma
          const transactionsToDelete = get().transactions.filter(t => t.installmentGroupId === groupId);
          await Promise.all(transactionsToDelete.map(t => api.delete(`/transactions/${t.id}`)));
          
          set((state) => ({
            transactions: state.transactions.filter((t) => t.installmentGroupId !== groupId)
          }));
        } catch (error) {
          console.error('Erro ao excluir grupo de transações:', error);
          throw error;
        }
      },
    }),
    { 
      name: 'transaction-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
