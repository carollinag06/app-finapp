import { differenceInBusinessDays, parseISO } from 'date-fns';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import api from '../src/lib/api';
import { safeStorage } from '../src/lib/storage';

export type InvestmentType = 'Renda fixa' | 'Ações' | 'Fundos imobiliários' | 'Criptomoedas' | 'Outros';

export interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  current_amount?: number;
  date: string;
  cdi_percentage?: number; // Porcentagem do CDI (ex: 100)
  user_id?: string;
  created_at?: string;
}

// Função utilitária para calcular o saldo atualizado em tempo real
export const calculateLiveBalance = (investment: Investment): number => {
  if (!investment.cdi_percentage || !investment.date) {
    return investment.current_amount || investment.amount;
  }

  try {
    const startDate = parseISO(investment.date);
    const today = new Date();
    
    // Se a data de início for futura, retorna o valor inicial
    if (startDate > today) return investment.amount;

    // CDI anual estimado (11.25%) e dias úteis por ano (252)
    const ANNUAL_CDI = 0.1125;
    const businessDays = differenceInBusinessDays(today, startDate);
    
    if (businessDays <= 0) return investment.amount;

    // Taxa diária composta
    const dailyRate = Math.pow(1 + ANNUAL_CDI, 1 / 252) - 1;
    const cdiFactor = investment.cdi_percentage / 100;
    
    // Cálculo de juros compostos sobre os dias úteis passados
    const currentBalance = investment.amount * Math.pow(1 + (dailyRate * cdiFactor), businessDays);
    
    return Number(currentBalance.toFixed(2));
  } catch (error) {
    console.error("Erro ao calcular saldo live:", error);
    return investment.current_amount || investment.amount;
  }
};

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
    (set) => ({
      investments: [],

      reset: () => set({ investments: [] }),

      fetchInvestments: async () => {
        try {
          const { data } = await api.get('/investments');
          set({ investments: data });
        } catch (error) {
          console.error('Erro ao buscar investimentos:', error);
        }
      },

      addInvestment: async (newInvestment) => {
        try {
          const { data } = await api.post('/investments', newInvestment);
          set((state) => ({
            investments: [data, ...state.investments]
          }));
        } catch (error) {
          console.error('Erro ao adicionar investimento:', error);
          throw error;
        }
      },

      updateInvestment: async (id, updatedInvestment) => {
        try {
          const { data } = await api.put(`/investments/${id}`, updatedInvestment);
          set((state) => ({
            investments: state.investments.map((i) => i.id === id ? data : i)
          }));
        } catch (error) {
          console.error('Erro ao atualizar investimento:', error);
          throw error;
        }
      },

      deleteInvestment: async (id) => {
        try {
          await api.delete(`/investments/${id}`);
          set((state) => ({
            investments: state.investments.filter((i) => i.id !== id)
          }));
        } catch (error) {
          console.error('Erro ao excluir investimento:', error);
          throw error;
        }
      },
    }),
    {
      name: 'investment-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
