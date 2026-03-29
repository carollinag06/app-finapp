import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase } from '../src/lib/supabase';
import { safeStorage } from '../src/lib/storage';

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color: string;
  brand: string; // ex: 'Visa', 'Mastercard'
  user_id?: string;
}

interface CardStore {
  cards: CreditCard[];
  fetchCards: () => Promise<void>;
  addCard: (card: Omit<CreditCard, 'id'>) => Promise<void>;
  updateCard: (id: string, card: Partial<CreditCard>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  reset: () => void;
}

export const useCardStore = create<CardStore>()(
  persist(
    (set) => ({
      cards: [],

      reset: () => set({ cards: [] }),

      fetchCards: async () => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return;

        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        if (data) {
          set({ cards: data });
        }
      },

      addCard: async (newCard) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("Usuário não autenticado");

        const { data, error } = await supabase
          .from('cards')
          .insert([{ ...newCard, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          set((state) => ({
            cards: [data, ...state.cards]
          }));
        }
      },

      updateCard: async (id, updatedCard) => {
        const { error } = await supabase
          .from('cards')
          .update(updatedCard)
          .eq('id', id);

        if (error) throw error;
        
        set((state) => ({
          cards: state.cards.map((c) => c.id === id ? { ...c, ...updatedCard } : c)
        }));
      },

      deleteCard: async (id) => {
        const { error } = await supabase
          .from('cards')
          .delete()
          .eq('id', id);

        if (error) throw error;

        set((state) => ({
          cards: state.cards.filter((c) => c.id !== id)
        }));
      },
    }),
    {
      name: 'card-storage',
      storage: createJSONStorage(() => safeStorage as any),
    }
  )
);

