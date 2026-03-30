import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../../src/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // O Supabase processa o token automaticamente ao detectar a mudança de estado.
    // O RootLayout já está escutando mudanças globais, mas aqui garantimos
    // que este componente específico responda ao sucesso.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (session) {
        router.replace('/(tabs)');
      }
    });

    // Verificação extra: se já chegamos aqui com sessão, redireciona
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(tabs)');
      } else {
        // Se após 10 segundos nada acontecer, volta para o welcome (falha no login)
        const timer = setTimeout(() => {
          router.replace('/welcome');
        }, 10000);
        return () => clearTimeout(timer);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}