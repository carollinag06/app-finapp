import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import api from '../src/lib/api';
import { safeStorage } from '../src/lib/storage';

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
          const { data } = await api.get('/cards');
          set({ cards: data });
        } catch (error) {
          console.error('Erro ao buscar cartões:', error);
        }
      },

      addCard: async (newCard) => {
        try {
          const { data } = await api.post('/cards', newCard);
          set((state) => ({
            cards: [data, ...state.cards]
          }));
        } catch (error) {
          console.error('Erro ao adicionar cartão:', error);
          throw error;
        }
      },

      updateCard: async (id, updatedCard) => {
        try {
          const { data } = await api.put(`/cards/${id}`, updatedCard);
          set((state) => ({
            cards: state.cards.map((c) => c.id === id ? data : c)
          }));
        } catch (error) {
          console.error('Erro ao atualizar cartão:', error);
          throw error;
        }
      },

      deleteCard: async (id) => {
        try {
          await api.delete(`/cards/${id}`);
          set((state) => ({
            cards: state.cards.filter((c) => c.id !== id)
          }));
        } catch (error) {
          console.error('Erro ao excluir cartão:', error);
          throw error;
        }
      },
    }),
    {
      name: 'card-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);

