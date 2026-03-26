import { create } from 'zustand';
// 1. Importamos as ferramentas de persistência
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 2. A sua interface com os campos novos (mantida intacta!)
export interface Transaction {
  id: string;
  description: string;
  value: number;
  type: 'expense' | 'income'; 
  category: string;
  date: string;
  paymentMethod?: 'credit' | 'debit' | 'pix';
  recurrence?: 'fixed' | 'variable' | 'installment';
}

// 3. A sua interface do Store (mantida intacta!)
interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
}

// 4. Aqui está a mágica: envolvemos o seu código com o 'persist'
export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      // Começamos com uma lista vazia
      transactions: [],

      // Sua função de adicionar
      addTransaction: (newTransaction) => set((state) => ({
        transactions: [
          { ...newTransaction, id: Math.random().toString(36).substring(2, 9) },
          ...state.transactions
        ]
      })),

      // Sua função de deletar
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id)
      })),
    }),
    {
      // Configurações do AsyncStorage
      name: 'financas-storage', // Nome do arquivo oculto no celular
      storage: createJSONStorage(() => AsyncStorage), // Diz para usar o HD do celular
    }
  )
);