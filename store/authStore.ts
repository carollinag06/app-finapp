import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as Crypto from 'expo-crypto';
import { safeStorage } from '../src/lib/storage';

/**
 * INTERFACE: User
 * Define a estrutura de dados de um usuário no sistema.
 */
interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Senha é opcional no objeto retornado para a UI por segurança
}

/**
 * INTERFACE: AuthStore
 * Define o estado e as ações disponíveis para o gerenciamento de autenticação.
 */
interface AuthStore {
  user: User | null;         // Usuário logado no momento
  users: User[];            // Simulação de banco de dados local com todos os usuários cadastrados
  isAuthReady: boolean;     // Indica se a verificação inicial de login terminou
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
}

/**
 * STORE: useAuthStore (Zustand)
 * Gerencia o ciclo de vida da autenticação do usuário.
 * Utiliza o middleware 'persist' para salvar os dados no AsyncStorage.
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      users: [],
      isAuthReady: false,

      /**
       * AÇÃO: Login
       * Busca o usuário na lista local pelo email e senha.
       */
      login: async (email, password) => {
        const user = get().users.find(u => u.email === email && u.password === password);
        if (!user) {
          throw new Error('E-mail ou senha inválidos');
        }
        set({ user });
      },

      /**
       * AÇÃO: Cadastro (Register)
       * Valida se o email já existe e cria um novo ID único para o usuário.
       */
      register: async (name, email, password) => {
        const existingUser = get().users.find(u => u.email === email);
        if (existingUser) {
          throw new Error('E-mail já cadastrado');
        }

        const newUser: User = {
          id: Crypto.randomUUID(), // Gera um ID único e seguro
          name,
          email,
          password
        };

        set({ 
          users: [...get().users, newUser],
          user: newUser
        });
      },

      /**
       * AÇÃO: Logout
       * Apenas remove o usuário da sessão ativa.
       */
      logout: async () => {
        set({ user: null });
      },

      /**
       * AÇÃO: checkAuth
       * Chamada no RootLayout para indicar que o app pode começar a renderizar.
       */
      checkAuth: async () => {
        set({ isAuthReady: true });
      },

      /**
       * AÇÃO: Atualizar Perfil
       * Atualiza o nome do usuário logado e reflete a mudança na lista geral de usuários.
       */
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
      name: 'auth-storage', // Nome da chave no AsyncStorage
      storage: createJSONStorage(() => safeStorage), // Wrapper customizado para o storage
    }
  )
);
