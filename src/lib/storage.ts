import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const isServer = Platform.OS === 'web' && typeof window === 'undefined';

export const safeStorage = {
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
