import { Stack, router, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '../src/lib/supabase';
import { useBudgetStore } from '../store/budgetStore';
import { useCardStore } from '../store/cardStore';
import { useCategoryStore } from '../store/categoryStore';
import { useInvestmentStore } from '../store/investmentStore';
import { useTransactionStore } from '../store/transactionStore';

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
  } catch {
    // Falha silenciosa se não puder criar política (ex: já existe ou restrição de CSP)
  }
}

export default function RootLayout() {
  const rootNavigationState = useRootNavigationState();
  const [isAuthReady, setIsAuthReady] = useState(false);

  const fetchTransactions = useTransactionStore((state) => state.fetchTransactions);
  const fetchBudgets = useBudgetStore((state) => state.fetchBudgets);
  const fetchCards = useCardStore((state) => state.fetchCards);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const fetchInvestments = useInvestmentStore((state) => state.fetchInvestments);

  useEffect(() => {
    // Escuta mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Evento de Auth: ${event}`, session ? 'Sessão Ativa' : 'Sem Sessão');
      setIsAuthReady(true);
      
      if (session) {
        // Se houver sessão, carrega os dados da nuvem
        fetchTransactions();
        fetchBudgets();
        fetchCards();
        fetchCategories();
        fetchInvestments();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchTransactions, fetchBudgets, fetchCards, fetchCategories, fetchInvestments]);

  // Efeito separado para lidar com a navegação inicial após o Root estar montado
  useEffect(() => {
    if (!rootNavigationState?.key || !isAuthReady) return;

    const handleInitialNavigation = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('Navegando para (tabs) - Sessão ativa');
        router.replace('/(tabs)');
      } else {
        console.log('Navegando para welcome - Nenhuma sessão');
        router.replace('/welcome');
      }
    };

    handleInitialNavigation();
  }, [rootNavigationState?.key, isAuthReady]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F0F0F' } }}>
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
          <Stack.Screen
            name="categories"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="new-investment"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="investment-details"
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