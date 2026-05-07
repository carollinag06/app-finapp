import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import api from '../src/lib/api';
import { safeStorage } from '../src/lib/storage';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
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
      token: null,
      isAuthReady: false,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        await safeStorage.setItem('auth-token', data.token);
        set({ user: data.user, token: data.token });
      },

      register: async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password });
        await safeStorage.setItem('auth-token', data.token);
        set({ user: data.user, token: data.token });
      },

      logout: async () => {
        await safeStorage.removeItem('auth-token');
        set({ user: null, token: null });
      },

      checkAuth: async () => {
        try {
          const token = await safeStorage.getItem('auth-token');
          if (!token) {
            set({ isAuthReady: true });
            return;
          }

          const { data } = await api.get('/auth/me');
          set({ user: data, token, isAuthReady: true });
        } catch (error) {
          await safeStorage.removeItem('auth-token');
          set({ user: null, token: null, isAuthReady: true });
        }
      },

      updateProfile: async (name) => {
        const { data } = await api.put('/auth/profile', { name });
        set({ user: data });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
