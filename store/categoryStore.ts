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

const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Alimentação', icon: 'restaurant', color: '#FF9500', type: 'expense', is_default: true },
  { name: 'Transporte', icon: 'bus', color: '#007AFF', type: 'expense', is_default: true },
  { name: 'Moradia', icon: 'home', color: '#FF3B30', type: 'expense', is_default: true },
  { name: 'Saúde', icon: 'medkit', color: '#4CD964', type: 'expense', is_default: true },
  { name: 'Lazer', icon: 'game-controller', color: '#5856D6', type: 'expense', is_default: true },
  { name: 'Educação', icon: 'school', color: '#A2845E', type: 'expense', is_default: true },
  { name: 'Compras', icon: 'cart', color: '#FF2D55', type: 'expense', is_default: true },
  { name: 'Salário', icon: 'cash', color: '#34C759', type: 'income', is_default: true },
  { name: 'Freelance', icon: 'laptop', color: '#5AC8FA', type: 'income', is_default: true },
  { name: 'Presente', icon: 'gift', color: '#FFCC00', type: 'income', is_default: true },
  { name: 'Outros', icon: 'ellipsis-horizontal', color: '#8E8E93', type: 'expense', is_default: true },
  { name: 'Outros', icon: 'ellipsis-horizontal', color: '#8E8E93', type: 'income', is_default: true },
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
  categories: [],

  fetchCategories: async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return;

      // 1. Tenta buscar categorias do usuário ou globais
      let { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${user.id},is_default.eq.true`)
        .order('name');

      if (error) {
        console.error("Erro ao carregar categorias:", error);
        throw new Error(`Erro ao carregar categorias: ${error.message}`);
      }

      // 2. Se não houver NENHUMA categoria (nem padrão nem do usuário), vamos criar as padrões para este usuário
      if (data && data.length === 0) {
        const categoriesToInsert = DEFAULT_CATEGORIES.map(cat => ({
          ...cat,
          user_id: user.id,
          is_default: true // Mantemos como true para serem as categorias padrão "oficiais" do usuário
        }));

        const { data: seededData, error: seedError } = await supabase
          .from('categories')
          .insert(categoriesToInsert)
          .select();

        if (seedError) {
          console.error("Erro ao criar categorias padrão:", seedError);
        } else if (seededData) {
          data = seededData;
        }
      }

      if (data) {
        set({ categories: data });
      }
    } catch (err) {
      console.error("Erro no fetchCategories:", err);
      throw err;
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
