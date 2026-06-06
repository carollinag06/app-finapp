import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as Crypto from 'expo-crypto';
import { safeStorage } from '../src/lib/storage';

/**
 * INTERFACE: CreditCard
 * Define os atributos de um cartão de crédito cadastrado pelo usuário.
 */
export interface CreditCard {
  id: string;           // Identificador único
  name: string;         // Apelido do cartão (ex: "Meu Inter")
  credit_limit: number; // Limite total definido
  closing_day: number;  // Dia de fechamento da fatura
  due_day: number;      // Dia de vencimento da fatura
  color: string;        // Cor hexadecimal para a UI
  brand: string;        // Bandeira (ex: 'Visa', 'Mastercard')
  user_id?: string;     // ID do usuário dono do cartão (opcional)
}

/**
 * INTERFACE: CardStore
 * Estado global para gerenciamento dos cartões de crédito.
 */
interface CardStore {
  cards: CreditCard[];
  paidInvoices: string[]; // Formato: "cardId-month-year"
  addCard: (card: Omit<CreditCard, 'id'>) => Promise<void>;
  updateCard: (id: string, card: Partial<CreditCard>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  markInvoiceAsPaid: (cardId: string, month: number, year: number) => void;
  isInvoicePaid: (cardId: string, month: number, year: number) => boolean;
  reset: () => void; // Limpa todos os cartões (usado no logout)
}

/**
 * STORE: useCardStore (Zustand)
 * Armazena e manipula a lista de cartões de crédito com persistência local.
 */
export const useCardStore = create<CardStore>()(
  persist(
    (set, get) => ({
      cards: [],
      paidInvoices: [],

      /**
       * AÇÃO: reset
       * Retorna o estado da lista para vazio.
       */
      reset: () => set({ cards: [], paidInvoices: [] }),

      /**
       * AÇÃO: markInvoiceAsPaid
       * Registra que uma fatura foi paga.
       */
      markInvoiceAsPaid: (cardId, month, year) => {
        const key = `${cardId}-${month}-${year}`;
        if (!get().paidInvoices.includes(key)) {
          set((state) => ({
            paidInvoices: [...state.paidInvoices, key]
          }));
        }
      },

      /**
       * AÇÃO: isInvoicePaid
       * Verifica se uma fatura específica já foi paga.
       */
      isInvoicePaid: (cardId, month, year) => {
        const key = `${cardId}-${month}-${year}`;
        return get().paidInvoices.includes(key);
      },

      /**
       * AÇÃO: addCard
       * Gera um novo ID e adiciona o cartão no topo da lista.
       */
      addCard: async (newCard) => {
        const card: CreditCard = {
          ...newCard,
          id: Crypto.randomUUID(),
        };
        set((state) => ({
          cards: [card, ...state.cards]
        }));
      },

      /**
       * AÇÃO: updateCard
       * Localiza o cartão pelo ID e mescla as novas informações.
       */
      updateCard: async (id, updatedCard) => {
        set((state) => ({
          cards: state.cards.map((c) => 
            c.id === id ? { ...c, ...updatedCard } : c
          )
        }));
      },

      /**
       * AÇÃO: deleteCard
       * Remove o cartão da lista filtrando pelo ID.
       */
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
