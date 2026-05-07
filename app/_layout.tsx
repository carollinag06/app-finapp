import { Stack, router, useRootNavigationState, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
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
  } catch { statistics
    // Falha silenciosa se não puder criar política (ex: já existe ou restrição de CSP)
  }
}

export default function RootLayout() {
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();
  
  const { user, isAuthReady, checkAuth } = useAuthStore();

  const fetchTransactions = useTransactionStore((state) => state.fetchTransactions);
  const resetTransactions = useTransactionStore((state) => state.reset);
  const fetchBudgets = useBudgetStore((state) => state.fetchBudgets);
  const resetBudgets = useBudgetStore((state) => state.reset);
  const fetchCards = useCardStore((state) => state.fetchCards);
  const resetCards = useCardStore((state) => state.reset);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const resetCategories = useCategoryStore((state) => state.reset);
  const fetchInvestments = useInvestmentStore((state) => state.fetchInvestments);
  const resetInvestments = useInvestmentStore((state) => state.reset);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      // Sincronizar dados com o backend quando o usuário estiver logado
      fetchTransactions();
      fetchBudgets();
      fetchCards();
      fetchCategories();
      fetchInvestments();
    } else {
      resetTransactions();
      resetBudgets();
      resetCards();
      resetCategories();
      resetInvestments();
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthReady || !rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'new-transaction' || segments[0] === 'new-card' || segments[0] === 'profile' || segments[0] === 'categories' || segments[0] === 'new-investment' || segments[0] === 'investment-details';

    if (!user && inAuthGroup) {
      router.replace('/welcome');
    } else if (user && !inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isAuthReady, segments, rootNavigationState?.key]);

  if (!isAuthReady) return null;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F0F0F' } }}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="login" />
          <Stack.Screen name="cadastro" />

          {/* Só permite acesso ao grupo (tabs) e modais se houver sessão */}
          {user ? (
            <>
              <Stack.Screen name="(tabs)" />
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
            </>
          ) : null}
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}