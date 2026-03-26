import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// 1. Definimos o formato da nossa Transação
export interface Transaction {
  id: string;
  description: string;
  value: number;
  type: 'expense' | 'income'; // Despesa ou Receita
  category: string;
  date: string;
  paymentMethod?: 'credit' | 'debit' | 'pix';
  recurrence?: 'fixed' | 'variable' | 'installment';
}

// 2. Definimos o que a nossa "Caixa" (Store) vai guardar e as funções que tem
interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
}

// 3. Criamos o Store com o Zustand e persistimos os dados com AsyncStorage
export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      // Começamos com uma lista vazia de transações (ou pode colocar os seus mocks aqui)
      transactions: [],

      // Função para adicionar uma nova transação à lista
      addTransaction: (newTransaction) => set((state) => ({
        transactions: [
          // Geramos um ID aleatório simples e colocamos a nova transação no topo da lista
          { ...newTransaction, id: Math.random().toString(36).substring(2, 9) },
          ...state.transactions
        ]
      })),

      // Função para deletar uma transação
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id)
      })),
    }),
    {
      name: 'transaction-storage', // Nome da chave no AsyncStorage
      storage: createJSONStorage(() => AsyncStorage), // Usamos o AsyncStorage como storage
    }
  )
);