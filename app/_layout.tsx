import { Stack, router, useRootNavigationState, useSegments } from 'expo-router';
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
  const segments = useSegments();
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [session, setSession] = useState<any>(null);

  const fetchTransactions = useTransactionStore((state) => state.fetchTransactions);
  const fetchBudgets = useBudgetStore((state) => state.fetchBudgets);
  const fetchCards = useCardStore((state) => state.fetchCards);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const fetchInvestments = useInvestmentStore((state) => state.fetchInvestments);

  useEffect(() => {
    // Escuta mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Evento de Auth: ${event}`, session ? 'Sessão Ativa' : 'Sem Sessão');
      setSession(session);
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

  // Efeito centralizado para lidar com a navegação baseada no estado de autenticação
  useEffect(() => {
    // Aguarda a navegação estar pronta e o estado de auth inicial ser carregado
    if (!rootNavigationState?.key || !isAuthReady) return;

    const inAuthGroup = segments[0] === 'welcome' || segments[0] === 'login' || segments[0] === 'cadastro';

    if (session) {
      // Se estiver logado e em uma tela de auth, redireciona para o app
      if (inAuthGroup) {
        console.log('Usuário logado em tela de auth - Redirecionando para (tabs)');
        router.replace('/(tabs)');
      }
    } else {
      // Se NÃO estiver logado e NÃO estiver em uma tela de auth, redireciona para welcome
      if (!inAuthGroup) {
        console.log('Usuário deslogado em tela protegida - Redirecionando para welcome');
        
        // Limpa o histórico para evitar o botão "voltar"
        if (router.canGoBack()) {
          router.dismissAll();
        }
        router.replace('/welcome');
      }
    }
  }, [session, isAuthReady, segments, rootNavigationState?.key]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F0F0F' } }}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="login" />
          <Stack.Screen name="cadastro" />

          {/* Só permite acesso ao grupo (tabs) e modais se houver sessão */}
          {session ? (
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