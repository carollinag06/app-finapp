import { create } from 'zustand';
import { supabase } from '../src/lib/supabase';

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
  resetCategories: () => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: DEFAULT_CATEGORIES,

  fetchCategories: async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        // Se não houver usuário, garantimos que pelo menos as padrões apareçam
        set({ categories: DEFAULT_CATEGORIES });
        return;
      }

      // 1. Tenta buscar categorias do usuário ou globais
      let query = supabase
        .from('categories')
        .select('*');

      // Tenta usar a coluna is_default se ela existir, senão busca apenas por user_id
      let { data, error } = await query
        .or(`user_id.eq.${user.id},is_default.eq.true`)
        .order('name');

      if (error) {
        console.warn("Erro ao carregar categorias com is_default, tentando apenas user_id:", error.message);
        // Fallback: busca apenas categorias do usuário
        const { data: userData, error: userError } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id)
          .order('name');

        if (userError) {
          console.error("Erro crítico ao carregar categorias do usuário:", userError);
          // Se falhou tudo, mantém as padrões
          set({ categories: DEFAULT_CATEGORIES });
          return;
        }
        data = userData;
      }

      // 2. Se houver categorias no banco, mesclamos com as padrões (evitando duplicatas por nome)
      if (data && data.length > 0) {
        const dbCategoryNames = new Set(data.map(c => c.name));
        const missingDefaults = DEFAULT_CATEGORIES.filter(c => !dbCategoryNames.has(c.name));
        set({ categories: [...data, ...missingDefaults] });
      } else {
        // Se não houver nada no banco, usa as padrões
        set({ categories: DEFAULT_CATEGORIES });
      }
    } catch (err) {
      console.error("Erro catch fetchCategories:", err);
      set({ categories: DEFAULT_CATEGORIES });
    }
  },

  addCategory: async (newCategory) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...newCategory, user_id: user.id, is_default: false }])
        .select();

      if (error) {
        console.error("Erro ao adicionar categoria:", error);
        throw new Error(`Erro ao salvar categoria: ${error.message}`);
      }
      if (data && data[0]) {
        set((state) => ({
          categories: [...state.categories, data[0]]
        }));
      }
    } catch (err) {
      console.error("Erro no addCategory:", err);
      throw err;
    }
  },

  updateCategory: async (id, updatedCategory) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(updatedCategory)
        .eq('id', id);

      if (error) {
        console.error("Erro ao atualizar categoria:", error);
        throw new Error(`Erro ao atualizar categoria: ${error.message}`);
      }

      set((state) => ({
        categories: state.categories.map((c) => c.id === id ? { ...c, ...updatedCategory } : c)
      }));
    } catch (err) {
      console.error("Erro no updateCategory:", err);
      throw err;
    }
  },

  deleteCategory: async (id) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Erro ao excluir categoria:", error);
        throw new Error(`Erro ao excluir categoria: ${error.message}`);
      }

      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id)
      }));
    } catch (err) {
      console.error("Erro no deleteCategory:", err);
      throw err;
    }
  },

  resetCategories: () => set({ categories: [] }),
}));
