import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '../src/lib/supabase';
import { useTransactionStore } from '../store/transactionStore';
import { useBudgetStore } from '../store/budgetStore';
import { useCardStore } from '../store/cardStore';

// Polyfill para Trusted Types no ambiente Web Preview (Trae)
if (Platform.OS === 'web' && typeof window !== 'undefined' && 'trustedTypes' in window) {
  try {
    // @ts-ignore
    if (!window.trustedTypes.defaultPolicy) {
      // @ts-ignore
      window.trustedTypes.createPolicy('default', {
        createHTML: (string: string) => string,
        createScript: (string: string) => string,
        createScriptURL: (string: string) => string,
      });
    }
  } catch (e) {
    // Falha silenciosa se não puder criar política (ex: já existe ou restrição de CSP)
  }
}

export default function RootLayout() {
  const fetchTransactions = useTransactionStore((state) => state.fetchTransactions);
  const fetchBudgets = useBudgetStore((state) => state.fetchBudgets);
  const fetchCards = useCardStore((state) => state.fetchCards);

  useEffect(() => {
    // Escuta mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Se houver sessão, carrega os dados da nuvem
        fetchTransactions();
        fetchBudgets();
        fetchCards();
        
        // Redireciona para o app apenas se estiver em telas de auth
        // Nota: O router.replace só deve ser chamado se não estivermos já no (tabs)
        // mas para simplificar, deixamos o router lidar com a pilha
      } else if (event === 'SIGNED_OUT') {
        // Apenas redireciona para welcome se o evento for explicitamente de logout
        router.replace('/welcome');
      }
    });

    // Verificação inicial de sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Se não houver sessão inicial, vai para welcome
        router.replace('/welcome');
      } else {
        fetchTransactions();
        fetchBudgets();
        fetchCards();
        router.replace('/(tabs)');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="login" />
          <Stack.Screen name="cadastro" />
          <Stack.Screen name="(tabs)" />

          {/* Modal do botão central flutuante */}
          <Stack.Screen
            name="new-transaction"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Nova Transação',
              headerStyle: { backgroundColor: '#1E1E1E' },
              headerTintColor: '#FFFFFF',
            }}
          />
          <Stack.Screen
            name="new-card"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="profile"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}