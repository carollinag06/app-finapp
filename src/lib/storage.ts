import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Verifica se o código está rodando no servidor (SSR), o que acontece em alguns previews Web
const isServer = Platform.OS === 'web' && typeof window === 'undefined';

/**
 * INTERFACE: CustomStorage
 * Define o contrato padrão que o Zustand espera para persistência.
 */
export interface CustomStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

/**
 * CONSTANTE: safeStorage
 * Um wrapper sobre o AsyncStorage que evita erros ao rodar em ambientes onde o storage não está disponível
 * (como durante o Server Side Rendering no ambiente Web).
 */
export const safeStorage: CustomStorage = {
  getItem: async (key: string) => {
    if (isServer) return null;
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (isServer) return;
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (isServer) return;
    return AsyncStorage.removeItem(key);
  },
};
