import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from '../src/lib/storage';
import { supabase } from '../src/lib/supabase';

export type InvestmentType = 'Renda fixa' | 'Ações' | 'Fundos imobiliários' | 'Criptomoedas' | 'Outros';

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  investedAmount: number;
  currentAmount: number;
  date: string;
  cdiPercentage?: number; // Porcentagem do CDI (ex: 100)
  user_id?: string;
}

interface InvestmentStore {
  investments: Investment[];
  fetchInvestments: () => Promise<void>;
  addInvestment: (investment: Omit<Investment, 'id'>) => Promise<void>;
  updateInvestment: (id: string, investment: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  reset: () => void;
}

export const useInvestmentStore = create<InvestmentStore>()(
  persist(
    (set, get) => ({
      investments: [],

      reset: () => set({ investments: [] }),

      fetchInvestments: async () => {
        try {
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError || !user) return;

          const { data, error } = await supabase
            .from('investments')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

          if (error) {
            console.error("Erro Supabase fetchInvestments:", error);
            return;
          }
          if (data) {
            set({ investments: data });
          }
        } catch (err) {
          console.error("Erro catch fetchInvestments:", err);
        }
      },

      addInvestment: async (newInvestment) => {
        try {
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError || !user) throw new Error("Usuário não autenticado");

          const { data, error } = await supabase
            .from('investments')
            .insert([{ ...newInvestment, user_id: user.id }])
            .select()
            .single();

          if (error) {
            console.error("Erro Supabase addInvestment:", error);
            throw new Error(`Erro ao salvar investimento: ${error.message}`);
          }
          if (data) {
            set((state) => ({
              investments: [data, ...state.investments]
            }));
          }
        } catch (err) {
          console.error("Erro catch addInvestment:", err);
          throw err;
        }
      },

      updateInvestment: async (id, updatedInvestment) => {
        try {
          const { error } = await supabase
            .from('investments')
            .update(updatedInvestment)
            .eq('id', id);

          if (error) {
            console.error("Erro Supabase updateInvestment:", error);
            throw new Error(`Erro ao atualizar investimento: ${error.message}`);
          }

          set((state) => ({
            investments: state.investments.map((i) => i.id === id ? { ...i, ...updatedInvestment } : i)
          }));
        } catch (err) {
          console.error("Erro catch updateInvestment:", err);
          throw err;
        }
      },

      deleteInvestment: async (id) => {
        try {
          const { error } = await supabase
            .from('investments')
            .delete()
            .eq('id', id);

          if (error) {
            console.error("Erro Supabase deleteInvestment:", error);
            throw new Error(`Erro ao excluir investimento: ${error.message}`);
          }

          set((state) => ({
            investments: state.investments.filter((i) => i.id !== id)
          }));
        } catch (err) {
          console.error("Erro catch deleteInvestment:", err);
          throw err;
        }
      },
    }),
    {
      name: 'investment-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
