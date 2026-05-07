import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import api from '../src/lib/api';
import { safeStorage } from '../src/lib/storage';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  is_default: boolean;
  user_id?: string;
}

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

interface CategoryState {
  categories: Category[];
  fetchCategories: () => Promise<void>;
  addCategory: (newCategory: Omit<Category, 'id' | 'is_default'>) => Promise<void>;
  updateCategory: (id: string, updatedCategory: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reset: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: DEFAULT_CATEGORIES,

      reset: () => set({ categories: DEFAULT_CATEGORIES }),

      fetchCategories: async () => {
        try {
          const { data } = await api.get('/categories');
          // Mesclar padrões com remotas, evitando duplicatas
          const customCategories = data.filter((c: Category) => !c.is_default);
          set({ categories: [...DEFAULT_CATEGORIES, ...customCategories] });
        } catch (error) {
          console.error('Erro ao buscar categorias:', error);
        }
      },

      addCategory: async (newCategory) => {
        try {
          const { data } = await api.post('/categories', { ...newCategory, is_default: false });
          set((state) => ({
            categories: [...state.categories, data]
          }));
        } catch (error) {
          console.error('Erro ao adicionar categoria:', error);
          throw error;
        }
      },

      updateCategory: async (id, updatedCategory) => {
        try {
          // Só permite atualizar se não for padrão ou se estiver no backend
          const category = get().categories.find(c => c.id === id);
          if (category?.is_default) return;

          const { data } = await api.put(`/categories/${id}`, updatedCategory);
          set((state) => ({
            categories: state.categories.map((c) => c.id === id ? data : c)
          }));
        } catch (error) {
          console.error('Erro ao atualizar categoria:', error);
          throw error;
        }
      },

      deleteCategory: async (id) => {
        try {
          const category = get().categories.find(c => c.id === id);
          if (category?.is_default) return;

          await api.delete(`/categories/${id}`);
          set((state) => ({
            categories: state.categories.filter((c) => c.id !== id)
          }));
        } catch (error) {
          console.error('Erro ao excluir categoria:', error);
          throw error;
        }
      },
    }),
    {
      name: 'category-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
