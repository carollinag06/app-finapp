import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '../src/lib/supabase';
import { useTransactionStore } from '../store/transactionStore';
import { useBudgetStore } from '../store/budgetStore';
import { useCardStore } from '../store/cardStore';

export default function RootLayout() {
  const fetchTransactions = useTransactionStore((state) => state.fetchTransactions);
  const fetchBudgets = useBudgetStore((state) => state.fetchBudgets);
  const fetchCards = useCardStore((state) => state.fetchCards);

  useEffect(() => {
    // Escuta mudanças no estado de autenticação
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Se houver sessão, carrega os dados da nuvem
        fetchTransactions();
        fetchBudgets();
        fetchCards();
        
        router.replace('/(tabs)');
      } else {
        // Se não houver sessão, vai para o login
        router.replace('/login');
      }
    });
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
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