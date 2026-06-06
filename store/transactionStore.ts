import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as Crypto from 'expo-crypto';
import { safeStorage } from '../src/lib/storage';

/**
 * INTERFACE: Transaction
 * Define a estrutura completa de uma movimentação financeira (Entrada ou Saída).
 */
export interface Transaction {
  id: string;
  description: string;
  value: number;
  type: 'expense' | 'income';      // Define se é uma saída (despesa) ou entrada (receita)
  category: string;                // Nome da categoria associada
  date: string;                    // Data em formato ISO ou DD/MM/YYYY
  paymentMethod?: 'credit' | 'debit' | 'pix';
  recurrence?: 'fixed' | 'variable' | 'installment';
  installmentsCount?: number;      // Número total de parcelas (se houver)
  installmentNumber?: number;      // Número da parcela atual (ex: 1 de 12)
  installmentGroupId?: string;     // ID que agrupa todas as parcelas de uma mesma compra
  cardId?: string;                 // ID do cartão utilizado (se for crédito)
  user_id?: string;
}

/**
 * INTERFACE: TransactionStore
 * Estado e ações para o gerenciamento de todas as transações do app.
 */
interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  addTransactions: (transactions: Omit<Transaction, 'id'>[]) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteTransactionsByGroupId: (groupId: string) => Promise<void>;
  setTransactions: (transactions: Transaction[]) => void;
  reset: () => void;
}

/**
 * STORE: useTransactionStore (Zustand)
 * Centraliza o histórico financeiro do usuário com persistência automática.
 */
export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],

      /**
       * AÇÃO: setTransactions
       * Atualiza a lista completa (usado para migrações ou cargas em lote).
       */
      setTransactions: (transactions) => set({ transactions }),

      /**
       * AÇÃO: reset
       * Limpa todo o histórico de transações.
       */
      reset: () => set({ transactions: [] }),

      /**
       * AÇÃO: addTransaction
       * Adiciona um novo lançamento único.
       */
      addTransaction: async (newTransaction) => {
        const transaction: Transaction = {
          ...newTransaction,
          id: Crypto.randomUUID(),
        };
        set((state) => ({
          transactions: [transaction, ...state.transactions] // Adiciona no início da lista
        }));
      },

      /**
       * AÇÃO: addTransactions
       * Adiciona múltiplas transações de uma vez (usado no parcelamento).
       */
      addTransactions: async (newTransactions) => {
        const addedTransactions = newTransactions.map(t => ({
          ...t,
          id: Crypto.randomUUID(),
        }));
        
        set((state) => ({
          transactions: [...addedTransactions, ...state.transactions]
        }));
      },

      /**
       * AÇÃO: updateTransaction
       * Edita uma transação existente.
       */
      updateTransaction: async (id, updatedTransaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) => 
            t.id === id ? { ...t, ...updatedTransaction } : t
          )
        }));
      },

      /**
       * AÇÃO: deleteTransaction
       * Exclui um único lançamento.
       */
      deleteTransaction: async (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id)
        }));
      },

      /**
       * AÇÃO: deleteTransactionsByGroupId
       * Exclui todas as parcelas de um grupo de uma só vez.
       */
      deleteTransactionsByGroupId: async (groupId) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.installmentGroupId !== groupId)
        }));
      },
    }),
    { 
      name: 'transaction-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
