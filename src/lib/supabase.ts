import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { safeStorage } from './storage';

const supabaseUrl = 'https://opwxhabvyjbpqbbgsvsw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wd3hoYWJ2eWpicHFiYmdzdnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MzQ4OTYsImV4cCI6MjA5MDMxMDg5Nn0.rmAO6OtI-heYtVrOaYxpFFDLEnNB0d0iRsU7fDwgOeY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web', // Habilitado na Web para capturar tokens da URL
  },
});