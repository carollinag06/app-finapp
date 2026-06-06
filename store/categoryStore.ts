import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as Crypto from 'expo-crypto';
import { safeStorage } from '../src/lib/storage';

/**
 * INTERFACE: Category
 * Estrutura para categorizar receitas e despesas.
 */
export interface Category {
  id: string;
  name: string;
  icon: string;         // Nome do ícone do Ionicons
  color: string;        // Cor hexadecimal da categoria
  type: 'income' | 'expense';
  is_default: boolean;  // Se true, não pode ser editada ou excluída
  user_id?: string;
}

/**
 * CONSTANTE: Categorias Iniciais
 * Lista de categorias que o app já traz configuradas por padrão.
 */
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Alimentação', icon: 'fast-food-outline', color: '#FF453A', type: 'expense', is_default: true },
  { id: '2', name: 'Transporte', icon: 'car-outline', color: '#64D2FF', type: 'expense', is_default: true },
  { id: '3', name: 'Moradia', icon: 'home-outline', color: '#FF9F0A', type: 'expense', is_default: true },
  { id: '4', name: 'Saúde', icon: 'heart-outline', color: '#32D74B', type: 'expense', is_default: true },
  { id: '5', name: 'Lazer', icon: 'game-controller-outline', color: '#BF5AF2', type: 'expense', is_default: true },
  { id: '10', name: 'Educação', icon: 'book-outline', color: '#5E5CE6', type: 'expense', is_default: true },
  { id: '11', name: 'Outros', icon: 'ellipsis-horizontal-outline', color: '#8E8E93', type: 'expense', is_default: true },
  { id: '6', name: 'Salário', icon: 'cash-outline', color: '#30D158', type: 'income', is_default: true },
  { id: '7', name: 'Freelance', icon: 'laptop-outline', color: '#FF375F', type: 'income', is_default: true },
  { id: '8', name: 'Investimento', icon: 'trending-up-outline', color: '#0A84FF', type: 'income', is_default: true },
  { id: '9', name: 'Presente', icon: 'gift-outline', color: '#FFD60A', type: 'income', is_default: true },
];

/**
 * INTERFACE: CategoryState
 * Estado e ações para o gerenciamento de categorias.
 */
interface CategoryState {
  categories: Category[];
  addCategory: (newCategory: Omit<Category, 'id' | 'is_default'>) => Promise<void>;
  updateCategory: (id: string, updatedCategory: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reset: () => void;
}

/**
 * STORE: useCategoryStore (Zustand)
 * Gerencia a lista de categorias disponíveis no app.
 */
export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: DEFAULT_CATEGORIES,

      /**
       * AÇÃO: reset
       * Volta a lista para as categorias padrão do sistema.
       */
      reset: () => set({ categories: DEFAULT_CATEGORIES }),

      /**
       * AÇÃO: addCategory
       * Cria uma nova categoria personalizada do usuário.
       */
      addCategory: async (newCategory) => {
        const category: Category = {
          ...newCategory,
          id: Crypto.randomUUID(),
          is_default: false,
        };
        set((state) => ({
          categories: [...state.categories, category]
        }));
      },

      /**
       * AÇÃO: updateCategory
       * Atualiza os dados, mas impede alterações em categorias padrão.
       */
      updateCategory: async (id, updatedCategory) => {
        const category = get().categories.find(c => c.id === id);
        if (category?.is_default) return;

        set((state) => ({
          categories: state.categories.map((c) => 
            c.id === id ? { ...c, ...updatedCategory } : c
          )
        }));
      },

      /**
       * AÇÃO: deleteCategory
       * Remove categorias personalizadas.
       */
      deleteCategory: async (id) => {
        const category = get().categories.find(c => c.id === id);
        if (category?.is_default) return;

        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id)
        }));
      },
    }),
    {
      name: 'category-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
