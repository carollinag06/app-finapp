import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
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
        // Agora os dados já estão no cache (persistência do Zustand)
      },

      addCard: async (newCard) => {
        const card: CreditCard = {
          ...newCard,
          id: Math.random().toString(36).substring(2, 9),
        };
        set((state) => ({
          cards: [card, ...state.cards]
        }));
      },

      updateCard: async (id, updatedCard) => {
        set((state) => ({
          cards: state.cards.map((c) => 
            c.id === id ? { ...c, ...updatedCard } : c
          )
        }));
      },

      deleteCard: async (id) => {
        set((state) => ({
          cards: state.cards.filter((c) => c.id !== id)
        }));
      },
    }),
    {
      name: 'card-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);

