import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from '../src/lib/storage';

interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}

interface AuthStore {
  user: User | null;
  users: User[]; // Lista local de usuários
  isAuthReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      users: [],
      isAuthReady: false,

      login: async (email, password) => {
        const user = get().users.find(u => u.email === email && u.password === password);
        if (!user) {
          throw new Error('E-mail ou senha inválidos');
        }
        set({ user });
      },

      register: async (name, email, password) => {
        const existingUser = get().users.find(u => u.email === email);
        if (existingUser) {
          throw new Error('E-mail já cadastrado');
        }

        const newUser: User = {
          id: Math.random().toString(36).substring(2, 9),
          name,
          email,
          password
        };

        set({ 
          users: [...get().users, newUser],
          user: newUser
        });
      },

      logout: async () => {
        set({ user: null });
      },

      checkAuth: async () => {
        set({ isAuthReady: true });
      },

      updateProfile: async (name) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedUser = { ...currentUser, name };
        const updatedUsers = get().users.map(u => u.id === currentUser.id ? updatedUser : u);

        set({ 
          user: updatedUser,
          users: updatedUsers
        });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
