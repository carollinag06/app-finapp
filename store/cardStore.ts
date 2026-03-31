import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from '../src/lib/storage';
import { supabase } from '../src/lib/supabase';

export interface CreditCard {
  id: string;
  name: string;
  credit_limit: number;
  closing_day: number;
  due_day: number;
  color: string;
  brand: string; // ex: 'Visa', 'Mastercard'
  user_id?: string;
}

interface CardStore {
  cards: CreditCard[];
  paidInvoices: string[]; // Formato: 'cardId-month-year'
  fetchCards: () => Promise<void>;
  addCard: (card: Omit<CreditCard, 'id'>) => Promise<void>;
  updateCard: (id: string, card: Partial<CreditCard>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  markInvoiceAsPaid: (cardId: string, month: number, year: number) => void;
  isInvoicePaid: (cardId: string, month: number, year: number) => boolean;
  reset: () => void;
}

export const useCardStore = create<CardStore>()(
  persist(
    (set, get) => ({
      cards: [],
      paidInvoices: [],

      reset: () => set({ cards: [], paidInvoices: [] }),

      markInvoiceAsPaid: (cardId, month, year) => {
        const id = `${cardId}-${month}-${year}`;
        set((state) => ({
          paidInvoices: [...state.paidInvoices, id]
        }));
      },

      isInvoicePaid: (cardId, month, year) => {
        const id = `${cardId}-${month}-${year}`;
        return get().paidInvoices.includes(id);
      },

      fetchCards: async () => {
        try {
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError || !user) return;

          const { data, error } = await supabase
            .from('cards')
            .select('*')
            .eq('user_id', user.id);

          if (error) {
            console.error("Erro Supabase fetchCards:", error);
            throw new Error(`Erro ao carregar cartões: ${error.message}`);
          }
          if (data) {
            set({ cards: data });
          }
        } catch (err) {
          console.error("Erro catch fetchCards:", err);
          throw err;
        }
      },

      addCard: async (newCard) => {
        try {
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError || !user) throw new Error("Usuário não autenticado");

          const { data, error } = await supabase
            .from('cards')
            .insert([{ ...newCard, user_id: user.id }])
            .select()
            .single();

          if (error) {
            console.error("Erro Supabase addCard:", error);
            throw new Error(`Erro ao salvar cartão: ${error.message}`);
          }

          if (data) {
            set((state) => ({
              cards: [data, ...state.cards]
            }));
          }
        } catch (err) {
          console.error("Erro catch addCard:", err);
          throw err;
        }
      },

      updateCard: async (id, updatedCard) => {
        try {
          const { error } = await supabase
            .from('cards')
            .update(updatedCard)
            .eq('id', id);

          if (error) {
            console.error("Erro Supabase updateCard:", error);
            throw new Error(`Erro ao atualizar cartão: ${error.message}`);
          }

          set((state) => ({
            cards: state.cards.map((c) => c.id === id ? { ...c, ...updatedCard } : c)
          }));
        } catch (err) {
          console.error("Erro catch updateCard:", err);
          throw err;
        }
      },

      deleteCard: async (id) => {
        try {
          const { error } = await supabase
            .from('cards')
            .delete()
            .eq('id', id);

          if (error) {
            console.error("Erro Supabase deleteCard:", error);
            throw new Error(`Erro ao excluir cartão: ${error.message}`);
          }

          set((state) => ({
            cards: state.cards.filter((c) => c.id !== id)
          }));
        } catch (err) {
          console.error("Erro catch deleteCard:", err);
          throw err;
        }
      },
    }),
    {
      name: 'card-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);

