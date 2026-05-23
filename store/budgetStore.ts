import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
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
        // Agora os dados já estão no cache (persistência do Zustand)
      },

      addBudget: async (newBudget) => {
        const budget: BudgetGoal = {
          ...newBudget,
          id: Math.random().toString(36).substring(2, 9),
        };
        set((state) => ({
          budgets: [budget, ...state.budgets]
        }));
      },

      updateBudget: async (id, updatedBudget) => {
        set((state) => ({
          budgets: state.budgets.map((b) => 
            b.id === id ? { ...b, ...updatedBudget } : b
          )
        }));
      },

      deleteBudget: async (id) => {
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id)
        }));
      },
    }),
    {
      name: 'budget-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);

