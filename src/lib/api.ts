import axios from 'axios';
import { Platform } from 'react-native';
import { safeStorage } from './storage';

// IMPORTANTE: Se estiver usando um celular real ou emulador Android, 
// você deve substituir 'localhost' pelo IP da sua máquina (ex: '192.168.1.15')
const API_URL = Platform.OS === 'web' 
  ? 'http://localhost:3000/api' 
  : 'http://10.0.2.2:3000/api'; // IP padrão para emulador Android acessar o host

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await safeStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
