import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface BudgetGoal {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  icon?: string;
  color?: string;
}

interface BudgetStore {
  budgets: BudgetGoal[];
  addBudget: (budget: Omit<BudgetGoal, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<BudgetGoal>) => void;
  deleteBudget: (id: string) => void;
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set) => ({
      budgets: [
        { id: '1', category: 'Alimentação', amount: 800, period: 'monthly', color: '#FF453A', icon: 'fast-food-outline' },
        { id: '2', category: 'Lazer', amount: 300, period: 'monthly', color: '#BF5AF2', icon: 'game-controller-outline' },
        { id: '3', category: 'Transporte', amount: 400, period: 'monthly', color: '#64D2FF', icon: 'car-outline' },
      ],

      addBudget: (newBudget) => set((state) => ({
        budgets: [
          { ...newBudget, id: Math.random().toString(36).substring(2, 9) },
          ...state.budgets
        ]
      })),

      updateBudget: (id, updatedBudget) => set((state) => ({
        budgets: state.budgets.map((b) => b.id === id ? { ...b, ...updatedBudget } : b)
      })),

      deleteBudget: (id) => set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== id)
      })),
    }),
    {
      name: 'budget-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
