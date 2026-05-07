import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import api from '../src/lib/api';
import { safeStorage } from '../src/lib/storage';

export interface BudgetGoal {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  icon?: string;
  color?: string;
  user_id?: string;
}

interface BudgetStore {
  budgets: BudgetGoal[];
  fetchBudgets: () => Promise<void>;
  addBudget: (budget: Omit<BudgetGoal, 'id'>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<BudgetGoal>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  reset: () => void;
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set) => ({
      budgets: [],

      reset: () => set({ budgets: [] }),

      fetchBudgets: async () => {
        try {
          const { data } = await api.get('/budgets');
          set({ budgets: data });
        } catch (error) {
          console.error('Erro ao buscar orçamentos:', error);
        }
      },

      addBudget: async (newBudget) => {
        try {
          const { data } = await api.post('/budgets', newBudget);
          set((state) => ({
            budgets: [data, ...state.budgets]
          }));
        } catch (error) {
          console.error('Erro ao adicionar orçamento:', error);
          throw error;
        }
      },

      updateBudget: async (id, updatedBudget) => {
        try {
          const { data } = await api.put(`/budgets/${id}`, updatedBudget);
          set((state) => ({
            budgets: state.budgets.map((b) => b.id === id ? data : b)
          }));
        } catch (error) {
          console.error('Erro ao atualizar orçamento:', error);
          throw error;
        }
      },

      deleteBudget: async (id) => {
        try {
          await api.delete(`/budgets/${id}`);
          set((state) => ({
            budgets: state.budgets.filter((b) => b.id !== id)
          }));
        } catch (error) {
          console.error('Erro ao excluir orçamento:', error);
          throw error;
        }
      },
    }),
    {
      name: 'budget-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);

