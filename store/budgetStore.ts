import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from '../src/lib/storage';
import { supabase } from '../src/lib/supabase';

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
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError || !user) return;

          const { data, error } = await supabase
            .from('budgets')
            .select('*')
            .eq('user_id', user.id);

          if (error) {
            console.error("Erro Supabase fetchBudgets:", error);
            throw new Error(`Erro ao carregar orçamentos: ${error.message}`);
          }
          if (data) {
            set({ budgets: data });
          }
        } catch (err) {
          console.error("Erro catch fetchBudgets:", err);
          throw err;
        }
      },

      addBudget: async (newBudget) => {
        try {
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError || !user) throw new Error("Usuário não autenticado");

          const { data, error } = await supabase
            .from('budgets')
            .insert([{ ...newBudget, user_id: user.id }])
            .select()
            .single();

          if (error) {
            console.error("Erro Supabase addBudget:", error);
            throw new Error(`Erro ao salvar orçamento: ${error.message}`);
          }
          if (data) {
            set((state) => ({
              budgets: [data, ...state.budgets]
            }));
          }
        } catch (err) {
          console.error("Erro catch addBudget:", err);
          throw err;
        }
      },

      updateBudget: async (id, updatedBudget) => {
        try {
          const { error } = await supabase
            .from('budgets')
            .update(updatedBudget)
            .eq('id', id);

          if (error) {
            console.error("Erro Supabase updateBudget:", error);
            throw new Error(`Erro ao atualizar orçamento: ${error.message}`);
          }

          set((state) => ({
            budgets: state.budgets.map((b) => b.id === id ? { ...b, ...updatedBudget } : b)
          }));
        } catch (err) {
          console.error("Erro catch updateBudget:", err);
          throw err;
        }
      },

      deleteBudget: async (id) => {
        try {
          const { error } = await supabase
            .from('budgets')
            .delete()
            .eq('id', id);

          if (error) {
            console.error("Erro Supabase deleteBudget:", error);
            throw new Error(`Erro ao excluir orçamento: ${error.message}`);
          }

          set((state) => ({
            budgets: state.budgets.filter((b) => b.id !== id)
          }));
        } catch (err) {
          console.error("Erro catch deleteBudget:", err);
          throw err;
        }
      },
    }),
    {
      name: 'budget-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);

