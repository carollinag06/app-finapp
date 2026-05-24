import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as Crypto from 'expo-crypto';
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

      addBudget: async (newBudget) => {
        const budget: BudgetGoal = {
          ...newBudget,
          id: Crypto.randomUUID(),
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

